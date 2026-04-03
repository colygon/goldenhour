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
          className="sheet absolute"
        >
          <div className="sheet-handle" />

          <h3 className="text-lg font-display font-bold text-white" style={{ marginBottom: '20px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }}
                  className="rounded-[var(--radius-xl)] border text-center transition-colors hover:border-[color:var(--border)]"
                  style={{
                    background: 'var(--surface-hover)',
                    borderColor: 'var(--border-subtle)',
                    paddingTop: '32px', paddingBottom: '32px',
                  }}
                >
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>📷</span>
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Take Photo</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }}
                  className="rounded-[var(--radius-xl)] border text-center transition-colors hover:border-[color:var(--border)]"
                  style={{
                    background: 'var(--surface-hover)',
                    borderColor: 'var(--border-subtle)',
                    paddingTop: '32px', paddingBottom: '32px',
                  }}
                >
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>🖼</span>
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>From Library</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="relative rounded-[var(--radius-xl)] overflow-hidden">
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
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="btn-icon absolute top-3 right-3 !bg-black/50 !border-transparent"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={120}
                placeholder="What do you see?"
                className="input-glass"
              />

              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="btn-primary relative overflow-hidden"
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
