import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ─── Score helpers ───────────────────────────────────────────────────────────
function scoreColor(n) {
  if (n >= 90) return '#FFB300';
  if (n >= 75) return '#FF8C00';
  if (n >= 55) return '#FF5500';
  if (n >= 35) return '#CC6600';
  return '#666';
}

function scoreLabel(n) {
  if (n >= 95) return 'Legendary 🌟';
  if (n >= 85) return 'Epic 🔥';
  if (n >= 75) return 'Great 🌅';
  if (n >= 55) return 'Good 👍';
  if (n >= 35) return 'Meh 🌥';
  return 'Disappointing 🌫';
}

const PRESETS = [
  { label: '😕', value: 20 },
  { label: '😐', value: 45 },
  { label: '🌅', value: 75 },
  { label: '🔥', value: 92 },
];

// ─── SunsetRater ─────────────────────────────────────────────────────────────
export default function SunsetRater({ mode = 'sun', lat, lon, sunsetScore, onClose }) {
  const [score, setScore]     = useState(sunsetScore ?? 75);
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [done, setDone]           = useState(false);
  const fileInputRef = useRef(null);

  const isMoon   = mode === 'moon';
  const subject  = isMoon ? 'Moonrise' : 'Sunset';
  const accentA  = isMoon ? '#7EB2FF' : '#FF8C00';
  const accentB  = isMoon ? '#a78bfa' : '#FFB300';

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { alert('File too large (max 200MB)'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setUploading(true);

    // Simulate upload progress (replace with real Supabase upload when ready)
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(id);
        setProgress(100);

        // Try to persist to Supabase
        if (supabase && lat && lon) {
          supabase.from('posts').insert({
            lat, lon,
            media_type: file?.type?.startsWith('video/') ? 'video' : 'photo',
            media_url: preview, // local blob URL — replace with real upload URL
            caption: caption.trim() || null,
            sunset_score: score,
            sunset_date: new Date().toISOString().split('T')[0],
          }).then(() => {}).catch(() => {});
        }

        setTimeout(() => {
          setUploading(false);
          setDone(true);
          setTimeout(onClose, 1400);
        }, 400);
      } else {
        setProgress(Math.round(p));
      }
    }, 120);
  };

  const canSubmit = !!preview && !uploading;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/75" onClick={!uploading ? onClose : undefined} />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(10,8,18,0.97)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            borderTop: '0.5px solid rgba(255,255,255,0.14)',
            borderRadius: '24px 24px 0 0',
            padding: '12px 20px',
            paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
            maxHeight: '92vh',
            overflowY: 'auto',
          }}
        >
          {/* Handle */}
          <div style={{
            width: '40px', height: '4px', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.18)', margin: '0 auto 20px',
          }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ position: 'absolute', top: '20px', right: '20px' }}
            aria-label="Close"
          >✕</button>

          <h3 style={{
            fontSize: '1.2rem', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)', margin: '0 0 24px',
          }}>
            Rate Tonight's {subject}
          </h3>

          {/* ── Score display ───────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <motion.div
              key={Math.round(score / 5)}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{
                fontSize: '6rem', fontWeight: 900, lineHeight: 1,
                fontFamily: 'var(--font-display)',
                color: scoreColor(score),
                textShadow: `0 0 40px ${scoreColor(score)}55`,
              }}
            >
              {Math.round(score)}
            </motion.div>
            <p style={{
              fontSize: '1rem', fontWeight: 600, marginTop: '4px',
              color: 'rgba(255,255,255,0.65)',
            }}>
              {scoreLabel(score)}
            </p>
          </div>

          {/* ── Presets ─────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '10px',
            marginBottom: '16px',
          }}>
            {PRESETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setScore(value)}
                style={{
                  width: '52px', height: '40px', borderRadius: '10px',
                  border: `1px solid ${Math.abs(score - value) < 8 ? accentA : 'rgba(255,255,255,0.14)'}`,
                  background: Math.abs(score - value) < 8 ? `rgba(${isMoon ? '126,178,255' : '255,140,0'},0.18)` : 'rgba(255,255,255,0.06)',
                  color: Math.abs(score - value) < 8 ? accentA : 'rgba(255,255,255,0.55)',
                  fontSize: '1.3rem', cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Slider ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: '24px', padding: '0 4px' }}>
            <input
              type="range"
              min="1"
              max="100"
              value={score}
              onChange={e => setScore(Number(e.target.value))}
              style={{
                width: '100%', height: '6px', cursor: 'pointer',
                accentColor: scoreColor(score),
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '11px', color: 'rgba(255,255,255,0.35)',
              marginTop: '4px',
            }}>
              <span>1</span><span>50</span><span>100</span>
            </div>
          </div>

          {/* ── Photo proof ─────────────────────────────────────────── */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            onChange={handleFile}
            style={{ display: 'none' }}
          />

          {!preview ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }}
                style={{
                  borderRadius: '16px',
                  border: '1.5px dashed rgba(255,255,255,0.20)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '4px' }}>📷</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Take Photo</span>
              </button>
              <button
                onClick={() => {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }}
                style={{
                  borderRadius: '16px',
                  border: '1.5px dashed rgba(255,255,255,0.20)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '4px' }}>🖼</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>From Library</span>
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
                <img
                  src={preview}
                  alt="Proof"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
                {/* Score badge overlay */}
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.60)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px', padding: '4px 10px',
                  fontSize: '0.85rem', fontWeight: 700,
                  color: scoreColor(score),
                }}>
                  {Math.round(score)}/100
                </div>
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="btn-icon"
                  style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.55)', border: 'none' }}
                  aria-label="Remove photo"
                >✕</button>
              </div>

              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={120}
                placeholder="Describe the scene… (optional)"
                className="input-glass"
              />
            </div>
          )}

          {/* ── Submit ──────────────────────────────────────────────── */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: '100%', height: '52px', borderRadius: '14px',
              border: 'none', fontWeight: 700, fontSize: '1rem',
              cursor: canSubmit ? 'pointer' : 'default',
              background: done
                ? `linear-gradient(135deg,${accentA},${accentB})`
                : canSubmit
                  ? `linear-gradient(135deg,${accentA},${accentB})`
                  : 'rgba(255,255,255,0.08)',
              color: canSubmit ? '#fff' : 'rgba(255,255,255,0.25)',
              boxShadow: canSubmit ? `0 4px 20px rgba(${isMoon ? '126,178,255' : '255,140,0'},0.35)` : 'none',
              transition: 'all 200ms ease',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {uploading && (
              <div style={{
                position: 'absolute', inset: '0', background: 'rgba(255,255,255,0.15)',
                width: `${progress}%`, transition: 'width 0.1s linear',
              }} />
            )}
            <span style={{ position: 'relative' }}>
              {done
                ? '✓ Rated!'
                : uploading
                  ? `${progress}%`
                  : !preview
                    ? 'Add a photo to submit'
                    : `Submit ${Math.round(score)}/100 Rating →`
              }
            </span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
