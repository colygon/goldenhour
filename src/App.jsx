import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from './components/VideoBackground';
import MusicPlayer from './components/MusicPlayer';
import SunsetCard from './components/SunsetCard';
import SpotCard from './components/SpotCard';
import AlertSignup from './components/AlertSignup';
import LoadingState from './components/LoadingState';
import NearbyBadge from './components/community/NearbyBadge';
import CommunityFeed from './components/community/CommunityFeed';
import { useLocation } from './hooks/useLocation';
import { useSunTimes } from './hooks/useSunTimes';
import { useSunsetScore } from './hooks/useSunsetScore';
import { useCommunityFeed } from './hooks/useCommunityFeed';
import { findBestSpots } from './lib/spotFinder';

function CityInput({ onSubmit }) {
  const [city, setCity] = useState('');
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#1a0a00] via-[#2d1200] to-[#0a0a0a]">
      <h1 className="text-3xl font-display font-bold text-white mb-3">
        🌅 GoldenHour
      </h1>
      <p className="text-sm text-white/50 mb-6">
        Location access was denied. Enter your city:
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (city.trim()) onSubmit(city.trim());
        }}
        className="w-full max-w-xs flex gap-2"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="San Francisco"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
          autoFocus
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold"
        >
          Go
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const { location, error: locationError, loading: locationLoading, setManualLocation } = useLocation();
  const { sunTimes, loading: sunLoading } = useSunTimes(location?.lat, location?.lon);
  const {
    score,
    tier,
    skyLine,
    loading: scoreLoading,
  } = useSunsetScore(location?.lat, location?.lon, sunTimes?.sunset);
  const { posts, loading: feedLoading } = useCommunityFeed(location?.lat, location?.lon);

  const [spots, setSpots] = useState([]);
  const [showFeed, setShowFeed] = useState(false);

  // Fetch spots when location is available
  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    findBestSpots(location.lat, location.lon).then(setSpots);
  }, [location?.lat, location?.lon]);

  const isLoading = locationLoading || sunLoading || scoreLoading;

  // Location denied — show city input
  if (locationError && !location) {
    return <CityInput onSubmit={setManualLocation} />;
  }

  // Loading
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="relative min-h-svh">
      <VideoBackground tier={tier?.label || 'GREAT'} />

      {/* Main forecast panel */}
      <div className="relative z-10 min-h-svh flex flex-col items-center pt-12 pb-24 px-0">
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-display font-bold text-white mb-8"
        >
          🌅 GoldenHour
        </motion.h1>

        {/* Main card */}
        <SunsetCard
          score={score}
          tier={tier}
          sunTimes={sunTimes}
          skyLine={skyLine}
        />

        {/* Best spot */}
        <div className="mt-4 w-full max-w-sm">
          {spots[0] && <SpotCard spot={spots[0]} />}
        </div>

        {/* Nearby badge */}
        <div className="mt-4 w-full max-w-sm">
          <NearbyBadge
            count={Math.floor(Math.random() * 20) + 5}
            postCount={posts.length}
            onTap={() => setShowFeed(true)}
          />
        </div>

        {/* Alert signup */}
        <div className="mt-4 w-full max-w-sm">
          <AlertSignup />
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-sm mx-auto flex items-center justify-between">
            <MusicPlayer />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFeed(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20"
            >
              📸 Post your shot
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              whileTap={{ rotate: 180 }}
              onClick={() => window.location.reload()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/15 text-white/70 text-sm"
            >
              ↻
            </motion.button>
          </div>
        </div>
      </div>

      {/* Community feed overlay */}
      <AnimatePresence>
        {showFeed && (
          <CommunityFeed
            posts={posts}
            loading={feedLoading}
            lat={location?.lat}
            lon={location?.lon}
            sunsetScore={score}
            onClose={() => setShowFeed(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
