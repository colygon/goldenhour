import { useState } from 'react';
import { motion } from 'framer-motion';

const REACTIONS = ['🔥', '✨', '😐'];

export default function ReactionBar({ postId }) {
  const [selected, setSelected] = useState(null);
  const [floatingEmoji, setFloatingEmoji] = useState(null);

  const handleReact = (emoji) => {
    if (selected === emoji) {
      setSelected(null);
      return;
    }
    setSelected(emoji);
    setFloatingEmoji(emoji);
    setTimeout(() => setFloatingEmoji(null), 800);
  };

  return (
    <div className="relative flex items-center gap-1 mt-2">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className={`text-base min-w-[44px] h-11 px-3 rounded-full flex items-center justify-center transition-colors ${
            selected === emoji
              ? 'bg-white/15'
              : 'bg-transparent hover:bg-white/5'
          }`}
        >
          {emoji}
        </button>
      ))}

      {floatingEmoji && (
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.8 }}
          className="absolute left-4 text-lg pointer-events-none"
        >
          {floatingEmoji}
        </motion.span>
      )}
    </div>
  );
}
