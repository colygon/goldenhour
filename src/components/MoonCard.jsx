import { motion } from 'framer-motion';
import ScoreRing from './ScoreRing';

const DESCRIPTIONS = {
  LEGENDARY: 'Extremely rare. Step outside — history is happening.',
  EPIC:      'Perfect conditions. Bring a camera and a blanket.',
  GREAT:     'Bright skies tonight. Worth a walk outside.',
  DECENT:    'Decent viewing if clouds cooperate.',
  MEH:       'Thin crescent only. Better nights ahead.',
  SKIP:      'Not worth a trip — cloudy or new moon tonight.',
};

const hr = {
  width: '100%',
  height: '1px',
  background: 'var(--border-subtle)',
  margin: '28px 0',
  border: 'none',
};

export default function MoonCard({ data }) {
  if (!data) return null;

  const { moonriseFormatted, moonsetFormatted, phaseInfo, events, score, tier, daysToFull, distanceKm } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="card text-center"
    >
      {/* ── Tier label ─────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        style={{ marginBottom: '20px' }}
      >
        <span className="label-eyebrow" style={{ color: tier.color }}>
          ● {tier.label} ●
        </span>
      </motion.div>

      {/* ── Score ring ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <ScoreRing score={score} tier={tier} />
      </div>

      {/* ── Phase name ─────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="font-display font-bold tracking-tight text-white"
        style={{ fontSize: '1.75rem', lineHeight: 1.2 }}
      >
        {phaseInfo.emoji} {phaseInfo.name}
      </motion.p>

      {/* ── Divider ────────────────────────────────────────── */}
      <hr style={hr} />

      {/* ── Moonrise / Moonset ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0',
          marginBottom: '28px',
        }}
      >
        <div style={{ flex: 1 }}>
          <p className="label-eyebrow" style={{ marginBottom: '8px' }}>Moonrise</p>
          <p className="font-bold text-white" style={{ fontSize: '1.25rem' }}>
            {moonriseFormatted || '—'}
          </p>
        </div>
        <div style={{
          width: '1px',
          alignSelf: 'stretch',
          background: 'var(--border-subtle)',
          margin: '0 24px',
        }} />
        <div style={{ flex: 1 }}>
          <p className="label-eyebrow" style={{ marginBottom: '8px' }}>Moonset</p>
          <p className="font-bold text-white" style={{ fontSize: '1.25rem' }}>
            {moonsetFormatted || '—'}
          </p>
        </div>
      </motion.div>

      {/* ── Illumination + distance ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '8px' }}>
          {phaseInfo.illumination}% illuminated
        </p>
        <p style={{ color: 'var(--subtle-foreground)', fontSize: '0.875rem', marginBottom: daysToFull !== undefined ? '20px' : '0' }}>
          {distanceKm.toLocaleString()} km from Earth
        </p>
      </motion.div>

      {/* ── Full moon countdown ────────────────────────────── */}
      {daysToFull === 0 && (
        <p style={{ color: tier.color, fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>
          🌕 Tonight is the full moon!
        </p>
      )}
      {daysToFull > 0 && daysToFull <= 10 && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
          Full moon in{' '}
          <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
            {daysToFull} day{daysToFull !== 1 ? 's' : ''}
          </span>
        </p>
      )}

      {/* ── Special event badges ───────────────────────────── */}
      {events.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
          {events.map((ev, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '9999px',
                background: ev.rarity === 'legendary'
                  ? 'rgba(180, 0, 0, 0.28)'
                  : 'rgba(65, 105, 225, 0.22)',
                border: `1px solid ${ev.rarity === 'legendary'
                  ? 'rgba(210, 30, 30, 0.45)'
                  : 'rgba(100, 150, 225, 0.38)'}`,
                color: 'var(--foreground)',
              }}
            >
              {ev.label}
            </motion.span>
          ))}
        </div>
      )}

      {/* ── Divider ────────────────────────────────────────── */}
      <hr style={hr} />

      {/* ── Description quote ──────────────────────────────── */}
      <p style={{
        color: 'var(--muted-foreground)',
        fontSize: '0.875rem',
        fontStyle: 'italic',
        lineHeight: 1.6,
      }}>
        "{DESCRIPTIONS[tier.label] || DESCRIPTIONS.DECENT}"
      </p>
    </motion.div>
  );
}
