import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostUploader({ onClose, lat, lon, sunsetScore }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate
    if (f.size > 200 * 1024 * 1024) {
      alert('File too large (max 200MB)');
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);

    // Simulate upload for demo (no Cloudinary configured)
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p > 100) p = 100;
      setProgress(Math.round(p));
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          onClose?.();
        }, 500);
      }
    }, 200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl p-6 max-w-lg mx-auto"
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

          <h3 className="text-lg font-display font-bold text-white mb-4">
            Post your shot
          </h3>

          {!preview ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }}
                  className="py-8 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <span className="text-2xl block mb-1">📷</span>
                  <span className="text-sm text-white/60">Take Photo</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }}
                  className="py-8 rounded-2xl bg-white/5 border border-white/10 text-center"
                >
                  <span className="text-2xl block mb-1">🖼</span>
                  <span className="text-sm text-white/60">From Library</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-2xl overflow-hidden">
                {file?.type.startsWith('video/') ? (
                  <video
                    src={preview}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full aspect-[4/3] object-cover"
                  />
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/80 text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Caption */}
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={120}
                placeholder="What do you see?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
              />

              {/* Upload button */}
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm relative overflow-hidden disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 bg-white/20 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <span className="relative">{progress}%</span>
                  </>
                ) : (
                  'Share with nearby viewers →'
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
