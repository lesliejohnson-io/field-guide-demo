// iPad landscape frame — bezel + camera + home indicator
// Screen area is 1180 × 820 (nominal iPad Pro landscape, scaled)
function IPadFrame({ width = 1180, height = 820, bezel = 22, children, label, dark = false, shadow = true }) {
  const outerW = width + bezel * 2;
  const outerH = height + bezel * 2;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {label && (
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(98,93,82,0.7)',
          fontWeight: 500,
        }}>{label}</div>
      )}
      <div style={{
        width: outerW, height: outerH,
        borderRadius: 42,
        background: '#1a1a1c',
        padding: bezel,
        boxSizing: 'border-box',
        position: 'relative',
        boxShadow: shadow
          ? '0 60px 120px -40px rgba(39,36,29,0.35), 0 20px 40px -20px rgba(39,36,29,0.18), 0 0 0 1.5px rgba(0,0,0,0.5)'
          : 'none',
      }}>
        {/* Front-facing camera on the long edge (landscape top) */}
        <div style={{
          position: 'absolute', top: bezel / 2 - 2, left: '50%',
          width: 6, height: 6, borderRadius: '50%',
          background: '#2a2a2c', transform: 'translateX(-50%)',
          boxShadow: 'inset 0 0 2px rgba(0,0,0,0.8)',
        }} />
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 22, overflow: 'hidden',
          background: dark ? '#0d0c0a' : 'var(--surface-app)',
          position: 'relative',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

window.IPadFrame = IPadFrame;
