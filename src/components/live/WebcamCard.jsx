import { useEffect, useRef, useState } from 'react';

const FACING_LABEL = { sunset: '🌅 Sunset', sunrise: '🌄 Sunrise', both: '🌅🌄 All day' };

// ─── JPEG refresh cam ─────────────────────────────────────────────────────────
function JpegCam({ src, refreshMs = 30000, name }) {
  const [url, setUrl] = useState(`${src}?t=${Date.now()}`);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setLoaded(false);
      setUrl(`${src}?t=${Date.now()}`);
    }, refreshMs);
    return () => clearInterval(id);
  }, [src, refreshMs]);

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#111' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem',
        }}>
          Loading…
        </div>
      )}
      <img
        src={url}
        alt={name}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      />
    </div>
  );
}

// ─── YouTube live embed ───────────────────────────────────────────────────────
function YoutubeCam({ src }) {
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#111' }}>
      <iframe
        src={`https://www.youtube.com/embed/${src}?autoplay=1&mute=1&loop=1&modestbranding=1&rel=0`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          border: 'none',
        }}
        title="webcam"
      />
    </div>
  );
}

// ─── Generic iframe cam ───────────────────────────────────────────────────────
function IframeCam({ src }) {
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#111' }}>
      <iframe
        src={src}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          border: 'none',
        }}
        title="webcam"
      />
    </div>
  );
}

// ─── WebcamCard ───────────────────────────────────────────────────────────────
export default function WebcamCard({ cam, distance }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Video / image area — lazy: only render when expanded or always-on */}
      <div
        onClick={() => setExpanded(true)}
        style={{ cursor: expanded ? 'default' : 'pointer', position: 'relative' }}
      >
        {expanded ? (
          cam.type === 'youtube'  ? <YoutubeCam src={cam.src} /> :
          cam.type === 'jpeg'     ? <JpegCam src={cam.src} refreshMs={cam.refreshMs} name={cam.name} /> :
                                    <IframeCam src={cam.src} />
        ) : (
          /* Tap-to-load placeholder */
          <div style={{
            width: '100%', paddingBottom: '56.25%',
            background: 'linear-gradient(135deg, rgba(255,140,0,0.08), rgba(0,0,0,0.4))',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '2.5rem' }}>{cam.emoji}</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(220,50,50,0.85)', borderRadius: '6px',
                padding: '4px 10px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>LIVE</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Tap to watch</span>
            </div>
          </div>
        )}
      </div>

      {/* Info row */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: 0 }}>
            {cam.emoji} {cam.name}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
            {cam.location}
            {distance != null && ` · ${distance}`}
          </p>
        </div>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700,
          color: 'var(--muted-foreground)',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '6px', padding: '3px 8px',
          whiteSpace: 'nowrap',
        }}>
          {FACING_LABEL[cam.facing]}
        </span>
      </div>
    </div>
  );
}
