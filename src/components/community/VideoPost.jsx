import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LocationTag from './LocationTag';
import ReactionBar from './ReactionBar';

export default function VideoPost({ post }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
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
      className="rounded-[var(--radius-xl)] overflow-hidden border transition-colors hover:border-[color:var(--border)]"
      style={{
        background: 'var(--surface-hover)',
        borderColor: 'var(--border-subtle)',
      }}
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
          className="btn-icon absolute bottom-3 right-3 !bg-black/50 !border-transparent backdrop-blur-sm"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <span className="text-sm">{muted ? '🔇' : '🔊'}</span>
        </button>
      </div>
      {/* Caption overlay on video */}
      {post.caption && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
          padding: '32px 14px 48px',
          pointerEvents: 'none',
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
      <div className="px-3 py-2">
        <LocationTag locationName={post.location_name} createdAt={post.created_at} />
        <ReactionBar postId={post.id} />
      </div>
    </motion.div>
  );
}
