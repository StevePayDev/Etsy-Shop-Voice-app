import { C, LISTING_FIELDS } from './theme';

export default function ListingInput({ listing, onChange, onGenerate, generating, onBack, error }) {
  function set(id, val) { onChange(Object.assign({}, listing, { [id]: val })); }
  const required = LISTING_FIELDS.filter(function(f) { return f.required; });
  const ready    = required.every(function(f) { return (listing[f.id] || '').trim(); });

  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: C.ink, padding: '20px 24px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: C.gold, marginBottom: 6 }}>LISTING BUILDER</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, color: C.paper, margin: 0, fontFamily: 'Georgia, serif' }}>Tell us about this product</h1>
            <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #3a3020', color: C.muted, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Back</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '24px 24px 60px' }}>
        {LISTING_FIELDS.map(function(field) {
          return (
            <div key={field.id} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', color: C.muted, marginBottom: 6 }}>
                {field.label.toUpperCase()}
                {field.required && <span style={{ color: C.gold, marginLeft: 4 }}>*</span>}
              </label>
              {field.type === 'select' ? (
                <select value={listing[field.id] || ''} onChange={function(e) { set(field.id, e.target.value); }}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid ' + C.border, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: C.ink, background: C.white }}>
                  {(field.options || []).map(function(o) { return <option key={o} value={o}>{o || 'Use shop default'}</option>; })}
                </select>
              ) : (
                <input type='text' value={listing[field.id] || ''} onChange={function(e) { set(field.id, e.target.value); }}
                  placeholder={field.required ? 'Required' : 'Optional'}
                  onFocus={function(e) { e.target.style.borderColor = C.gold; }}
                  onBlur={function(e) { e.target.style.borderColor = C.border; }}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid ' + C.border, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: C.ink, background: C.white }} />
              )}
            </div>
          );
        })}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#cc3333' }}>{error}</div>
        )}
        <button onClick={onGenerate} disabled={!ready || generating}
          style={{ width: '100%', background: (!ready || generating) ? C.border : C.ink, color: (!ready || generating) ? C.muted : C.paper, border: 'none', borderRadius: 8, padding: '15px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, cursor: (!ready || generating) ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'all 0.2s' }}>
          {generating ? 'Generating your listing...' : 'Generate my listing'}
        </button>
        {!ready && <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>Fill in the required fields to continue.</p>}
      </div>
    </div>
  );
}
