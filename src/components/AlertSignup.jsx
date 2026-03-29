import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertSignup() {
  const [isOpen, setIsOpen] = useState(false);
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
      // In production, this would POST to /api/alerts
      // For now, store locally as a demo
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
        className="mx-4 text-center py-3"
      >
        <p className="text-sm text-white/60">
          🔔 You're in! We'll text you when it's worth watching.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        className="mx-4 w-[calc(100%-2rem)] py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-sm text-white/80 font-body"
        style={{
          boxShadow: '0 0 20px rgba(255,140,0,0.15)',
        }}
      >
        🔔 Text me when it's epic
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl p-6 max-w-lg mx-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

              <h3 className="text-lg font-display font-bold text-white mb-4">
                Sunset alerts
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Phone */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">
                    Phone number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/50">+1</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                {/* Threshold */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                    Alert me when it's
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'great', label: 'Great or better' },
                      { value: 'epic', label: 'Epic only' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setThreshold(opt.value)}
                        className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${
                          threshold === opt.value
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead time */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                    How early?
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: '60', label: '1hr before' },
                      { value: '90', label: '90 min' },
                      { value: '120', label: '2hrs' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLeadTime(opt.value)}
                        className={`flex-1 py-2 rounded-xl text-sm border transition-colors ${
                          leadTime === opt.value
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm"
                >
                  Sign me up
                </button>

                <p className="text-xs text-white/30 text-center">
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
