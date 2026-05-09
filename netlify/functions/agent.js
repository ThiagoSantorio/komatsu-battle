const https = require('https');
const http = require('http');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const R2_BASE = 'https://pub-ec19e8b827ee4df8b217a96cd3b1dacc.r2.dev';

const PROSPECTS = {
  komatsu: {
    escavadeira: {
      pc130lc: `${R2_BASE}/Komatsu/Escavadeiras/PC130LC-10M0.pdf`,
      pc160lc: `${R2_BASE}/Komatsu/Escavadeiras/PC160LC-8.pdf`,
      pc200:   `${R2_BASE}/Komatsu/Escavadeiras/PC200-10M0.pdf`,
      pc210:   `${R2_BASE}/Komatsu/Escavadeiras/PC210-10M0.pdf`,
      pc210lc: `${R2_BASE}/Komatsu/Escavadeiras/PC210LC-10M0.pdf`,
      pc240lc: `${R2_BASE}/Komatsu/Escavadeiras/PC240LC-8.pdf`,
      pc360lc: `${R2_BASE}/Komatsu/Escavadeiras/PC360LC-8M2.pdf`,
      pc500lc: `${R2_BASE}/Komatsu/Escavadeiras/PC500LC-10M0.pdf`,
      pc600lc: `${R2_BASE}/Komatsu/Escavadeiras/PC600LC-8.pdf`,
      pc800lc: `${R2_BASE}/Komatsu/Escavadeiras/PC800LC-8.pdf`,
      pc1250:  `${R2_BASE}/Komatsu/Escavadeiras/PC1250-11.pdf`
    },
    carregadeira: {
      wa150:   `${R2_BASE}/Komatsu/Carregadeira/WA150-6.pdf`,
      wa200:   `${R2_BASE}/Komatsu/Carregadeira/WA200-6.pdf`,
      wa320:   `${R2_BASE}/Komatsu/Carregadeira/WA320-6.pdf`,
      wa380:   `${R2_BASE}/Komatsu/Carregadeira/WA380-6.pdf`,
      wa430:   `${R2_BASE}/Komatsu/Carregadeira/WA430-6.pdf`,
      wa470:   `${R2_BASE}/Komatsu/Carregadeira/WA470-6.pdf`,
      wa500:   `${R2_BASE}/Komatsu/Carregadeira/WA500-6.pdf`,
      wa500sh: `${R2_BASE}/Komatsu/Carregadeira/WA500-8SH.pdf`,
      wa600:   `${R2_BASE}/Komatsu/Carregadeira/WA600-6.pdf`,
      wa600sh: `${R2_BASE}/Komatsu/Carregadeira/WA600-8SH.pdf`
    },
    motoniveladora: {
      gd535: `${R2_BASE}/Komatsu/Motoniveladora/GD535-5.pdf`,
      gd655: `${R2_BASE}/Komatsu/Motoniveladora/GD655-5.pdf`
    },
    trator_esteira: {
      d51ex:  `${R2_BASE}/Komatsu/Tratores/D51EX-22.pdf`,
      d61ex:  `${R2_BASE}/Komatsu/Tratores/D61EX-23M0.pdf`,
      d85ex:  `${R2_BASE}/Komatsu/Tratores/D85EX-15E0.pdf`,
      d155ax: `${R2_BASE}/Komatsu/Tratores/D155AX.pdf`,
      d275ax: `${R2_BASE}/Komatsu/Tratores/D275AX.pdf`
    }
  },
  john_deere: {
    escavadeira: {
      jd130p:   `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20130p.pdf`,
      jd160p:   `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20160p.pdf`,
      jd200g:   `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20200g.pdf`,
      jd210p:   `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20210p.pdf`,
      jd250p:   `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20250p.pdf`,
      jd350p:   `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20350p.pdf`,
      jd470glc: `${R2_BASE}/john-deere/Escavadeira/escavadeira%20-%20470glc.pdf`
    },
    carregadeira: {
      jd444g:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20444g.pdf`,
      jd524p:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20524p.pdf`,
      jd544p:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20544p.pdf`,
      jd624p:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20624p.pdf`,
      jd724p:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20724p.pdf`,
      jd744k:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20744k-II%20824k-II%20844k-II.pdf`,
      jd744p:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20744p.pdf`,
      jd844p:     `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20844p.pdf`,
      jd_serie_l: `${R2_BASE}/john-deere/Carregadeira/p%C3%A1%20carregadeira%20-%20serie%20l.pdf`
    },
    motoniveladora: {
      jd620p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20620p.pdf`,
      jd622p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20622p.pdf`,
      jd670p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20670p.pdf`,
      jd672p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20672p.pdf`,
      jd770p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20770p.pdf`,
      jd772p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20772p.pdf`,
      jd870p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20870p.pdf`,
      jd872p: `${R2_BASE}/john-deere/Motoniveladora/motoniveladora%20-%20872p.pdf`
    },
    trator_esteira: {
      jd700j: `${R2_BASE}/john-deere/Trator%20de%20Esteira/Trator%20de%20esteira%20700j.pdf`,
      jd750j: `${R2_BASE}/john-deere/Trator%20de%20Esteira/Trator%20de%20esteira%20750j.pdf`,
      jd850j: `${R2_BASE}/john-deere/Trator%20de%20Esteira/Trator%20de%20esteira%20850j.pdf`
    }
  }
};

function fetchPdfAsBase64(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
  });
}

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
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25'
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
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractText(content) {
  if (!Array.isArray(content)) return String(content || '');
  return content.filter(b => b.type === 'text').map(b => b.text).join('');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };

  try {
    const parsed = JSON.parse(event.body);
    const { messages, systemPrompt, selectedModels, category } = parsed;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'API key não configurada' }) };

    console.log('CATEGORY:', category, 'MODELS:', JSON.stringify(selectedModels));

    // ── Busca PDFs no R2 ──
    const pdfContents = [];
    if (selectedModels && category) {
      const tasks = [
        { brand: 'komatsu', key: 'komatsu', id: selectedModels.komatsu },
        { brand: 'john_deere', key: 'john_deere', id: selectedModels.jd }
      ];
      await Promise.all(tasks.map(async ({ brand, key, id }) => {
        if (!id) return;
        const url = PROSPECTS[key]?.[category]?.[id];
        if (!url) return;
        console.log(`Fetching ${brand} PDF:`, url);
        const b64 = await fetchPdfAsBase64(url);
        if (b64) {
          pdfContents.push({ brand, id, b64 });
          console.log(`${brand} PDF OK, size:`, b64.length);
        } else {
          console.log(`${brand} PDF failed`);
        }
      }));
    }

    // ── Monta mensagem com PDFs embutidos ──
    const lastMsg = messages[messages.length - 1];
    const prevMessages = messages.slice(0, -1);
    const userText = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content);

    const userContent = pdfContents.length > 0
      ? [
          ...pdfContents.map(p => ({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: p.b64 },
            title: `Prospecto ${p.brand} - ${p.id}`,
            context: `Prospecto técnico oficial. Use como fonte primária para responder.`
          })),
          { type: 'text', text: userText }
        ]
      : userText;

    const finalMessages = [...prevMessages, { role: 'user', content: userContent }];

    // ── Chama Claude com PDFs + web_search disponível ──
    const result = await callAnthropic({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
      messages: finalMessages
    }, apiKey);

    if (result.status !== 200) {
      return { statusCode: result.status, headers: corsHeaders, body: JSON.stringify({ error: result.body.error?.message || JSON.stringify(result.body) }) };
    }

    const firstContent = result.body.content || [];
    const stopReason = result.body.stop_reason;
    console.log('STOP REASON:', stopReason);

    // Se fez web_search, continua o loop
    if (stopReason === 'tool_use') {
      const toolUseBlocks = firstContent.filter(b => b.type === 'tool_use');
      const toolResults = toolUseBlocks.map(tb => ({
        type: 'tool_result',
        tool_use_id: tb.id,
        content: `Busca realizada: "${tb.input?.query || ''}"`
      }));

      const second = await callAnthropic({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
        messages: [
          ...finalMessages,
          { role: 'assistant', content: firstContent },
          { role: 'user', content: toolResults }
        ]
      }, apiKey);

      if (second.status !== 200) {
        return { statusCode: second.status, headers: corsHeaders, body: JSON.stringify({ error: second.body.error?.message }) };
      }

      const reply = extractText(second.body.content);
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ reply, source: 'prospecto+web' }) };
    }

    const reply = extractText(firstContent);
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ reply, source: pdfContents.length > 0 ? 'prospecto' : 'dados' }) };

  } catch (err) {
    console.log('ERROR:', err.message);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
