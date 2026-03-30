const { runPrompt } = require('../../lib/ai');
const { promptListing } = require('../../lib/prompts');

function validateListing(v) {
  return v
    && Array.isArray(v.title_options)  && v.title_options.length  >= 2
    && typeof v.description === 'string' && v.description
    && Array.isArray(v.bullet_points)  && v.bullet_points.length  >= 3
    && Array.isArray(v.tags)           && v.tags.length           >= 10
    && Array.isArray(v.ad_copy)        && v.ad_copy.length        >= 2
    && v.social_captions
    && typeof v.social_captions.instagram === 'string';
}

function validateEtsy(output) {
  const issues = [];
  if (output.title_options && output.title_options.some(function(t) { return t.length > 140; }))
    issues.push('One or more titles exceed 140 characters');
  if (!output.tags || output.tags.length !== 13)
    issues.push('Must have exactly 13 tags (got ' + (output.tags ? output.tags.length : 0) + ')');
  if (output.tags && output.tags.some(function(t) { return t.length > 20; }))
    issues.push('One or more tags exceed Etsy 20 character limit');
  const banned = ['best seller', 'guaranteed', '100%', 'cheapest', 'lowest price'];
  if (output.description && banned.some(function(b) { return output.description.toLowerCase().includes(b); }))
    issues.push('Description contains a risky claim - review before publishing');
  return issues;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers, listing } = req.body;
  if (!answers || !listing) return res.status(400).json({ error: 'Missing answers or listing' });

  try {
    const result = await runPrompt(promptListing(answers, listing));

    if (!validateListing(result)) {
      return res.status(422).json({ error: 'Listing generation failed validation. Please try again.' });
    }

    const issues = validateEtsy(result);
    return res.json({ result, issues });

  } catch (e) {
    console.error('generate-listing error:', e);
    return res.status(500).json({ error: e.message || 'Generation failed' });
  }
}
