import { motion } from 'framer-motion';

const TYPE_ICONS = {
  beach: '🏖',
  peak: '⛰',
  viewpoint: '🔭',
  rooftop: '🍸',
  pier: '🌊',
  park: '🌳',
  general: '📍',
};

export default function SpotCard({ spot }) {
  if (!spot) return null;

  const icon = TYPE_ICONS[spot.type] || '📍';

  const handleDirections = () => {
    if (spot.lat && spot.lon) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`,
        '_blank'
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      whileTap={{ y: -4 }}
      className="card cursor-pointer group hover:border-[color:var(--border-strong)] transition-colors"
      onClick={handleDirections}
    >
      <p className="label-eyebrow" style={{ marginBottom: '12px' }}>📍 Best Spot</p>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3 className="font-display font-bold tracking-tight text-white" style={{ fontSize: '1.125rem' }}>
            {icon} {spot.name}
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)', marginTop: '4px' }}>
            ★ {spot.feature}
          </p>
        </div>
        {spot.distance && (
          <span className="text-sm" style={{ color: 'var(--subtle-foreground)', marginTop: '4px', whiteSpace: 'nowrap' }}>
            {spot.distance} →
          </span>
        )}
      </div>
    </motion.div>
  );
}
