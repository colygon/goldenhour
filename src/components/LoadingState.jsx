import { motion } from 'framer-motion';

export default function LoadingState() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#1a0a00] via-[#2d1200] to-[#0a0a0a]">
      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-display font-bold text-white mb-8"
      >
        🌅 GoldenHour
      </motion.h1>

      {/* Shimmer card skeleton */}
      <div className="w-full max-w-sm space-y-4">
        <div className="card">
          {/* Tier label skeleton */}
          <div className="shimmer h-4 w-20 mx-auto rounded-full mb-6" />

          {/* Ring skeleton */}
          <div className="shimmer h-[140px] w-[140px] mx-auto rounded-full mb-6" />

          {/* Time skeleton */}
          <div className="shimmer h-7 w-48 mx-auto rounded-lg mb-2" />
          <div className="shimmer h-4 w-36 mx-auto rounded-lg mb-4" />

          {/* Sky line skeleton */}
          <div className="shimmer h-4 w-56 mx-auto rounded-lg mb-1" />
          <div className="shimmer h-4 w-44 mx-auto rounded-lg" />
        </div>

        {/* Spot card skeleton */}
        <div className="card">
          <div className="shimmer h-4 w-24 rounded-lg mb-3" />
          <div className="shimmer h-5 w-40 rounded-lg mb-2" />
          <div className="shimmer h-4 w-32 rounded-lg" />
        </div>
      </div>

      {/* Status text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-sm italic text-white/40 font-body"
      >
        Reading the sky...
      </motion.p>
    </div>
  );
}
