const https = require('https');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function callAnthropic(payload, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('RESPONSE:', data.substring(0, 300));
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error('Parse error: ' + data)); }
      });
    });
    req.on('error', (e) => {
      console.log('REQUEST ERROR:', e.message);
      reject(e);
    });
    req.write(body);
    req.end();
  });
}

// Extrai texto de todos os blocos de conteúdo (text + tool_result)
function extractText(content) {
  if (!Array.isArray(content)) return String(content || '');
  return content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');
}

exports.handler = async (event) => {
  console.log('METHOD:', event.httpMethod);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

  try {
    const parsed = JSON.parse(event.body);
    const { messages, systemPrompt } = parsed;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    console.log('KEY EXISTS:', !!apiKey, 'MESSAGES:', messages?.length);
    if (!apiKey) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'API key não configurada' }) };

    // ── PRIMEIRA CHAMADA: com web_search disponível ──
    const firstCall = await callAnthropic({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3
        }
      ],
      messages
    }, apiKey);

    console.log('FIRST CALL STATUS:', firstCall.status);

    if (firstCall.status !== 200) {
      return {
        statusCode: firstCall.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: firstCall.body.error?.message || JSON.stringify(firstCall.body) })
      };
    }

    const firstContent = firstCall.body.content || [];
    const stopReason = firstCall.body.stop_reason;

    console.log('STOP REASON:', stopReason, 'BLOCKS:', firstContent.map(b => b.type).join(','));

    // Se parou por tool_use (fez busca), precisamos enviar o resultado de volta
    if (stopReason === 'tool_use') {
      const toolUseBlocks = firstContent.filter(b => b.type === 'tool_use');

      // Monta mensagens com o resultado das ferramentas
      const toolResults = toolUseBlocks.map(tb => ({
        type: 'tool_result',
        tool_use_id: tb.id,
        content: tb.input?.query
          ? `Busca realizada: "${tb.input.query}". Resultados disponíveis via web_search.`
          : 'Busca realizada.'
      }));

      const messagesWithTools = [
        ...messages,
        { role: 'assistant', content: firstContent },
        { role: 'user', content: toolResults }
      ];

      // ── SEGUNDA CHAMADA: envia resultados da busca ──
      const secondCall = await callAnthropic({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3
          }
        ],
        messages: messagesWithTools
      }, apiKey);

      console.log('SECOND CALL STATUS:', secondCall.status);

      if (secondCall.status !== 200) {
        return {
          statusCode: secondCall.status,
          headers: corsHeaders,
          body: JSON.stringify({ error: secondCall.body.error?.message || JSON.stringify(secondCall.body) })
        };
      }

      const reply = extractText(secondCall.body.content);
      console.log('REPLY LENGTH (2nd):', reply.length);
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ reply }) };
    }

    // Parou normalmente (end_turn) — extrai texto direto
    const reply = extractText(firstContent);
    console.log('REPLY LENGTH:', reply.length);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ reply }) };

  } catch (err) {
    console.log('ERROR:', err.message);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
