// All prompts live here so they can be used by API routes
// and never touch the client bundle

function shopCtx(answers) {
  const visual = Array.isArray(answers.visual_style)
    ? (answers.visual_style[0] || '')
    : (answers.visual_style || '');
  const platforms = (answers.platforms || []).filter(function(p) {
    return p !== 'Just Etsy for now';
  });
  const tone = answers.tone || {};
  return [
    'Shop: '             + (answers.shop_name || 'unknown'),
    'Makes: '            + (answers.what_you_make || 'not provided'),
    'Type: '             + ((answers.seller_type && answers.seller_type.primary) || 'handmade'),
    'Buyer: '            + (answers.ideal_buyer || 'not provided'),
    'Occasions: '        + (answers.occasion || []).join(', '),
    'Tone: warmth '      + (tone.warmth || 2) + '/5, voice ' + (tone.voice || 3) + '/5, style ' + (tone.style || 2) + '/5, language ' + (tone.language || 3) + '/5',
    'Visual: '           + (visual || 'not provided'),
    'Different because: ' + (answers.differentiator || 'not provided'),
    'Price: '            + (answers.price_position || 'mid'),
    'Three words: '      + (answers.three_words || []).filter(Boolean).join(', '),
    'Avoid: '            + (answers.avoid || 'nothing specified'),
    'Platforms: '        + (platforms.length ? platforms.join(', ') : 'Etsy only'),
  ].join('\n');
}

function promptVoice(answers) {
  return 'You are a brand strategist for independent Etsy sellers. Write a brand voice guide for this shop. Be specific to this seller, not generic.\n\n'
    + shopCtx(answers)
    + '\n\nReturn ONLY a JSON object with these exact keys. No markdown, no explanation:\n'
    + '{"summary":"2-3 sentences on how this shop sounds","do":["p1","p2","p3","p4","p5"],"dont":["p1","p2","p3","p4","p5"],"example_phrase":"one listing opening sentence in their voice"}';
}

function promptBuyer(answers) {
  return 'You are a brand strategist for independent Etsy sellers. Write an ideal buyer persona for this shop. Be specific, not generic.\n\n'
    + shopCtx(answers)
    + '\n\nReturn ONLY a JSON object with these exact keys. No markdown, no explanation:\n'
    + '{"name":"realistic first name","profile":"3-4 sentences","motivation":"one sentence","trigger_phrases":["ph1","ph2","ph3","ph4","ph5"]}';
}

function promptPositioning(answers) {
  return 'You are a brand strategist for independent Etsy sellers. Write positioning copy for this shop. Be specific, not generic.\n\n'
    + shopCtx(answers)
    + '\n\nReturn ONLY a JSON object with these exact keys. No markdown, no explanation:\n'
    + '{"positioning_statement":"3-4 sentences defining position and differentiation","tagline_options":["t1","t2","t3"]}';
}

function promptContent(answers) {
  return 'You are a brand strategist for independent Etsy sellers. Write 5 content themes with example captions for this shop. Write in their brand voice.\n\n'
    + shopCtx(answers)
    + '\n\nReturn ONLY a JSON array of exactly 5 items. No markdown, no explanation:\n'
    + '[{"theme":"2-4 word name","description":"one sentence","example_post":"one caption in their voice"}]';
}

function promptSEO(answers) {
  return 'You are an Etsy SEO expert. Write keyword guidance for this shop. Be specific to this seller.\n\n'
    + shopCtx(answers)
    + '\n\nReturn ONLY a JSON object with these exact keys. No markdown, no explanation:\n'
    + '{"primary_keywords":["k1","k2","k3","k4","k5","k6"],"emotional_keywords":["w1","w2","w3","w4","w5"],"avoid_keywords":["a1","a2","a3","a4"]}';
}

function promptListing(answers, listing) {
  return 'You are an expert Etsy listing strategist.\n\n'
    + 'Write a high-converting Etsy listing using the shop brand voice, positioning, and buyer profile.\n'
    + 'Do not write generic content. Everything must feel specific to this shop and this product.\n\n'
    + 'SHOP CONTEXT\n' + shopCtx(answers)
    + '\n\nLISTING INPUTS\n'
    + 'Product name: '      + (listing.product_name || '') + '\n'
    + 'What it is: '        + (listing.what_it_is || '') + '\n'
    + 'Materials: '         + (listing.materials || 'not provided') + '\n'
    + 'Who it is for: '     + (listing.who_it_is_for || '') + '\n'
    + 'Occasion: '          + (listing.occasion || 'not specified') + '\n'
    + 'Key features: '      + (listing.key_features || '') + '\n'
    + 'Personalisation: '   + (listing.personalisation || 'none') + '\n'
    + 'Size / dimensions: ' + (listing.size_dimensions || 'not provided') + '\n'
    + 'Price position: '    + (listing.price_position_override || answers.price_position || 'mid') + '\n'
    + 'Primary keyword: '   + (listing.main_keyword || 'not specified') + '\n'
    + '\nRULES\n'
    + '- Front-load the primary keyword in titles\n'
    + '- Keep titles under 140 characters\n'
    + '- Use natural language, not keyword stuffing\n'
    + '- Write for humans first, search second\n'
    + '- Match the shop tone exactly\n'
    + '- Reflect the ideal buyer motivations\n'
    + '- Avoid banned phrases from shop context\n'
    + '- Do not use emojis or hashtags\n'
    + '\nReturn ONLY a JSON object, no markdown:\n'
    + '{"title_options":["t1","t2","t3"],'
    + '"description":"full description with hook, benefits, details, soft close",'
    + '"bullet_points":["b1","b2","b3","b4","b5"],'
    + '"tags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"],'
    + '"ad_copy":["ad1","ad2","ad3"],'
    + '"social_captions":{"instagram":"caption","pinterest":"caption","tiktok":"caption"},'
    + '"image_prompts":["prompt1","prompt2","prompt3"]}';
}

module.exports = { promptVoice, promptBuyer, promptPositioning, promptContent, promptSEO, promptListing };
