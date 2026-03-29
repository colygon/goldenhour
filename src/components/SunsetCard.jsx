import { motion } from 'framer-motion';
import ScoreRing from './ScoreRing';
import SkyCondition from './SkyCondition';

export default function SunsetCard({ score, tier, sunTimes, skyLine }) {
  if (!tier) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="card mx-4 text-center"
    >
      {/* Quality label */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <span
          className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: tier.color }}
        >
          ● {tier.label} ●
        </span>
      </motion.div>

      {/* Score ring */}
      <div className="flex justify-center mb-5">
        <ScoreRing score={score} tier={tier} />
      </div>

      {/* Times */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-1 mb-4"
      >
        <p className="text-2xl font-display font-bold text-white">
          Sunset at {sunTimes?.sunsetFormatted || '—'}
        </p>
        <p className="text-sm text-white/50 font-body">
          Golden hour: {sunTimes?.goldenHourFormatted || '—'}
        </p>
      </motion.div>

      {/* Sky condition */}
      <SkyCondition skyLine={skyLine} tier={tier} />
    </motion.div>
  );
}
