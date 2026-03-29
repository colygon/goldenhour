import { motion } from 'framer-motion';

const TYPE_ICONS = {
  beach: '🏖',
  peak: '⛰',
  viewpoint: '🔭',
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
      className="card mx-4 cursor-pointer"
      onClick={handleDirections}
    >
      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
        📍 Best Spot
      </p>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-white">
            {icon} {spot.name}
          </h3>
          <p className="text-sm text-white/50 mt-1">★ {spot.feature}</p>
        </div>
        {spot.distance && (
          <span className="text-sm text-white/40 whitespace-nowrap mt-1">
            {spot.distance} →
          </span>
        )}
      </div>
    </motion.div>
  );
}
