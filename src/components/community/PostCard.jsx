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
        className="rounded-2xl overflow-hidden bg-white/5 border border-white/10"
      >
        <button
          onClick={() => setLightbox(true)}
          className="w-full block"
        >
          <img
            src={post.media_url}
            alt={post.caption || 'Sunset photo'}
            className="w-full aspect-[4/5] object-cover"
            loading="lazy"
          />
        </button>
        <div className="px-3 py-2">
          {post.caption && (
            <p className="text-sm text-white/70 line-clamp-2">{post.caption}</p>
          )}
          <LocationTag
            locationName={post.location_name}
            createdAt={post.created_at}
          />
          <ReactionBar postId={post.id} />
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
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
