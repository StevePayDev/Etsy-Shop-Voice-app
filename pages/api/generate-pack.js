const { runPrompt } = require('../../lib/ai');
const { promptVoice, promptBuyer, promptPositioning, promptContent, promptSEO } = require('../../lib/prompts');

function validate(label, v, checks) {
  for (const [key, test] of checks) {
    if (!test(v)) return label + ' missing ' + key;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers, section } = req.body;
  if (!answers) return res.status(400).json({ error: 'Missing answers' });

  try {
    // Single section regeneration
    if (section) {
      const prompts = {
        voice:    promptVoice(answers),
        buyer:    promptBuyer(answers),
        position: promptPositioning(answers),
        content:  promptContent(answers),
        seo:      promptSEO(answers),
      };
      if (!prompts[section]) return res.status(400).json({ error: 'Unknown section' });
      const result = await runPrompt(prompts[section]);
      return res.json({ section, result });
    }

    // Full pack: sequential calls
    const voice_guide    = await runPrompt(promptVoice(answers));
    const buyer_persona  = await runPrompt(promptBuyer(answers));
    const pos            = await runPrompt(promptPositioning(answers));
    const content_themes = await runPrompt(promptContent(answers));
    const seo_language   = await runPrompt(promptSEO(answers));

    const errors = [
      validate('voice_guide',    voice_guide,    [['summary', function(v) { return v && v.summary; }], ['do', function(v) { return Array.isArray(v && v.do) && v.do.length >= 3; }]]),
      validate('buyer_persona',  buyer_persona,  [['name', function(v) { return v && v.name; }],       ['profile', function(v) { return v && v.profile; }]]),
      validate('positioning',    pos,            [['statement', function(v) { return v && v.positioning_statement; }]]),
      validate('content_themes', content_themes, [['array', function(v) { return Array.isArray(v) && v.length >= 3; }]]),
      validate('seo_language',   seo_language,   [['keywords', function(v) { return v && Array.isArray(v.primary_keywords) && v.primary_keywords.length >= 3; }]]),
    ].filter(Boolean);

    if (errors.length) return res.status(422).json({ error: errors.join(', ') });

    return res.json({
      voice_guide,
      buyer_persona,
      positioning_statement: pos.positioning_statement,
      tagline_options: pos.tagline_options,
      content_themes,
      seo_language,
    });

  } catch (e) {
    console.error('generate-pack error:', e);
    return res.status(500).json({ error: e.message || 'Generation failed' });
  }
}
