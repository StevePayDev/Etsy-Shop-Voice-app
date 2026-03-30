import { C } from './theme';

export default function ListingDashboard({ history, onOpen, onNew, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: C.ink, padding: '20px 24px' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', color: C.gold, marginBottom: 6 }}>LISTING BUILDER</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, color: C.paper, margin: 0, fontFamily: 'Georgia, serif' }}>Your Listings</h1>
            <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #3a3020', color: C.muted, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Back to profile</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '24px 24px 60px' }}>
        <button onClick={onNew} style={{ width: '100%', background: C.ink, color: C.paper, border: 'none', borderRadius: 8, padding: '14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', marginBottom: 20, letterSpacing: '0.02em' }}>
          Build a new listing
        </button>
        {history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted, fontSize: 14, fontStyle: 'italic' }}>
            No listings yet. Build your first one above.
          </div>
        )}
        {history.map(function(h, i) {
          const d = new Date(h.date);
          const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          return (
            <div key={i} onClick={function() { onOpen(h); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', marginBottom: 10, background: C.white, border: '1px solid ' + C.border, borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={function(e) { e.currentTarget.style.borderColor = C.gold; }}
              onMouseLeave={function(e) { e.currentTarget.style.borderColor = C.border; }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 3 }}>{h.listing.product_name || 'Untitled'}</div>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{dateStr}</div>
              </div>
              <span style={{ color: C.gold, fontSize: 18 }}>\u25b7</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
