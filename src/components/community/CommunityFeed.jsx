import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostUploader from './PostUploader';

const STORY_DURATION_MS = 5000;

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// Instagram-style avatar with location initial
function Avatar({ name }) {
  const letter = (name || '?')[0].toUpperCase();
  return (
    <div style={{
      width: '34px', height: '34px', borderRadius: '50%',
      background: 'linear-gradient(135deg,#FF5500,#FFB300)',
      border: '2px solid rgba(255,255,255,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 700, color: '#fff',
      flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

export default function CommunityFeed({ posts, loading, lat, lon, sunsetScore, onClose }) {
  const [index, setIndex]               = useState(0);
  const [progress, setProgress]         = useState(0);
  const [paused, setPaused]             = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const pressTimer  = useRef(null);
  const isPressLong = useRef(false);

  const goNext = useCallback(() => {
    setIndex(i => {
      if (i >= posts.length - 1) { onClose(); return i; }
      return i + 1;
    });
    setProgress(0);
  }, [posts.length, onClose]);

  const goPrev = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
    setProgress(0);
  }, []);

  useEffect(() => {
    if (loading || posts.length === 0 || paused) return;
    const TICK = 50;
    const id = setInterval(() => {
      setProgress(p => {
        const next = p + (TICK / STORY_DURATION_MS) * 100;
        if (next >= 100) { goNext(); return 0; }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [loading, posts.length, paused, goNext, index]);

  useEffect(() => { setProgress(0); }, [index]);

  const handlePointerDown = () => {
    isPressLong.current = false;
    pressTimer.current = setTimeout(() => {
      isPressLong.current = true;
      setPaused(true);
    }, 220);
  };

  const handlePointerUp = (e) => {
    clearTimeout(pressTimer.current);
    setPaused(false);
    if (!isPressLong.current) {
      const x = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
      if (x < window.innerWidth / 3) goPrev();
      else goNext();
    }
    isPressLong.current = false;
  };

  // ── Empty / loading ───────────────────────────────────────────────────────
  if (loading || posts.length === 0) {
    return (
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontSize: '3rem', marginBottom: '16px' }}>
            {loading ? '📸' : '📸'}
          </p>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            {loading ? 'Loading shots…' : 'No shots yet tonight'}
          </p>
          {!loading && (
            <>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)',
                marginBottom: '24px' }}>
                Be the first to post from tonight's golden hour.
              </p>
              <button onClick={() => setShowUploader(true)} className="btn-primary"
                style={{ width: 'auto', padding: '0 24px' }}>
                + Post your shot
              </button>
            </>
          )}
        </div>
        <button onClick={onClose} className="btn-icon"
          style={{ position: 'absolute', top: '48px', right: '16px' }}>✕</button>
        {showUploader && (
          <PostUploader onClose={() => setShowUploader(false)}
            lat={lat} lon={lon} sunsetScore={sunsetScore} />
        )}
      </motion.div>
    );
  }

  const post = posts[index];

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50,
        background: '#000', overflow: 'hidden' }}
    >
      {/* ── Full-screen photo ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.img
          key={post.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          src={post.media_url}
          alt={post.caption || 'Sunset photo'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', userSelect: 'none' }}
          draggable={false}
        />
      </AnimatePresence>

      {/* ── Top gradient ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '180px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Bottom gradient ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '260px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Progress bars ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', gap: '3px',
        padding: '0 10px',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
      }}>
        {posts.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '2px', borderRadius: '9999px',
            background: 'rgba(255,255,255,0.35)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '9999px', background: '#fff',
              width: i < index ? '100%' : i === index ? `${Math.min(progress, 100)}%` : '0%',
              transition: i === index && !paused ? 'none' : 'width 0.1s linear',
            }} />
          </div>
        ))}
      </div>

      {/* ── Instagram-style header ─────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
        top: 'max(20px, env(safe-area-inset-top))',
        paddingTop: '18px',
      }}>
        {/* Left: avatar + name + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar name={post.location_name} />
          <div>
            <p style={{
              color: '#fff', fontWeight: 700, fontSize: '14px',
              lineHeight: 1.2,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              {post.location_name || 'Nearby'}
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.70)', fontSize: '12px',
              marginTop: '1px', lineHeight: 1,
            }}>
              {timeAgo(post.created_at)}
              {post.sunset_score && (
                <span style={{ color: 'rgba(255,160,40,0.95)', marginLeft: '6px' }}>
                  ☀️ {post.sunset_score}/100
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: counter + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'rgba(255,255,255,0.50)', fontSize: '12px' }}>
            {index + 1} / {posts.length}
          </span>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Caption — Instagram style ───────────────────────────────────────── */}
      {post.caption && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
          padding: '0 20px',
          paddingBottom: 'max(88px, calc(env(safe-area-inset-bottom) + 70px))',
        }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={post.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                color: '#fff',
                fontSize: '1.35rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              }}
            >
              {post.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* ── Tap zones ──────────────────────────────────────────────────────── */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 20, cursor: 'pointer' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          clearTimeout(pressTimer.current);
          setPaused(false);
          isPressLong.current = false;
        }}
      />

      {/* ── Pause indicator ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none' }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}>
              <div style={{ width: '4px', height: '20px', background: '#fff', borderRadius: '9999px' }} />
              <div style={{ width: '4px', height: '20px', background: '#fff', borderRadius: '9999px' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post FAB ───────────────────────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        onClick={e => { e.stopPropagation(); setShowUploader(true); }}
        style={{
          position: 'fixed', zIndex: 40,
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#FF5500,#FFB300)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', color: '#fff', fontWeight: 700,
          boxShadow: '0 4px 16px rgba(255,85,0,0.40)',
          bottom: 'max(24px, calc(env(safe-area-inset-bottom) + 12px))',
          right: '20px', border: 'none', cursor: 'pointer',
        }}
        aria-label="Post your shot"
      >
        +
      </motion.button>

      {showUploader && (
        <PostUploader onClose={() => setShowUploader(false)}
          lat={lat} lon={lon} sunsetScore={sunsetScore} />
      )}
    </motion.div>
  );
}
