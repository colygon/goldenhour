import { useState } from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import VideoPost from './VideoPost';
import PostUploader from './PostUploader';

export default function CommunityFeed({ posts, loading, lat, lon, sunsetScore, onClose }) {
  const [showUploader, setShowUploader] = useState(false);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-30 bg-[#0a0a0a] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-lg px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            Tonight's Shots
          </h2>
          <p className="text-sm text-white/40 mt-0.5">
            {posts.length} post{posts.length !== 1 ? 's' : ''} nearby
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Grid */}
      <div className="px-3 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer rounded-2xl aspect-[4/5]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📸</p>
            <p className="text-white/40 text-sm">
              No shots yet tonight. Be the first!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((post, i) => {
              // Full-width video every 5th post
              if (post.media_type === 'video') {
                return (
                  <div key={post.id} className="col-span-2">
                    <VideoPost post={post} />
                  </div>
                );
              }
              return <PostCard key={post.id} post={post} />;
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        onClick={() => setShowUploader(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/30"
      >
        +
      </motion.button>

      {/* Uploader */}
      {showUploader && (
        <PostUploader
          onClose={() => setShowUploader(false)}
          lat={lat}
          lon={lon}
          sunsetScore={sunsetScore}
        />
      )}
    </motion.div>
  );
}
