import { motion } from 'framer-motion';

export default function LoadingState() {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(to bottom, #1a0a00, #2d1200, #0a0a0a)',
      }}
    >
      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="font-display font-bold tracking-tight text-white"
        style={{ fontSize: '1.875rem', marginBottom: '32px' }}
      >
        🌅 GoldenHour
      </motion.h1>

      {/* Shimmer skeletons */}
      <div className="content-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card">
          <div className="shimmer" style={{ height: '12px', width: '80px', margin: '0 auto 24px', borderRadius: '9999px' }} />
          <div className="shimmer" style={{ height: '140px', width: '140px', margin: '0 auto 24px', borderRadius: '50%' }} />
          <div className="shimmer" style={{ height: '28px', width: '192px', margin: '0 auto 8px', borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: '16px', width: '144px', margin: '0 auto 16px', borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: '16px', width: '224px', margin: '0 auto 8px', borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: '16px', width: '176px', margin: '0 auto', borderRadius: 'var(--radius-sm)' }} />
        </div>

        <div className="card">
          <div className="shimmer" style={{ height: '12px', width: '96px', marginBottom: '12px', borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: '20px', width: '160px', marginBottom: '8px', borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: '16px', width: '128px', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>

      {/* Status */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm italic font-body"
        style={{ color: 'var(--muted-foreground)', marginTop: '32px' }}
      >
        Reading the sky...
      </motion.p>
    </div>
  );
}
