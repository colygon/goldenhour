import { motion } from 'framer-motion';
import ScoreRing from './ScoreRing';
import SkyCondition from './SkyCondition';

const divider = {
  width: '100%',
  height: '1px',
  background: 'var(--border-subtle)',
  border: 'none',
  margin: '20px 0',
};

export default function SunsetCard({ score, tier, sunTimes, skyLine, onAlertTap }) {
  if (!tier) return null;

  const now           = new Date();
  const isPastSunset  = sunTimes?.sunset  && now > sunTimes.sunset;
  const oneHourAfter  = sunTimes?.sunset  && new Date(sunTimes.sunset.getTime() + 60 * 60 * 1000);
  const isSunriseMode = oneHourAfter && now > oneHourAfter;

  // ─── Sunrise mode (1+ hr after sunset) ──────────────────────────────────
  if (isSunriseMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card text-center"
      >
        <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🌄</p>

        <p className="label-eyebrow" style={{ color: '#FFB347', marginBottom: '8px' }}>
          ● SUNRISE FORECAST ●
        </p>

        <p className="font-display font-bold text-white"
          style={{ fontSize: '1.75rem', lineHeight: 1.2, marginBottom: '6px' }}>
          Tomorrow's Sunrise
        </p>

        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '24px', lineHeight: 1.5 }}>
          The show is done for tonight. Here's when to set your alarm.
        </p>

        <hr style={divider} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <p className="label-eyebrow" style={{ marginBottom: '8px' }}>Golden hour</p>
            <p className="font-bold text-white" style={{ fontSize: '1.4rem' }}>
              {sunTimes?.tomorrowMorningGoldenFormatted ?? '—'}
            </p>
          </div>
          <div style={{
            width: '1px',
            alignSelf: 'stretch',
            background: 'var(--border-subtle)',
            margin: '0 20px',
          }} />
          <div style={{ flex: 1 }}>
            <p className="label-eyebrow" style={{ marginBottom: '8px' }}>Sunrise</p>
            <p className="font-bold text-white" style={{ fontSize: '1.4rem' }}>
              {sunTimes?.tomorrowSunriseFormatted ?? '—'}
            </p>
          </div>
        </div>

        <p style={{
          color: 'var(--subtle-foreground)',
          fontSize: '0.8rem',
          marginBottom: '20px',
          lineHeight: 1.5,
        }}>
          Morning golden hour starts 1 hour before sunrise —{' '}
          perfect for long shadows and warm light.
        </p>

        {onAlertTap && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAlertTap}
            className="btn-primary"
          >
            🔔 Alert me for the next show
          </motion.button>
        )}
      </motion.div>
    );
  }

  // ─── Post-sunset (< 1 hr after) ─────────────────────────────────────────
  if (isPastSunset) {
    const tomorrowTime = sunTimes?.tomorrowGoldenFormatted ?? sunTimes?.tomorrowSunsetFormatted;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card text-center"
      >
        <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🌙</p>

        <p className="font-display font-bold tracking-tight text-white"
          style={{ fontSize: '1.75rem', marginBottom: '12px' }}>
          See you tomorrow
        </p>

        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '12px' }}>
          Tonight's sunset was{' '}
          <span style={{ color: tier.color, fontWeight: 700 }}>
            {tier.emoji} {tier.label}
          </span>{' '}
          ({score}/100). The sky is dark now — check back tomorrow evening.
        </p>

        {skyLine && (
          <p style={{ color: 'var(--subtle-foreground)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: '8px' }}>
            "{skyLine}"
          </p>
        )}

        <hr style={divider} />

        <p className="label-eyebrow" style={{ marginBottom: '8px' }}>Tomorrow's golden hour</p>
        <p className="font-display font-bold text-white" style={{ fontSize: '1.75rem', marginBottom: '20px' }}>
          {tomorrowTime ?? '—'}
        </p>

        {onAlertTap && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAlertTap}
            className="btn-primary"
          >
            🔔 Alert me tomorrow
          </motion.button>
        )}
      </motion.div>
    );
  }

  // ─── Pre-sunset (normal) ─────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="card text-center"
    >
      {/* Quality label */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        style={{ marginBottom: '20px' }}
      >
        <span className="label-eyebrow" style={{ color: tier.color }}>
          ● {tier.label} ●
        </span>
      </motion.div>

      {/* Score ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <ScoreRing score={score} tier={tier} />
      </div>

      {/* Times */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="font-display font-bold tracking-tight text-white"
          style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
          Sunset at {sunTimes?.sunsetFormatted || '—'}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
          Golden hour: {sunTimes?.goldenHourFormatted || '—'}
        </p>
      </motion.div>

      {/* Sky condition */}
      <div style={{ marginTop: '16px' }}>
        <SkyCondition skyLine={skyLine} tier={tier} />
      </div>
    </motion.div>
  );
}
