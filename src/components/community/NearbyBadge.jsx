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
      className="w-full min-h-[44px] flex items-center justify-center gap-3 text-sm font-body"
      style={{ color: 'var(--muted-foreground)' }}
    >
      {count > 0 && <span>👥 {count} people watching nearby</span>}
      {postCount > 0 && (
        <span style={{ color: 'var(--subtle-foreground)' }}>
          · {postCount} shot{postCount !== 1 ? 's' : ''} posted
        </span>
      )}
    </motion.button>
  );
}
