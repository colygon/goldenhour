import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AlertSignup can work in two modes:
 *  - Standalone: renders its own trigger button, manages isOpen internally
 *  - Controlled: when `open` + `onClose` props are provided, the parent drives open state
 *    and the trigger button is hidden.
 */
export default function AlertSignup({ open: externalOpen, onClose: externalClose, mode = 'sun' }) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen   = isControlled ? externalOpen    : internalOpen;
  const handleOpen  = () => { if (!isControlled) setInternalOpen(true); };
  const handleClose = () => { isControlled ? externalClose?.() : setInternalOpen(false); };

  const [phone, setPhone] = useState('');
  const [threshold, setThreshold] = useState('great');
  const [leadTime, setLeadTime] = useState('60');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      const alert = {
        phone: `+1${phone.replace(/\D/g, '')}`,
        threshold,
        leadMinutes: parseInt(leadTime),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('gh_alert', JSON.stringify(alert));
      setSubmitted(true);
      setError('');
    } catch {
      setError('Something went wrong. Try again.');
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-3"
      >
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          🔔 You're in! We'll text you when it's worth watching.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Trigger button — only rendered in standalone (uncontrolled) mode */}
      {!isControlled && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleOpen}
          className="w-full h-11 rounded-[var(--radius-xl)] bg-white/10 border border-[color:var(--border)] backdrop-blur-sm text-sm font-body"
          style={{
            color: 'var(--muted-foreground)',
            boxShadow: '0 0 20px rgba(255,140,0,0.12)',
          }}
        >
          🔔 {mode === 'moon' ? 'Alert me for epic moon nights' : "Text me when it's epic"}
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={handleClose}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="sheet z-60"
            >
              <div className="sheet-handle" />

              <h3 className="text-lg font-display font-bold text-white mb-5">
                {mode === 'moon' ? '🌙 Moon alerts' : '🔔 Sunset alerts'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone */}
                <div>
                  <label className="label-eyebrow block mb-3">
                    Phone number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>+1</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="input-glass flex-1"
                    />
                  </div>
                </div>

                {/* Threshold */}
                <div>
                  <label className="label-eyebrow block mb-3">
                    Alert me when it's
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'great', label: 'Great or better' },
                      { value: 'epic', label: 'Epic only' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        data-active={threshold === opt.value}
                        onClick={() => setThreshold(opt.value)}
                        className="btn-toggle"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead time */}
                <div>
                  <label className="label-eyebrow block mb-3">
                    How early?
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: '60', label: '1hr before' },
                      { value: '90', label: '90 min' },
                      { value: '120', label: '2hrs' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        data-active={leadTime === opt.value}
                        onClick={() => setLeadTime(opt.value)}
                        className="btn-toggle"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button type="submit" className="btn-primary">
                  Sign me up
                </button>

                <p className="text-xs text-center" style={{ color: 'var(--subtle-foreground)' }}>
                  Your number is only used for sunset alerts. No spam. Ever. Reply STOP to cancel.
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
