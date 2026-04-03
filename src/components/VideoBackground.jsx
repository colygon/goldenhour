import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const VIDEO_MAP = {
  EPIC: '/videos/sunset-epic.mp4',
  GREAT: '/videos/sunset-great.mp4',
  DECENT: '/videos/sunset-decent.mp4',
  MEH: '/videos/sunset-meh.mp4',
  'SKIP IT': '/videos/sunset-skip.mp4',
};

const GRADIENT_MAP = {
  EPIC:      'bg-tier-epic',
  GREAT:     'bg-tier-great',
  DECENT:    'bg-tier-decent',
  MEH:       'bg-tier-meh',
  'SKIP IT': 'bg-tier-skip',
};

const MOON_GRADIENT_MAP = {
  LEGENDARY: 'bg-moon-legendary',
  EPIC:      'bg-moon-epic',
  GREAT:     'bg-moon-great',
  DECENT:    'bg-moon-decent',
  MEH:       'bg-moon-meh',
  SKIP:      'bg-moon-skip',
};

export default function VideoBackground({ tier = 'GREAT', mode = 'sun' }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const videoSrc = VIDEO_MAP[tier] || VIDEO_MAP.GREAT;
  const gradientClass = mode === 'moon'
    ? (MOON_GRADIENT_MAP[tier] || MOON_GRADIENT_MAP.DECENT)
    : (GRADIENT_MAP[tier] || GRADIENT_MAP.GREAT);

  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
  }, [tier]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {/* Gradient fallback — always visible behind video */}
      <div className={`absolute inset-0 ${gradientClass} transition-all duration-1000`} />

      {/* Video layer — only in sun mode */}
      <AnimatePresence mode="wait">
        {!videoError && mode === 'sun' && (
          <motion.div
            key={tier}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)',
        }}
      />
    </div>
  );
}
