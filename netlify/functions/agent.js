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
        console.log('RESPONSE:', data.substring(0, 200));
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

exports.handler = async (event) => {
  console.log('METHOD:', event.httpMethod);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

  try {
    const parsed = JSON.parse(event.body);
    console.log('BODY OK, messages:', parsed.messages?.length);
    const { messages, systemPrompt } = parsed;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('KEY EXISTS:', !!apiKey, 'LENGTH:', apiKey?.length);
    if (!apiKey) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'API key não configurada' }) };

    const result = await callAnthropic({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages }, apiKey);
    console.log('RESULT STATUS:', result.status);

    if (result.status !== 200) return { statusCode: result.status, headers: corsHeaders, body: JSON.stringify({ error: result.body.error?.message || JSON.stringify(result.body) }) };

    const reply = Array.isArray(result.body.content)
      ? result.body.content.filter(b => b.type === 'text').map(b => b.text).join('')
      : 'Sem resposta.';

    console.log('REPLY LENGTH:', reply.length);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ reply }) };

  } catch (err) {
    console.log('ERROR:', err.message);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
