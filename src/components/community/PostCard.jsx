import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationTag from './LocationTag';
import ReactionBar from './ReactionBar';

export default function PostCard({ post }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--radius-xl)] overflow-hidden border transition-colors hover:border-[color:var(--border)]"
        style={{
          background: 'var(--surface-hover)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Image with caption overlay */}
        <button onClick={() => setLightbox(true)} className="w-full block relative">
          <img
            src={post.media_url}
            alt={post.caption || 'Sunset photo'}
            className="w-full aspect-[4/5] object-cover hover:opacity-95 transition-opacity"
            loading="lazy"
          />
          {/* Gradient scrim + caption */}
          {post.caption && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)',
              display: 'flex', alignItems: 'flex-end',
              padding: '16px 14px',
              textAlign: 'left',
            }}>
              <p style={{
                margin: 0,
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                textShadow: '0 1px 8px rgba(0,0,0,0.5)',
              }}>
                {post.caption}
              </p>
            </div>
          )}
        </button>
        <div className="px-3 py-2">
          <LocationTag locationName={post.location_name} createdAt={post.created_at} />
          <ReactionBar postId={post.id} />
        </div>
      </motion.div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={post.media_url}
              alt={post.caption || 'Sunset photo'}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
