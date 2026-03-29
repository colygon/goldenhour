import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LocationTag from './LocationTag';
import ReactionBar from './ReactionBar';

export default function VideoPost({ post }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  // Autoplay on scroll with Intersection Observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden bg-white/5 border border-white/10"
    >
      <div className="relative">
        <video
          ref={videoRef}
          src={post.media_url}
          muted={muted}
          loop
          playsInline
          className="w-full aspect-video object-cover"
        />
        <button
          onClick={() => setMuted(!muted)}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-xs text-white/80"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
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
  );
}
