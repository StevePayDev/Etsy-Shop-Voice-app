import { useState, useEffect, useRef } from 'react';

const C = {
  ink:      '#1a1208',
  paper:    '#faf6ef',
  paperDim: '#f2ece0',
  gold:     '#b8892a',
  goldPale: '#f5e9c8',
  goldMid:  '#d4a843',
  muted:    '#8a7a62',
  border:   '#e0d5c0',
  white:    '#ffffff',
  sage:     '#4a6e4c',
  sagePale: '#eaf2ea',
  rust:     '#9b4a2a',
};

const QUESTIONS = [
  { id: 'shop_name', step: 1, type: 'text', label: 'What is your shop called?', sublabel: 'Or what are you thinking of calling it?', placeholder: 'e.g. The Wild Fig Studio', maxLength: 60, required: true },
  { id: 'what_you_make', step: 2, type: 'text', label: 'What do you make or sell?', sublabel: 'Be specific - not just the category but the style, material, and feeling.', placeholder: 'e.g. Hand-stamped silver jewellery - small, meaningful pieces for women who want something personal', hint: 'Tip: jewellery is a category. Delicate hand-stamped silver pieces for quiet gifting moments is a product.', maxLength: 200, required: true },
  { id: 'seller_type', step: 3, type: 'primary_secondary', label: 'What best describes your shop?', sublabel: 'Pick your primary type first, then add any that also apply.', options: ['Handmade physical items','Digital downloads','Printables','Personalised / custom orders','Print on demand','Vintage or curated finds','Craft supplies or materials','Candles, wax melts or home fragrance','Art prints or illustrations','Clothing or accessories','Stationery or paper goods','Gifts and occasion items'], required: true },
  { id: 'ideal_buyer', step: 4, type: 'text', label: 'Who is your ideal buyer?', sublabel: 'Picture one real person, not a broad demographic.', placeholder: 'e.g. Sarah, late 30s, buys on Etsy because she wants something thoughtful. She reads the shop story before she buys.', hint: 'One real person beats a vague audience every time.', maxLength: 300, required: true },
  { id: 'occasion', step: 5, type: 'chips', label: 'What occasions do people buy your products for?', sublabel: 'Choose everything that applies.', options: ['Gifts for others','Self-treat / self-care','Birthdays','Weddings','Christmas / seasonal','New baby','Anniversaries','Home decor','Everyday use','Celebrations','Thank you gifts','Mothers Day / Fathers Day'], multi: true, required: true },
  { id: 'tone', step: 6, type: 'scale_pair', label: 'How should your shop feel?', sublabel: 'Adjust each slider to where your brand sits.', pairs: [{ id: 'warmth', left: 'Warm and cosy', right: 'Clean and minimal' },{ id: 'voice', left: 'Playful and fun', right: 'Calm and considered' },{ id: 'style', left: 'Rustic and handmade', right: 'Polished and refined' },{ id: 'language', left: 'Casual and chatty', right: 'Elegant and precise' }], defaults: { warmth: 2, voice: 3, style: 2, language: 3 }, required: true },
  { id: 'visual_style', step: 7, type: 'chips', label: 'What does your shop look like?', sublabel: 'Pick the visual feeling that matches your photos and aesthetic.', hint: 'This shapes your mockup descriptions and social content.', options: ['Earthy and natural','Muted and moody','Bright and colourful','Minimal and clean','Rustic and textured','Romantic and soft','Bold and graphic','Playful and illustrated','Dark and dramatic','Airy and light'], multi: false, required: true },
  { id: 'differentiator', step: 8, type: 'text', label: 'What makes your shop different?', sublabel: 'Your process, your story, your materials - what makes someone choose you?', placeholder: 'e.g. Every piece is made to order in my kitchen studio. I hand-stamp each one individually. I include a handwritten note with every order.', hint: 'Struggling? Think about what a happy customer said that made you feel proud.', maxLength: 300, required: true },
  { id: 'price_position', step: 9, type: 'price_pick', label: 'Where does your shop sit on price?', sublabel: 'Be honest. This shapes the tone and language of everything we write.', options: [{ id: 'budget', label: 'Accessible', sub: 'Affordable everyday prices. Value matters.' },{ id: 'mid', label: 'Mid-range', sub: 'Fair price for quality. Not the cheapest, not the most expensive.' },{ id: 'premium', label: 'Premium', sub: 'Higher price point. Quality, craft, and experience justify the cost.' }], required: true },
  { id: 'three_words', step: 10, type: 'word_trio', label: 'Three words that describe your shop personality.', sublabel: 'First instinct. All three required.', placeholders: ['e.g. Warm', 'e.g. Personal', 'e.g. Considered'], required: true },
  { id: 'avoid', step: 11, type: 'text', label: 'What should your shop never sound like?', sublabel: 'This helps us filter out tones and phrases that feel wrong for your brand.', placeholder: 'e.g. No hard sell, no fake urgency, nothing copied from Amazon listings.', hint: 'Knowing what to avoid is just as useful as knowing what to aim for.', maxLength: 200, required: false },
  { id: 'platforms', step: 12, type: 'chips', label: 'Where do you want to show up beyond Etsy?', sublabel: 'We will shape your content output around these platforms.', options: ['Instagram','Pinterest','Facebook','TikTok','Email newsletter','Just Etsy for now'], multi: true, required: true },
];

const TOTAL = QUESTIONS.length;

// ── Local interpretation helpers (no API needed) ──────────────────────────────
function interpretTone(tone) {
  const t = tone || {};
  return {
    w: (t.warmth   || 2) <= 2 ? 'warm'          : (t.warmth   || 2) >= 4 ? 'clean'      : 'balanced',
    v: (t.voice    || 3) <= 2 ? 'playful'       : (t.voice    || 3) >= 4 ? 'considered' : 'approachable',
    s: (t.style    || 2) <= 2 ? 'handmade'      : (t.style    || 2) >= 4 ? 'refined'    : 'crafted',
    l: (t.language || 3) <= 2 ? 'conversational': (t.language || 3) >= 4 ? 'elegant'    : 'clear',
  };
}
function getTypeLabel(primary) {
  const p = (primary || '').toLowerCase();
  if (p.includes('digital'))   return 'digital products';
  if (p.includes('candle'))    return 'home fragrance';
  if (p.includes('art print')) return 'art prints';
  if (p.includes('clothing'))  return 'wearable pieces';
  if (p.includes('stationery'))return 'paper goods';
  if (p.includes('printable')) return 'printables';
  if (p.includes('vintage'))   return 'curated vintage finds';
  if (p.includes('gift'))      return 'gift pieces';
  return 'handmade pieces';
}
function getVisual(answers) {
  const v = answers.visual_style;
  return Array.isArray(v) ? (v[0] || '') : (v || '');
}
function isGiftShop(answers) {
  const g = ['Gifts for others','Birthdays','Weddings','Anniversaries','Thank you gifts','Mothers Day / Fathers Day'];
  return (answers.occasion || []).some(function(o) { return g.indexOf(o) !== -1; });
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function buildEssence(answers) {
  const tone = interpretTone(answers.tone);
  const price = answers.price_position || 'mid';
  const words = (answers.three_words || []).filter(Boolean).map(function(x) { return x.toLowerCase(); });
  const tLabel = getTypeLabel(answers.seller_type && answers.seller_type.primary);
  const pAdj = price === 'premium' ? 'premium' : price === 'budget' ? 'accessible' : 'quality';
  const w1 = words[0] || tone.w;
  const w2 = words[1] || tone.v;
  const whom = isGiftShop(answers) ? 'for buyers who want gifts with meaning' : 'for buyers who want something distinct';
  return cap(w1) + ', ' + w2 + ' ' + pAdj + ' ' + tLabel + ' ' + whom + '.';
}
function buildVoicePreview(answers) {
  const tone = interpretTone(answers.tone);
  const words = (answers.three_words || []).filter(Boolean).map(function(x) { return x.toLowerCase(); });
  const pool = words.slice();
  [tone.w, tone.v, tone.l].forEach(function(d) { if (pool.indexOf(d) === -1 && d !== 'clear' && d !== 'balanced') pool.push(d); });
  if (answers.price_position === 'premium' && pool.indexOf('elevated') === -1) pool.push('elevated');
  const avoid = answers.avoid || '';
  const anti = avoid.trim() ? ' - never ' + avoid.split(/[,.!]/)[0].toLowerCase().trim() : '';
  return pool.slice(0, 4).join(', ') + anti;
}
function buildBuyerPreview(answers) {
  const occ = answers.occasion || [];
  const price = answers.price_position || 'mid';
  const gift = isGiftShop(answers);
  const selfTr = occ.indexOf('Self-treat / self-care') !== -1 || occ.indexOf('Everyday use') !== -1;
  const home = occ.indexOf('Home decor') !== -1;
  const motive = gift ? 'They buy because they want a gift that feels chosen, not grabbed'
    : selfTr ? 'They buy for themselves - something that feels like a small, considered indulgence'
    : home ? 'They buy to make their space feel personal and intentional'
    : 'They buy when something stops them mid-scroll and feels exactly right';
  const pNote = price === 'premium' ? 'Price is not the deciding factor - trust and quality are.'
    : price === 'budget' ? 'They are value-aware and appreciate honest pricing.'
    : 'They will pay fairly for something that feels worth it.';
  return motive + '. ' + pNote;
}
function buildPositioningPreview(answers) {
  const tone = interpretTone(answers.tone);
  const price = answers.price_position || 'mid';
  const tLabel = getTypeLabel(answers.seller_type && answers.seller_type.primary);
  const visual = getVisual(answers);
  const craft = tone.s === 'handmade' ? 'made by hand' : tone.s === 'refined' ? 'crafted with precision' : 'made with care';
  const pAngle = price === 'premium' ? 'a premium price that reflects genuine craft'
    : price === 'budget' ? 'accessible prices without sacrificing character'
    : 'quality that justifies the cost';
  const gPart = isGiftShop(answers) ? ', sold primarily as gifts people are proud to give' : '';
  const vPart = visual ? ' with a ' + visual.toLowerCase().split(' ')[0] + ' visual identity' : '';
  return cap(tLabel) + ' ' + craft + vPart + gPart + ' - positioned at ' + pAngle + '.';
}
function buildEdgePreview(answers) {
  const diff = answers.differentiator || '';
  const tone = interpretTone(answers.tone);
  const words = (answers.three_words || []).filter(Boolean).map(function(x) { return x.toLowerCase(); });
  if (diff.trim()) {
    const clean = diff.replace(/^(e\.g\.?\s*|for example\s*)/i, '').trim();
    const clause = clean.split(/[.,]/)[0].trim();
    const short = clause.length > 80 ? clause.slice(0, 77) + '...' : clause;
    return short.endsWith('.') ? short : short + '.';
  }
  const w1 = words[0] || (tone.s === 'handmade' ? 'handmade' : 'crafted');
  return 'A ' + w1 + ' approach that feels personal where most shops feel mass-produced.';
}

// ── API caller ────────────────────────────────────────────────────────────────
async function callAPI(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Shared UI components ──────────────────────────────────────────────────────
function CopyBtn({ text, small }) {
  const [done, setDone] = useState(false);
  function handle() {
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setDone(true);
    setTimeout(function() { setDone(false); }, 2000);
  }
  return (
    <button onClick={handle} style={{ background: done ? C.sage : 'transparent', border: '1px solid ' + (done ? C.sage : C.border), color: done ? C.white : C.muted, borderRadius: 4, padding: small ? '3px 9px' : '5px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em', transition: 'all 0.2s', flexShrink: 0 }}>
      {done ? '\u2713 COPIED' : 'COPY'}
    </button>
  );
}

function Pill({ text, copyable }) {
  const [done, setDone] = useState(false);
  function handleClick() {
    if (!copyable) return;
    try { navigator.clipboard.writeText(text); } catch (e) {}
    setDone(true);
    setTimeout(function() { setDone(false); }, 1500);
  }
  return (
    <span onClick={handleClick} style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 20, border: '1px solid ' + (done ? C.sage : C.border), background: done ? C.sagePale : C.paperDim, fontSize: 13, color: done ? C.sage : C.ink, margin: '3px 4px 3px 0', cursor: copyable ? 'pointer' : 'default', transition: 'all 0.15s' }}>
      {done ? '\u2713 ' + text : text}
    </span>
  );
}

function Section({ label, icon, children }) {
  return (
    <div style={{ background: C.white, border: '1px solid ' + C.border, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span style={{ color: C.gold, fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', color: C.muted, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

function HintBox({ text }) {
  return (
    <div style={{ background: C.sagePale, borderLeft: '3px solid ' + C.sage, borderRadius: '0 6px 6px 0', padding: '9px 13px', marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: C.sage, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  const showTime = current >= 4;
  const rem = total - current;
  const timeLabel = rem <= 2 ? 'Almost done' : ('~' + rem + ' min left');
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted }}>{current} of {total}</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: showTime ? C.sage : C.gold }}>{showTime ? timeLabel : pct + '%'}</span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg,' + C.gold + ',' + C.goldMid + ')', borderRadius: 2, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

function ChipGroup({ options, value = [], multi, onChange }) {
  function toggle(opt) {
    if (multi) { onChange(value.includes(opt) ? value.filter(function(v) { return v !== opt; }) : value.concat([opt])); }
    else { onChange([opt]); }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 4 }}>
      {options.map(function(opt) {
        const active = value.includes(opt);
        return (
          <button key={opt} onClick={function() { toggle(opt); }} style={{ padding: '8px 15px', borderRadius: 24, border: '1.5px solid ' + (active ? C.gold : C.border), background: active ? C.goldPale : C.white, color: active ? C.ink : C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
            {active && <span style={{ marginRight: 4, fontSize: 10 }}>\u2713</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function PrimarySecondary({ options, value = { primary: null, secondary: [] }, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.gold, marginBottom: 10 }}>PRIMARY TYPE</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 20 }}>
        {options.map(function(opt) {
          const active = value.primary === opt;
          return (
            <button key={opt} onClick={function() { onChange({ primary: opt, secondary: (value.secondary || []).filter(function(s) { return s !== opt; }) }); }} style={{ padding: '8px 15px', borderRadius: 24, border: '1.5px solid ' + (active ? C.gold : C.border), background: active ? C.goldPale : C.white, color: active ? C.ink : C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
              {active && <span style={{ marginRight: 4, fontSize: 10 }}>\u25cf</span>}
              {opt}
            </button>
          );
        })}
      </div>
      {value.primary && (
        <>
          <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 10 }}>ALSO APPLIES (optional)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {options.filter(function(o) { return o !== value.primary; }).map(function(opt) {
              const active = (value.secondary || []).includes(opt);
              return (
                <button key={opt} onClick={function() { const s = value.secondary || []; onChange(Object.assign({}, value, { secondary: active ? s.filter(function(x) { return x !== opt; }) : s.concat([opt]) })); }} style={{ padding: '7px 14px', borderRadius: 24, border: '1.5px solid ' + (active ? C.goldMid : C.border), background: active ? C.paperDim : 'transparent', color: active ? C.ink : C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                  {active && <span style={{ marginRight: 4, fontSize: 10 }}>\u2713</span>}
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ScalePairs({ pairs, value = {}, onChange, defaults = {} }) {
  useEffect(function() {
    const needs = {};
    pairs.forEach(function(p) { if (value[p.id] === undefined) needs[p.id] = defaults[p.id] != null ? defaults[p.id] : 3; });
    if (Object.keys(needs).length) onChange(Object.assign({}, value, needs));
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 4 }}>
      {pairs.map(function(pair) {
        const v = value[pair.id] != null ? value[pair.id] : (defaults[pair.id] != null ? defaults[pair.id] : 3);
        return (
          <div key={pair.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: v <= 2 ? C.gold : C.muted, fontWeight: v <= 2 ? 600 : 400 }}>{pair.left}</span>
              <span style={{ fontSize: 12, color: v >= 4 ? C.gold : C.muted, fontWeight: v >= 4 ? 600 : 400 }}>{pair.right}</span>
            </div>
            <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: C.border, borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 0, width: ((v - 1) / 4 * 100) + '%', height: 3, background: C.gold, borderRadius: 2 }} />
              <input type='range' min={1} max={5} value={v} onChange={function(e) { onChange(Object.assign({}, value, { [pair.id]: Number(e.target.value) })); }} style={{ position: 'relative', width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', margin: 0 }} />
            </div>
          </div>
        );
      })}
      <style>{'input[type=range]::-webkit-slider-thumb{appearance:none;width:20px;height:20px;border-radius:50%;background:' + C.gold + ';border:2px solid ' + C.white + ';box-shadow:0 1px 4px rgba(0,0,0,0.18);cursor:pointer;}input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:' + C.gold + ';border:2px solid ' + C.white + ';cursor:pointer;}'}</style>
    </div>
  );
}

function PricePick({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
      {options.map(function(opt) {
        const active = value === opt.id;
        return (
          <button key={opt.id} onClick={function() { onChange(opt.id); }} style={{ textAlign: 'left', padding: '14px 18px', border: '1.5px solid ' + (active ? C.gold : C.border), borderRadius: 10, background: active ? C.goldPale : C.white, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: active ? C.ink : C.muted, marginBottom: 3 }}>{active && <span style={{ marginRight: 6, color: C.gold }}>\u25cf</span>}{opt.label}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{opt.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

function WordTrio({ placeholders, value = ['', '', ''], onChange }) {
  function update(i, v) { const n = value.slice(); n[i] = v; onChange(n); }
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
      {placeholders.map(function(ph, i) {
        return (
          <div key={i} style={{ flex: 1, minWidth: 90 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 6 }}>WORD {i + 1}</div>
            <input value={value[i] || ''} onChange={function(e) { update(i, e.target.value); }} placeholder={ph}
              onFocus={function(e) { e.target.style.borderColor = C.gold; }}
              onBlur={function(e) { e.target.style.borderColor = (value[i] || '').trim() ? C.gold : C.border; }}
              style={{ width: '100%', padding: '11px 12px', border: '1.5px solid ' + ((value[i] || '').trim() ? C.gold : C.border), borderRadius: 8, fontSize: 15, fontFamily: 'inherit', color: C.ink, background: C.white, textAlign: 'center', fontWeight: 600, transition: 'border-color 0.2s' }} />
          </div>
        );
      })}
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ currentStep }) {
  const steps = [
    'Reading your answers...',
    'Writing your brand voice guide...',
    'Building your ideal buyer profile...',
    'Defining your positioning...',
    'Creating your content themes...',
    'Writing your SEO keywords...',
  ];
  const idx = currentStep > 0 ? currentStep - 1 : 0;
  const pct = Math.round(((idx + 1) / steps.length) * 100);
  return (
    <div style={{ minHeight: '100vh', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} *{box-sizing:border-box}'}</style>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 24, animation: 'pulse 1.4s ease infinite' }}>\u2736</div>
        <div style={{ height: 2, background: '#2a2010', borderRadius: 1, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ height: '100%', width: pct + '%', background: C.gold, borderRadius: 1, transition: 'width 0.8s ease' }} />
        </div>
        {steps.map(function(s, i) {
          return <div key={i} style={{ fontSize: 14, color: i === idx ? C.goldMid : i < idx ? '#4a4030' : '#2a2010', padding: '5px 0', transition: 'color 0.4s', fontWeight: i === idx ? 500 : 400 }}>{s}</div>;
        })}
      </div>
    </div>
  );
}

// ── Identity Preview ──────────────────────────────────────────────────────────
function IdentityPreview({ answers, onEdit, onGenerate, generating, generatingStep }) {
  const essence = buildEssence(answers);
  const cards = [
    { label: 'VOICE',       value: buildVoicePreview(answers),       icon: '\u2736', desc: 'How your shop speaks'     },
    { label: 'IDEAL BUYER', value: buildBuyerPreview(answers),       icon: '\u25c8', desc: 'Who you are writing for'  },
    { label: 'POSITIONING', value: buildPositioningPreview(answers), icon: '\u25c9', desc: 'What makes you different' },
    { label: 'YOUR EDGE',   value: buildEdgePreview(answers),        icon: '\u25c7', desc: 'The angle your shop owns' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: C.paper, padding: '32px 24px 60px', maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}'}</style>
      <div style={{ animation: 'fadeUp 0.5s ease' }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: C.gold, marginBottom: 8 }}>YOUR BRAND PROFILE</div>
        <div style={{ background: C.ink, borderRadius: 12, padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: C.gold, marginBottom: 10 }}>BRAND ESSENCE</div>
          <p style={{ fontSize: 16, color: C.paper, lineHeight: 1.65, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{essence}</p>
        </div>
        {cards.map(function(card) {
          return (
            <div key={card.label} style={{ background: C.white, border: '1px solid ' + C.border, borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ color: C.gold, fontSize: 18, flexShrink: 0, marginTop: 1 }}>{card.icon}</span>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: C.muted }}>{card.label}</span>
                  <span style={{ fontSize: 11, color: C.border }}>.</span>
                  <span style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>{card.desc}</span>
                </div>
                <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{card.value}</div>
              </div>
            </div>
          );
        })}
        {generating && (
          <div style={{ background: C.paperDim, borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 16, height: 16, border: '2px solid ' + C.gold, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: C.muted }}>
              {['', 'Writing brand voice...', 'Building buyer profile...', 'Defining positioning...', 'Creating content themes...', 'Writing SEO keywords...'][generatingStep] || 'Generating...'}
            </span>
          </div>
        )}
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, textAlign: 'center', margin: '20px 0 24px', fontStyle: 'italic' }}>
          This profile shapes your listings, captions, and content going forward.
        </p>
        <button onClick={onGenerate} disabled={generating} style={{ width: '100%', background: generating ? C.border : C.ink, color: generating ? C.muted : C.paper, border: 'none', borderRadius: 8, padding: '15px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', marginBottom: 10, letterSpacing: '0.03em', transition: 'all 0.2s' }}>
          {generating ? 'Building your identity pack...' : 'Build my full identity pack'}
        </button>
        <button onClick={onEdit} style={{ width: '100%', background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '11px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
          Edit my answers
        </button>
      </div>
    </div>
  );
}

// ── Identity Pack ─────────────────────────────────────────────────────────────
function IdentityPack({ answers, pack, onBack, onStartListing }) {
  const shop = answers.shop_name || 'Your Shop';
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: 'system-ui, sans-serif' }}>
      <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}'}</style>
      <div style={{ background: C.ink, padding: '20px 24px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: C.gold, marginBottom: 6 }}>BRAND IDENTITY PACK</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontSize: 26, fontWeight: 400, color: C.paper, margin: 0, fontFamily: 'Georgia, serif' }}>{shop}</h1>
            <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #3a3020', color: C.muted, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '24px 24px 60px', animation: 'fadeUp 0.4s ease' }}>
        <div style={{ background: C.ink, borderRadius: 12, padding: '22px 24px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', color: C.gold }}>POSITIONING STATEMENT</span>
            <CopyBtn text={pack.positioning_statement || ''} />
          </div>
          <p style={{ fontSize: 15, color: C.paper, lineHeight: 1.7, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{pack.positioning_statement}</p>
        </div>
        <Section label='TAGLINE OPTIONS' icon='\u2736'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(pack.tagline_options || []).map(function(t, i) {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: C.paperDim, borderRadius: 8 }}>
                  <span style={{ fontSize: 14, color: C.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{t}</span>
                  <CopyBtn text={t} small />
                </div>
              );
            })}
          </div>
        </Section>
        <Section label='BRAND VOICE GUIDE' icon='\u2727'>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.65, margin: '0 0 16px' }}>{pack.voice_guide && pack.voice_guide.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.sage, marginBottom: 8 }}>DO</div>
              {(pack.voice_guide && pack.voice_guide.do || []).map(function(d, i) {
                return <div key={i} style={{ fontSize: 13, color: C.ink, padding: '4px 0', display: 'flex', gap: 8, lineHeight: 1.4 }}><span style={{ color: C.sage, flexShrink: 0 }}>\u2713</span>{d}</div>;
              })}
            </div>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.rust, marginBottom: 8 }}>DON'T</div>
              {(pack.voice_guide && pack.voice_guide.dont || []).map(function(d, i) {
                return <div key={i} style={{ fontSize: 13, color: C.ink, padding: '4px 0', display: 'flex', gap: 8, lineHeight: 1.4 }}><span style={{ color: C.rust, flexShrink: 0 }}>\u2715</span>{d}</div>;
              })}
            </div>
          </div>
          {pack.voice_guide && pack.voice_guide.example_phrase && (
            <div style={{ background: C.goldPale, borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: C.gold, letterSpacing: '0.1em', marginBottom: 5 }}>EXAMPLE IN YOUR VOICE</div>
                <p style={{ fontSize: 13, color: C.ink, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{pack.voice_guide.example_phrase}</p>
              </div>
              <CopyBtn text={pack.voice_guide.example_phrase} small />
            </div>
          )}
        </Section>
        <Section label='IDEAL BUYER PERSONA' icon='\u25c8'>
          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.goldPale, border: '2px solid ' + C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {(pack.buyer_persona && pack.buyer_persona.name || 'B')[0]}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 4 }}>{pack.buyer_persona && pack.buyer_persona.name}</div>
              <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>{pack.buyer_persona && pack.buyer_persona.motivation}</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.65, margin: '0 0 16px' }}>{pack.buyer_persona && pack.buyer_persona.profile}</p>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>PHRASES THAT RESONATE</div>
          <div>{(pack.buyer_persona && pack.buyer_persona.trigger_phrases || []).map(function(p, i) { return <Pill key={i} text={p} copyable />; })}</div>
        </Section>
        <Section label='CONTENT THEMES' icon='\u25c9'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(pack.content_themes || []).map(function(t, i) {
              return (
                <div key={i} style={{ borderLeft: '3px solid ' + C.gold, paddingLeft: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 3 }}>{t.theme}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>{t.description}</div>
                  {t.example_post && (
                    <div style={{ background: C.paperDim, borderRadius: 6, padding: '9px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, fontStyle: 'italic' }}>{t.example_post}</span>
                      <CopyBtn text={t.example_post} small />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
        <Section label='SEO AND KEYWORD GUIDE' icon='\u25c7'>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>USE IN TITLES AND DESCRIPTIONS</div>
            <div>{(pack.seo_language && pack.seo_language.primary_keywords || []).map(function(k, i) { return <Pill key={i} text={k} copyable />; })}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 8 }}>EMOTIONAL WORDS THAT CONVERT</div>
            <div>{(pack.seo_language && pack.seo_language.emotional_keywords || []).map(function(k, i) { return <Pill key={i} text={k} copyable />; })}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.rust, marginBottom: 8 }}>WORDS TO AVOID</div>
            <div>{(pack.seo_language && pack.seo_language.avoid_keywords || []).map(function(k, i) {
              return <span key={i} style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 20, border: '1px solid #e8c8c0', background: '#fff5f2', fontSize: 13, color: C.rust, margin: '3px 4px 3px 0', textDecoration: 'line-through' }}>{k}</span>;
            })}</div>
          </div>
        </Section>
        <div style={{ background: C.ink, borderRadius: 12, padding: '22px 24px', marginTop: 8 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', color: C.gold, marginBottom: 8 }}>NEXT STEP</div>
          <p style={{ fontSize: 14, color: '#a8a090', lineHeight: 1.6, margin: '0 0 16px' }}>Your brand profile is ready. Use it to write listings, social posts, and email copy - all in your voice, all consistent.</p>
          <button onClick={onStartListing} style={{ width: '100%', background: C.gold, color: C.ink, border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}>
            Start writing my listings
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Listing components (Dashboard, Input, Output) are in separate files ───────
// imported below
import ListingDashboard from '../components/ListingDashboard';
import ListingInput from '../components/ListingInput';
import ListingOutput from '../components/ListingOutput';

// ── Main app ──────────────────────────────────────────────────────────────────
export default function ShopVoiceApp() {
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState({});
  const [phase, setPhase]         = useState('questions');
  const [savedPulse, setSavedPulse] = useState(false);
  const [pack, setPack]           = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [generatingStep, setGeneratingStep] = useState(0);
  const [listing, setListing]     = useState({});
  const [listingOutput, setListingOutput] = useState(null);
  const [listingGenerating, setListingGenerating] = useState(false);
  const [listingError, setListingError] = useState('');
  const [etsyIssues, setEtsyIssues] = useState([]);
  const [listingHistory, setListingHistory] = useState(function() {
    try { return JSON.parse(localStorage.getItem('siq_listings') || '[]'); }
    catch (e) { return []; }
  });
  const inputRef = useRef(null);

  useEffect(function() {
    try {
      const sa = localStorage.getItem('siq_v4_answers');
      const ss = localStorage.getItem('siq_v4_step');
      const sp = localStorage.getItem('siq_v4_pack');
      if (sa) setAnswers(JSON.parse(sa));
      if (ss) setStep(Number(ss));
      if (sp) { setPack(JSON.parse(sp)); setPhase('pack'); }
    } catch (e) {}
  }, []);

  useEffect(function() {
    try {
      localStorage.setItem('siq_v4_answers', JSON.stringify(answers));
      localStorage.setItem('siq_v4_step', String(step));
    } catch (e) {}
    if (step > 0) {
      setSavedPulse(true);
      const t = setTimeout(function() { setSavedPulse(false); }, 1800);
      return function() { clearTimeout(t); };
    }
  }, [step, answers]);

  useEffect(function() {
    if (listingOutput) {
      const entry = { id: Date.now(), listing: listing, output: listingOutput, date: Date.now() };
      const next = [entry].concat(listingHistory.filter(function(h) { return h.listing.product_name !== listing.product_name; }).slice(0, 19));
      setListingHistory(next);
      try { localStorage.setItem('siq_listings', JSON.stringify(next)); } catch (e) {}
    }
  }, [listingOutput]);

  useEffect(function() {
    if (step > 0 && phase === 'questions' && inputRef.current) {
      setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 300);
    }
  }, [step, phase]);

  async function generatePack() {
    setPhase('generating');
    setGeneratingStep(0);
    setErrorMsg('');
    try {
      setGeneratingStep(1);
      const res = await callAPI('/api/generate-pack', { answers });
      setPack(res);
      try { localStorage.setItem('siq_v4_pack', JSON.stringify(res)); } catch (e) {}
      setPhase('pack');
    } catch (e) {
      setErrorMsg(e.message || 'Generation failed. Please try again.');
      setPhase('error');
    }
  }

  async function handleGenerateListing() {
    setListingGenerating(true);
    setListingError('');
    setEtsyIssues([]);
    try {
      const res = await callAPI('/api/generate-listing', { answers, listing });
      setListingOutput(res.result);
      setEtsyIssues(res.issues || []);
      setPhase('listing_output');
    } catch (e) {
      setListingError(e.message || 'Listing generation failed. Please try again.');
    } finally {
      setListingGenerating(false);
    }
  }

  async function regenerateSection(section) {
    setListingGenerating(true);
    setListingError('');
    try {
      const res = await callAPI('/api/generate-listing', { answers, listing });
      if (!res.result || !res.result[section]) throw new Error('Section regeneration returned no content.');
      setListingOutput(function(prev) { return Object.assign({}, prev, { [section]: res.result[section] }); });
    } catch (e) {
      setListingError(e.message || 'Section regeneration failed.');
    } finally {
      setListingGenerating(false);
    }
  }

  const q = QUESTIONS[step - 1];
  function getValue() { return q ? answers[q.id] : undefined; }
  function setAnswer(val) { setAnswers(function(prev) { const next = Object.assign({}, prev); next[q.id] = val; return next; }); }
  function isValid() {
    if (!q || !q.required) return true;
    const v = getValue();
    if (q.type === 'text')              return !!(v && v.trim().length > 0);
    if (q.type === 'chips')             return !!(v && v.length > 0);
    if (q.type === 'primary_secondary') return !!(v && v.primary);
    if (q.type === 'scale_pair')        return true;
    if (q.type === 'price_pick')        return !!v;
    if (q.type === 'word_trio')         return !!(v && v.filter(function(x) { return (x || '').trim(); }).length === 3);
    return true;
  }
  function go(dir) {
    if (dir === 1 && step === TOTAL) { setPhase('preview'); return; }
    if (dir === 1 && step === 3 && answers._quick_mode) { setPhase('preview'); return; }
    setStep(function(s) { return dir === 1 ? s + 1 : Math.max(0, s - 1); });
  }

  if (phase === 'generating')     return <LoadingScreen currentStep={generatingStep} />;
  if (phase === 'preview')        return <IdentityPreview answers={answers} onEdit={function() { setPhase('questions'); setStep(1); }} onGenerate={generatePack} generating={false} generatingStep={0} />;
  if (phase === 'pack' && pack)   return <IdentityPack answers={answers} pack={pack} onBack={function() { setPhase('preview'); }} onStartListing={function() { setPhase('dashboard'); }} />;
  if (phase === 'dashboard')      return <ListingDashboard history={listingHistory} onOpen={function(h) { setListing(h.listing); setListingOutput(h.output); setEtsyIssues([]); setPhase('listing_output'); }} onNew={function() { setListing({}); setListingOutput(null); setEtsyIssues([]); setListingError(''); setPhase('listing_input'); }} onBack={function() { setPhase('pack'); }} />;
  if (phase === 'listing_input')  return <ListingInput listing={listing} onChange={setListing} onGenerate={handleGenerateListing} generating={listingGenerating} onBack={function() { setPhase('dashboard'); }} error={listingError} />;
  if (phase === 'listing_output') return <ListingOutput output={listingOutput} listing={listing} onRegenerate={handleGenerateListing} regenerateSection={regenerateSection} onBack={function() { setListing({}); setListingOutput(null); setEtsyIssues([]); setPhase('listing_input'); }} generating={listingGenerating} etsyIssues={etsyIssues} />;
  if (phase === 'error')          return (
    <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>\u26a0</div>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: C.ink, margin: '0 0 10px', fontFamily: 'Georgia, serif' }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: '0 0 24px' }}>{errorMsg || 'Generation failed. Please try again.'}</p>
        <button onClick={generatePack} style={{ background: C.ink, color: C.paper, border: 'none', borderRadius: 8, padding: '13px 28px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', marginBottom: 10, width: '100%' }}>Try again</button>
        <button onClick={function() { setPhase('preview'); }} style={{ background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '11px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', width: '100%' }}>Back to profile</button>
      </div>
    </div>
  );

  if (step === 0) return (
    <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}'}</style>
      <div style={{ maxWidth: 500, width: '100%', animation: 'fadeUp 0.6s ease' }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.18em', color: C.gold, marginBottom: 12 }}>FIND YOUR SHOP VOICE</div>
        <h1 style={{ fontSize: 34, fontWeight: 400, color: C.ink, lineHeight: 1.2, margin: '0 0 16px', fontFamily: 'Georgia, serif' }}>
          Build your brand profile.<br />
          <em style={{ color: C.gold }}>Everything flows from here.</em>
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 10px' }}>Twelve questions, about six minutes. You will come out with a clear brand voice, a defined buyer, and a positioning you can use everywhere.</p>
        <p style={{ fontSize: 14, color: C.muted, margin: '0 0 32px' }}>No jargon. No homework. Honest answers only.</p>
        <button onClick={function() { setStep(1); }}
          onMouseEnter={function(e) { e.target.style.background = C.gold; }}
          onMouseLeave={function(e) { e.target.style.background = C.ink; }}
          style={{ background: C.ink, color: C.paper, border: 'none', borderRadius: 8, padding: '15px 34px', fontSize: 15, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'block', width: '100%', letterSpacing: '0.02em' }}>
          Start building my profile
        </button>
        <button onClick={function() { setStep(1); setAnswers(function(prev) { return Object.assign({}, prev, { _quick_mode: true }); }); }}
          style={{ background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '11px 34px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', marginBottom: 12, display: 'block', width: '100%' }}>
          Skip to quick mode (3 questions)
        </button>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: 'monospace', textAlign: 'center' }}>Saves automatically as you go.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.paper, display: 'flex', flexDirection: 'column', padding: '20px 24px 40px', maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;} textarea:focus,input[type=text]:focus{outline:2px solid ' + C.gold + ';outline-offset:-2px;} button:active{transform:scale(0.97);}'}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={function() { go(-1); }} disabled={step === 1} style={{ background: 'none', border: 'none', color: step === 1 ? C.border : C.muted, fontSize: 13, cursor: step === 1 ? 'default' : 'pointer', fontFamily: 'inherit', padding: 0 }}>Back</button>
        <span style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: C.muted }}>{answers._quick_mode ? 'QUICK MODE' : 'FIND YOUR SHOP VOICE'}</span>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: savedPulse ? C.sage : 'transparent', transition: 'color 0.3s', letterSpacing: '0.06em' }}>\u2713 Saved</div>
      </div>
      <ProgressBar current={step} total={TOTAL} />
      <div key={step} style={{ flex: 1, animation: 'fadeUp 0.3s ease' }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: C.gold, marginBottom: 6 }}>QUESTION {step}</div>
        <h2 style={{ fontSize: 21, fontWeight: 400, color: C.ink, margin: '0 0 5px', fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>{q.label}</h2>
        {q.sublabel && <p style={{ fontSize: 13, color: C.muted, margin: '0 0 10px', lineHeight: 1.5 }}>{q.sublabel}</p>}
        {q.hint && <HintBox text={q.hint} />}
        {q.type === 'text' && (
          <>
            <textarea ref={inputRef} value={getValue() || ''} onChange={function(e) { setAnswer(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey && isValid()) { e.preventDefault(); go(1); } }}
              placeholder={q.placeholder} maxLength={q.maxLength} rows={4}
              style={{ width: '100%', padding: '13px 15px', border: '1.5px solid ' + C.border, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', color: C.ink, background: C.white, resize: 'none', lineHeight: 1.6 }}
              onFocus={function(e) { e.target.style.borderColor = C.gold; }}
              onBlur={function(e) { e.target.style.borderColor = C.border; }} />
            {q.maxLength && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', textAlign: 'right', marginTop: 4 }}>{(getValue() || '').length} / {q.maxLength}</div>}
          </>
        )}
        {q.type === 'chips'             && <ChipGroup options={q.options} value={getValue() || []} multi={q.multi} onChange={setAnswer} />}
        {q.type === 'primary_secondary' && <PrimarySecondary options={q.options} value={getValue() || { primary: null, secondary: [] }} onChange={setAnswer} />}
        {q.type === 'scale_pair'        && <ScalePairs pairs={q.pairs} value={getValue() || {}} onChange={setAnswer} defaults={q.defaults || {}} />}
        {q.type === 'price_pick'        && <PricePick options={q.options} value={getValue()} onChange={setAnswer} />}
        {q.type === 'word_trio'         && <WordTrio placeholders={q.placeholders} value={getValue() || ['', '', '']} onChange={setAnswer} />}
      </div>
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: C.muted }}>
          {!q.required && <span style={{ fontStyle: 'italic' }}>Optional - skip if unsure</span>}
          {q.type === 'word_trio' && <span>All three needed</span>}
        </div>
        <button onClick={function() { go(1); }} disabled={q.required && !isValid()} style={{ background: q.required && !isValid() ? C.border : C.ink, color: q.required && !isValid() ? C.muted : C.paper, border: 'none', borderRadius: 8, padding: '13px 28px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, cursor: q.required && !isValid() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {step === TOTAL ? 'Build my profile' : 'Continue'}
        </button>
      </div>
      {q.type === 'text' && <div style={{ textAlign: 'right', marginTop: 7, fontSize: 11, color: C.border, fontFamily: 'monospace' }}>shift+enter for new line, enter to continue</div>}
    </div>
  );
}
