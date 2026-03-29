import { motion } from 'framer-motion';

export default function NearbyBadge({ count = 0, postCount = 0, onTap }) {
  if (count === 0 && postCount === 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0 }}
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      className="mx-4 w-[calc(100%-2rem)] py-3 flex items-center justify-center gap-3 text-sm text-white/50 font-body"
    >
      {count > 0 && <span>👥 {count} people watching nearby</span>}
      {postCount > 0 && (
        <span className="text-white/30">
          · {postCount} shot{postCount !== 1 ? 's' : ''} posted
        </span>
      )}
    </motion.button>
  );
}
