import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

// ─── Alert type definitions ──────────────────────────────────────────────────
const TYPES = [
  { id: 'sunset',  label: 'Sunset',  emoji: '🌅', color: '#FF8C00' },
  { id: 'sunrise', label: 'Sunrise', emoji: '🌄', color: '#FFB347' },
  { id: 'moon',    label: 'Moon',    emoji: '🌙', color: '#7EB2FF' },
];

// ─── Shared inline style helpers ─────────────────────────────────────────────
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  backdropFilter: 'blur(24px) saturate(200%)',
  WebkitBackdropFilter: 'blur(24px) saturate(200%)',
  borderRadius: 'var(--radius-xl)',
  padding: '24px',
};

const eyebrow = {
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--subtle-foreground)',
  display: 'block', marginBottom: '14px',
};

function ToggleBtn({ active, color, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, height: '44px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontFamily: 'var(--font-body)',
        fontWeight: active ? 700 : 400,
        border: active ? 'none' : '1px solid var(--border-subtle)',
        background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
        color: active ? color : 'var(--muted-foreground)',
        boxShadow: active ? `0 0 0 1.5px ${color}88` : 'none',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {children}
    </button>
  );
}

export default function AlertsView({ onClose, mode = 'sun' }) {
  // Multi-select: start with the tab the user came from
  const [selected, setSelected] = useState(
    () => new Set(mode === 'moon' ? ['moon'] : ['sunset'])
  );
  const [phone, setPhone]         = useState('');
  const [threshold, setThreshold] = useState('great');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const toggleType = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // at least one must remain
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Derive hero content from selection
  const selectedTypes  = TYPES.filter(t => selected.has(t.id));
  const heroEmojis     = selectedTypes.map(t => t.emoji).join(' ');
  const allSelected    = selected.size === 3;
  const moonOnly       = selected.size === 1 && selected.has('moon');
  const hasSun         = selected.has('sunset') || selected.has('sunrise');

  const headline = allSelected
    ? 'Alert me for everything'
    : moonOnly
    ? 'Never miss a special moon'
    : selected.size === 1 && selected.has('sunset')
    ? 'Never miss a golden hour'
    : selected.size === 1 && selected.has('sunrise')
    ? 'Wake up to golden light'
    : `Alerts for ${selectedTypes.map(t => t.label).join(' & ')}`;

  const sub = allSelected
    ? "We'll text you before every sunset, sunrise, and exceptional moon."
    : moonOnly
    ? "We'll text you when moon conditions are exceptional — full moons, supermoons, and clear skies."
    : hasSun && selected.has('moon')
    ? "We'll text you before stunning sunsets, sunrises, and special moons."
    : selected.has('sunset')
    ? "We'll text you when tonight's sunset is worth dropping everything for."
    : "We'll text you when tomorrow's sunrise is shaping up to be spectacular.";

  // Threshold options depend on whether moon is the only selection
  const thresholds = moonOnly
    ? [{ value: 'great', label: 'Full moon +' }, { value: 'epic', label: 'Supermoon only' }]
    : [{ value: 'great', label: 'Great or better' }, { value: 'epic', label: 'Epic only' }];

  // Primary accent color from first selected type
  const accentColor = selectedTypes[0]?.color || '#FF8C00';

  const privacyText = selectedTypes.map(t => t.label.toLowerCase()).join(', ') + ' alerts';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    const payload = {
      phone:        `+1${phone.replace(/\D/g, '')}`,
      threshold,
      lead_minutes: 60,
      alert_types:  [...selected],
    };

    try {
      // Always save locally so the user sees success instantly
      localStorage.setItem('gh_alert', JSON.stringify({
        ...payload, createdAt: new Date().toISOString(),
      }));

      // Save to Supabase when configured
      if (supabase) {
        const { error: dbError } = await supabase
          .from('alert_signups')
          .insert(payload);
        if (dbError) throw dbError;
      }

      setSubmitted(true);
      setError('');
    } catch {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 30,
        overflowY: 'auto', background: 'var(--background)',
      }}
    >
      <div style={{ maxWidth: '440px', marginInline: 'auto', padding: '0 16px' }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={[...selected].sort().join('-')}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{ padding: 'max(28px, env(safe-area-inset-top)) 0 24px', textAlign: 'center' }}
          >
            <p style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '12px' }}>{heroEmojis}</p>
            <h3 style={{
              fontSize: '1.5rem', fontFamily: 'var(--font-display)',
              fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              {headline}
            </h3>
            <p style={{
              fontSize: '0.875rem', color: 'var(--muted-foreground)',
              lineHeight: 1.6, maxWidth: '300px', marginInline: 'auto',
            }}>
              {sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Form / Success ───────────────────────────────────────────────── */}
        {submitted ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px 24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</p>
            <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              You're in!
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '24px' }}>
              We'll text you when it's worth watching.
            </p>
            <button onClick={onClose} className="btn-primary">Back to forecast</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '120px' }}>

            {/* Phone */}
            <div style={card}>
              <span style={eyebrow}>Phone number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.875rem', fontWeight: 700,
                  padding: '0 12px', height: '44px',
                  display: 'flex', alignItems: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--muted-foreground)',
                  flexShrink: 0,
                }}>+1</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="input-glass"
                  style={{ flex: 1 }}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Threshold */}
            <AnimatePresence mode="wait">
              <motion.div
                key={moonOnly ? 'moon-t' : 'sun-t'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={card}
              >
                <span style={eyebrow}>Alert me when it's</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {thresholds.map(({ value, label }) => (
                    <ToggleBtn
                      key={value}
                      active={threshold === value}
                      color={accentColor}
                      onClick={() => setThreshold(value)}
                    >
                      {label}
                    </ToggleBtn>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Alert me for (type selector) */}
            <div style={card}>
              <span style={eyebrow}>Alert me for</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {TYPES.map(({ id, label, emoji, color }) => {
                  const active = selected.has(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleType(id)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        borderRadius: 'var(--radius-xl)',
                        border: active ? `1.5px solid ${color}99` : '1px solid var(--border-subtle)',
                        background: active ? `${color}18` : 'rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '6px',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{emoji}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: active ? 700 : 400,
                        color: active ? color : 'var(--muted-foreground)',
                        transition: 'color 150ms ease',
                      }}>
                        {label}
                      </span>
                      <span style={{
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        border: active ? 'none' : '1.5px solid var(--border)',
                        background: active ? color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', color: '#000', fontWeight: 700,
                        transition: 'all 150ms ease',
                      }}>
                        {active ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '0.875rem', color: '#f87171', padding: '0 4px' }}>{error}</p>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>
              Sign me up
            </button>

            <p style={{
              fontSize: '0.75rem', textAlign: 'center',
              color: 'var(--subtle-foreground)', lineHeight: 1.5,
            }}>
              Your number is only used for {privacyText}. Reply STOP to cancel.
            </p>
          </form>
        )}
      </div>
    </motion.div>
  );
}
