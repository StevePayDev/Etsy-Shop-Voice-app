import { useState } from 'react';
import { C } from './theme';

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
  return (
    <span onClick={copyable ? function() { try { navigator.clipboard.writeText(text); } catch (e) {} setDone(true); setTimeout(function() { setDone(false); }, 1500); } : undefined}
      style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 20, border: '1px solid ' + (done ? C.sage : C.border), background: done ? C.sagePale : C.paperDim, fontSize: 13, color: done ? C.sage : C.ink, margin: '3px 4px 3px 0', cursor: copyable ? 'pointer' : 'default', transition: 'all 0.15s' }}>
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

function RegenBtn({ onClick, generating }) {
  return (
    <button onClick={onClick} disabled={generating}
      style={{ background: 'transparent', border: '1px solid ' + C.border, color: C.muted, borderRadius: 4, padding: '3px 10px', fontSize: 11, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
      {generating ? '...' : 'REGEN'}
    </button>
  );
}

export default function ListingOutput({ output, listing, onRegenerate, regenerateSection, onBack, generating, etsyIssues }) {
  const [selectedTitle, setSelectedTitle] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: 'system-ui, sans-serif' }}>
      <style>{'@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box}'}</style>
      <div style={{ background: C.ink, padding: '20px 24px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: C.gold, marginBottom: 6 }}>LISTING OUTPUT</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, color: C.paper, margin: 0, fontFamily: 'Georgia, serif' }}>{listing.product_name || 'Your Listing'}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onRegenerate} disabled={generating}
                style={{ background: 'transparent', border: '1px solid ' + C.gold, color: C.gold, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {generating ? 'Working...' : 'Regenerate all'}
              </button>
              <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #3a3020', color: C.muted, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '24px 24px 60px', animation: 'fadeUp 0.4s ease' }}>

        {etsyIssues && etsyIssues.length > 0 && (
          <div style={{ background: '#fff8e8', border: '1px solid #e8c84a', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: '#b8880a', marginBottom: 6 }}>REVIEW BEFORE PUBLISHING</div>
            {etsyIssues.map(function(issue, i) { return <div key={i} style={{ fontSize: 13, color: C.ink, padding: '2px 0' }}>{issue}</div>; })}
          </div>
        )}

        <Section label='TITLE OPTIONS' icon='\u2736'>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px', fontStyle: 'italic' }}>Click a title to select it. Copy the one you want.</p>
          {(output.title_options || []).map(function(t, i) {
            const active = selectedTitle === i;
            return (
              <div key={i} onClick={function() { setSelectedTitle(i); }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '12px 14px', marginBottom: 8, background: active ? C.goldPale : C.paperDim, border: '1.5px solid ' + (active ? C.gold : C.border), borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div>
                  <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.4 }}>{t}</div>
                  <div style={{ fontSize: 10, color: t.length > 140 ? C.rust : C.muted, fontFamily: 'monospace', marginTop: 4 }}>{t.length} chars{t.length > 140 ? ' - TOO LONG' : ''}</div>
                </div>
                <CopyBtn text={t} small />
              </div>
            );
          })}
        </Section>

        <Section label='DESCRIPTION' icon='\u2727'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <RegenBtn onClick={function() { regenerateSection('description'); }} generating={generating} />
            <CopyBtn text={output.description || ''} />
          </div>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{output.description}</p>
        </Section>

        <Section label='BULLET BENEFITS' icon='\u25c8'>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <CopyBtn text={(output.bullet_points || []).map(function(b) { return '- ' + b; }).join('\n')} />
          </div>
          {(output.bullet_points || []).map(function(b, i) {
            return (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid ' + C.border, alignItems: 'flex-start' }}>
                <span style={{ color: C.gold, flexShrink: 0, marginTop: 2 }}>\u2713</span>
                <span style={{ fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{b}</span>
              </div>
            );
          })}
        </Section>

        <Section label='SEO TAGS (13)' icon='\u25c7'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <RegenBtn onClick={function() { regenerateSection('tags'); }} generating={generating} />
            <CopyBtn text={(output.tags || []).join(', ')} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {(output.tags || []).map(function(t, i) { return <Pill key={i} text={t} copyable />; })}
          </div>
          <div style={{ fontSize: 11, color: (output.tags || []).length === 13 ? C.sage : C.rust, fontFamily: 'monospace', marginTop: 8 }}>
            {(output.tags || []).length} / 13 tags
          </div>
        </Section>

        <Section label='AD COPY' icon='\u25c9'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(output.ad_copy || []).map(function(ad, i) {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: C.paperDim, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{ad}</span>
                  <CopyBtn text={ad} small />
                </div>
              );
            })}
          </div>
        </Section>

        <Section label='SOCIAL CAPTIONS' icon='\u2726'>
          {['instagram', 'pinterest', 'tiktok'].map(function(platform) {
            const caption = output.social_captions && output.social_captions[platform];
            if (!caption) return null;
            return (
              <div key={platform} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 6 }}>{platform.toUpperCase()}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: C.paperDim, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{caption}</span>
                  <CopyBtn text={caption} small />
                </div>
              </div>
            );
          })}
        </Section>

        {output.image_prompts && output.image_prompts.length > 0 && (
          <Section label='IMAGE PROMPTS' icon='\u2729'>
            <p style={{ fontSize: 12, color: C.muted, margin: '0 0 12px', fontStyle: 'italic' }}>Use these as prompts for AI image tools or as a photography brief.</p>
            {output.image_prompts.map(function(p, i) {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '12px 14px', marginBottom: 8, background: C.paperDim, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{p}</span>
                  <CopyBtn text={p} small />
                </div>
              );
            })}
          </Section>
        )}

        <div style={{ background: C.paperDim, border: '1px solid ' + C.border, borderRadius: 12, padding: '20px 22px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', color: C.muted, marginBottom: 12 }}>PASTE INTO ETSY CHECKLIST</div>
          {[
            'Choose your title and paste it into the Etsy title field',
            'Copy your description and paste into the Etsy description field',
            'Add all 13 tags one by one into the Etsy tags field',
            'Copy bullet benefits into the top of your description or listing notes',
            'Use image prompts to create or brief your product photos',
            'Schedule your social captions for launch day',
          ].map(function(item, i) {
            return (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', alignItems: 'flex-start' }}>
                <span style={{ color: C.gold, flexShrink: 0, marginTop: 1, fontSize: 13 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{item}</span>
              </div>
            );
          })}
        </div>

        <div style={{ background: C.ink, borderRadius: 12, padding: '22px 24px' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', color: C.gold, marginBottom: 8 }}>ALL DONE</div>
          <p style={{ fontSize: 14, color: '#a8a090', lineHeight: 1.6, margin: '0 0 16px' }}>Copy your title, description, tags, and captions into your Etsy listing. Come back any time to generate another product.</p>
          <button onClick={onBack} style={{ width: '100%', background: C.gold, color: C.ink, border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}>
            Generate another listing
          </button>
        </div>

      </div>
    </div>
  );
}
