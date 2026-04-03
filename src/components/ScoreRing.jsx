import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScoreRing({ score = 0, tier }) {
  const [displayScore, setDisplayScore] = useState(0);
  const size = 140;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  useEffect(() => {
    if (score === 0) return;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * score));
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  const isEpic = tier?.label === 'EPIC';

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center md:scale-125 md:my-4 ${isEpic ? 'glow-epic' : ''}`}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tier?.color || '#FF8C00'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
        />
      </svg>
      {/* Center score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold font-body tabular-nums"
          style={{ color: tier?.color || '#FF8C00' }}
        >
          {displayScore}
        </span>
        <span className="text-xs tracking-wider uppercase" style={{ color: 'var(--subtle-foreground)' }}>
          / 100
        </span>
      </div>
    </motion.div>
  );
}
