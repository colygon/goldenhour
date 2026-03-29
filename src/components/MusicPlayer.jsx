import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('gh_music');
    if (saved === 'on') setPlaying(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.volume = 0;
      audio.play().catch(() => setPlaying(false));
      // Fade in
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.02, 0.4);
        audio.volume = vol;
        if (vol >= 0.4) clearInterval(fade);
      }, 50);
      localStorage.setItem('gh_music', 'on');
    } else {
      audio.pause();
      localStorage.setItem('gh_music', 'off');
    }
  }, [playing]);

  return (
    <>
      <audio ref={audioRef} src="/audio/sunsets-ambient.mp3" loop preload="none" />
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setPlaying(!playing)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/15 backdrop-blur-sm"
        aria-label={playing ? 'Pause music' : 'Play music'}
      >
        {playing ? (
          <div className="flex items-end gap-[2px] h-4">
            <div className="eq-bar" />
            <div className="eq-bar" />
            <div className="eq-bar" />
          </div>
        ) : (
          <span className="text-white/70 text-sm">♪</span>
        )}
      </motion.button>
    </>
  );
}
