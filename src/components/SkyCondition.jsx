import { motion } from 'framer-motion';

export default function SkyCondition({ skyLine, tier }) {
  if (!skyLine) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="text-sm italic text-white/60 leading-relaxed max-w-xs mx-auto font-body"
    >
      "{skyLine}"
    </motion.p>
  );
}
