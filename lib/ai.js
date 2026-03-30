const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function safeParseJSON(raw, fallback) {
  try {
    const cleaned = (raw || '').replace(/```json/g, '').replace(/```/g, '').trim();
    const ob = cleaned.indexOf('{');
    const ab = cleaned.indexOf('[');
    let start = -1, end = -1;
    if (ob !== -1 && (ab === -1 || ob < ab)) { start = ob; end = cleaned.lastIndexOf('}') + 1; }
    else if (ab !== -1)                       { start = ab; end = cleaned.lastIndexOf(']') + 1; }
    if (start === -1 || end <= start) return fallback;
    const parsed = JSON.parse(cleaned.slice(start, end));
    if (!parsed || typeof parsed !== 'object') return fallback;
    return parsed;
  } catch (e) { return fallback; }
}

async function runPrompt(prompt) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = (message.content || []).map(function(b) { return b.text || ''; }).join('');
  return safeParseJSON(text, null);
}

module.exports = { runPrompt, safeParseJSON };
