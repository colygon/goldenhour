import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { WEBCAMS } from '../../lib/webcams';
import { haversineKm } from '../../lib/supabase';
import WebcamCard from './WebcamCard';

function fmtDist(km) {
  if (km == null) return null;
  const mi = km / 1.60934;
  return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
}

export default function LiveCamsView({ lat, lon }) {
  const sorted = useMemo(() => {
    if (!lat || !lon) return WEBCAMS;
    return [...WEBCAMS]
      .map(c => ({ ...c, _km: haversineKm(lat, lon, c.lat, c.lon) }))
      .sort((a, b) => a._km - b._km);
  }, [lat, lon]);

  const nearby = sorted.filter(c => c._km != null && c._km < 200);
  const far    = sorted.filter(c => c._km == null || c._km >= 200);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10,
        overflowY: 'auto',
        background: 'var(--background)',
      }}
    >
      <div style={{ maxWidth: '480px', marginInline: 'auto', padding: '0 16px 120px' }}>

        {/* Header */}
        <div style={{ padding: 'max(52px, calc(env(safe-area-inset-top) + 16px)) 0 20px' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
          }}>
            📡 Live Cams
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            {nearby.length > 0
              ? `${nearby.length} cam${nearby.length !== 1 ? 's' : ''} near you · ${far.length} worldwide`
              : `${sorted.length} webcams worldwide`}
          </p>
        </div>

        {/* Nearby section */}
        {nearby.length > 0 && (
          <>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--subtle-foreground)',
              marginBottom: '12px',
            }}>
              Near you
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {nearby.map(cam => (
                <WebcamCard key={cam.id} cam={cam} distance={fmtDist(cam._km)} />
              ))}
            </div>
          </>
        )}

        {/* Worldwide section */}
        {far.length > 0 && (
          <>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--subtle-foreground)',
              marginBottom: '12px',
            }}>
              Worldwide
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {far.map(cam => (
                <WebcamCard key={cam.id} cam={cam} distance={fmtDist(cam._km)} />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
