import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoBackground from './components/VideoBackground';
import MusicPlayer from './components/MusicPlayer';
import SunsetCard from './components/SunsetCard';
import SpotCard from './components/SpotCard';
import AlertsView from './components/AlertsView';
import LoadingState from './components/LoadingState';
import MoonCard from './components/MoonCard';
import Dock from './components/Dock';
import MapView from './components/MapView';
import LiveCamsView from './components/live/LiveCamsView';
import CommunityFeed from './components/community/CommunityFeed';
import { useLocation } from './hooks/useLocation';
import { useSunTimes } from './hooks/useSunTimes';
import { useSunsetScore } from './hooks/useSunsetScore';
import { useCommunityFeed } from './hooks/useCommunityFeed';
import { useMoonData } from './hooks/useMoonData';
import { findBestSpots } from './lib/spotFinder';
import SunsetRater from './components/SunsetRater';

// ─── Sun / Moon mode toggle ─────────────────────────────────────────────────
function SunMoonToggle({ mode, onChange }) {
  const opts = [
    { id: 'sun',  emoji: '☀️', label: 'Sun mode',  color: 'rgba(255,140,0,0.28)'   },
    { id: 'moon', emoji: '🌙', label: 'Moon mode', color: 'rgba(126,178,255,0.28)' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      border: '0.5px solid rgba(255,255,255,0.15)',
      borderRadius: '9999px',
      padding: '3px', gap: '1px',
    }}>
      {opts.map(({ id, emoji, label, color }) => (
        <motion.button
          key={id}
          onClick={() => onChange(id)}
          whileTap={{ scale: 0.82 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          aria-label={label}
          style={{
            width: '40px', height: '36px', borderRadius: '9999px',
            border: 'none', cursor: 'pointer', fontSize: '17px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: mode === id ? color : 'transparent',
            transition: 'background 220ms ease',
          }}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}

// ─── City fallback screen ───────────────────────────────────────────────────
function CityInput({ onSubmit }) {
  const [city, setCity] = useState('');
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-gradient-to-b from-[#1a0a00] via-[#2d1200] to-[#0a0a0a]">
      <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-3">
        🌅 GoldenHour
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Location access was denied. Enter your city:
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (city.trim()) onSubmit(city.trim());
        }}
        className="w-full max-w-sm flex gap-3"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="San Francisco"
          className="input-glass flex-1"
          autoFocus
        />
        <button
          type="submit"
          className="h-11 px-5 rounded-[var(--radius-md)] bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold"
        >
          Go
        </button>
      </form>
    </div>
  );
}

// ─── Main app ───────────────────────────────────────────────────────────────
export default function App() {
  // UI mode state — must be declared BEFORE data hooks that depend on it
  const [contentMode, setContentMode] = useState('sun'); // 'sun' | 'moon'

  // Data hooks
  const { location, error: locationError, loading: locationLoading, setManualLocation } = useLocation();
  const { sunTimes, loading: sunLoading } = useSunTimes(location?.lat, location?.lon);
  const { score, tier, skyLine, loading: scoreLoading } = useSunsetScore(
    location?.lat, location?.lon, sunTimes?.sunset
  );
  const { posts, loading: feedLoading } = useCommunityFeed(location?.lat, location?.lon, contentMode);
  const { data: moonData } = useMoonData(location?.lat, location?.lon);

  // Remaining UI state
  const [spots, setSpots]               = useState([]);
  const [activeTab, setActiveTab]       = useState('today');
  const [showRater, setShowRater]       = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleTabChange = (tab) => {
    if (tab === 'today') setContentMode('sun');
    if (tab === 'moon')  setContentMode('moon');
    setActiveTab(tab);
  };

  const handleModeChange = (newMode) => {
    setContentMode(newMode);
    // Auto-swap the content tab when toggling between sun and moon
    if (newMode === 'moon' && activeTab === 'today') setActiveTab('moon');
    if (newMode === 'sun'  && activeTab === 'moon')  setActiveTab('today');
  };

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    findBestSpots(location.lat, location.lon).then(setSpots);
  }, [location?.lat, location?.lon]);

  const isLoading = locationLoading || sunLoading || scoreLoading;

  if ((locationError && !location) || showLocationPicker) {
    return (
      <CityInput
        onSubmit={(city) => {
          setManualLocation(city);
          setShowLocationPicker(false);
        }}
      />
    );
  }
  if (isLoading) {
    return <LoadingState />;
  }

  // Background tier follows the active content mode
  const activeTier  = contentMode === 'moon' ? (moonData?.tier  ?? tier)  : tier;
  const activeScore = contentMode === 'moon' ? (moonData?.score ?? score) : score;

  return (
    <div className="relative min-h-svh">
      {/* Background — swaps gradient palette based on mode */}
      <VideoBackground tier={activeTier?.label || 'GREAT'} mode={contentMode} />

      {/* ── Sunset tab ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 min-h-svh flex flex-col items-center"
          style={{ paddingTop: '48px', paddingBottom: '112px' }}
          >
            {/* Logo + location */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-bold tracking-tight text-white"
              style={{ fontSize: '1.5rem', marginBottom: '6px' }}
            >
              🌅 GoldenHour
            </motion.h1>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowLocationPicker(true)}
              style={{
                fontSize: '0.75rem',
                color: 'var(--subtle-foreground)',
                marginBottom: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              📍 {location?.city ?? `${location?.lat.toFixed(1)}°, ${location?.lon.toFixed(1)}°`}
            </motion.button>

            {/* Main card */}
            <div className="content-col">
              <SunsetCard
                score={score}
                tier={tier}
                sunTimes={sunTimes}
                skyLine={skyLine}
                onAlertTap={() => handleTabChange('alerts')}
              />
            </div>

            {/* Best spot */}
            <div className="content-col" style={{ marginTop: '20px' }}>
              {spots[0] && <SpotCard spot={spots[0]} />}
            </div>

            {/* Rate button */}
            <div className="content-col" style={{ marginTop: '16px' }}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowRater(true)}
                className="w-full h-12 rounded-[var(--radius-xl)] text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,140,0,0.22), rgba(255,179,0,0.18))',
                  border: '1px solid rgba(255,140,0,0.35)',
                  color: '#FFB300',
                  boxShadow: '0 0 24px rgba(255,140,0,0.12)',
                }}
              >
                ⭐ Rate Tonight's Sunset
              </motion.button>
            </div>

            {/* Alert shortcut */}
            <div className="content-col" style={{ marginTop: '10px' }}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabChange('alerts')}
                className="w-full h-11 rounded-[var(--radius-xl)] bg-white/10 border border-[color:var(--border)] backdrop-blur-sm text-sm font-body"
                style={{
                  color: 'var(--muted-foreground)',
                  boxShadow: '0 0 20px rgba(255,140,0,0.10)',
                }}
              >
                🔔 Text me when it's epic
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Moon tab ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'moon' && (
          <motion.div
            key="moon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 min-h-svh flex flex-col items-center"
          style={{ paddingTop: '48px', paddingBottom: '112px' }}
          >
            {/* Logo + location */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display font-bold tracking-tight text-white"
              style={{ fontSize: '1.5rem', marginBottom: '6px' }}
            >
              🌙 GoldenHour
            </motion.h1>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowLocationPicker(true)}
              style={{
                fontSize: '0.75rem',
                color: 'var(--subtle-foreground)',
                marginBottom: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              📍 {location?.city ?? `${location?.lat.toFixed(1)}°, ${location?.lon.toFixed(1)}°`}
            </motion.button>

            {/* Moon card */}
            <div className="content-col">
              <MoonCard data={moonData} />
            </div>

            {/* Rate moonrise button */}
            <div className="content-col" style={{ marginTop: '12px' }}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowRater(true)}
                className="w-full h-12 rounded-[var(--radius-xl)] text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(126,178,255,0.22), rgba(167,139,250,0.18))',
                  border: '1px solid rgba(126,178,255,0.35)',
                  color: '#7EB2FF',
                  boxShadow: '0 0 24px rgba(126,178,255,0.12)',
                }}
              >
                ⭐ Rate Tonight's Moonrise
              </motion.button>
            </div>

            {/* Moon alert shortcut */}
            <div className="content-col" style={{ marginTop: '10px' }}>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTabChange('alerts')}
                className="w-full h-11 rounded-[var(--radius-xl)] bg-white/10 border border-[color:var(--border)] backdrop-blur-sm text-sm font-body"
                style={{
                  color: 'var(--muted-foreground)',
                  boxShadow: '0 0 20px rgba(100,150,255,0.10)',
                }}
              >
                🌙 Alert me for epic moon nights
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map tab ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab === 'map' && (
          <MapView lat={location?.lat} lon={location?.lon} />
        )}
      </AnimatePresence>

      {/* ── Live Cams tab ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab === 'live' && (
          <LiveCamsView lat={location?.lat} lon={location?.lon} />
        )}
      </AnimatePresence>

      {/* ── Feed tab ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab === 'feed' && (
          <CommunityFeed
            posts={posts}
            loading={feedLoading}
            lat={location?.lat}
            lon={location?.lon}
            sunsetScore={activeScore}
            mode={contentMode}
            onClose={() => handleTabChange('today')}
          />
        )}
      </AnimatePresence>

      {/* ── Alerts full-screen page ──────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab === 'alerts' && (
          <AlertsView onClose={() => handleTabChange('today')} mode={contentMode} />
        )}
      </AnimatePresence>

      {/* ── Sunset / Moonrise rater ───────────────────────────────────────── */}
      <AnimatePresence>
        {showRater && (
          <SunsetRater
            mode={contentMode}
            lat={location?.lat}
            lon={location?.lon}
            sunsetScore={activeScore}
            onClose={() => setShowRater(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Persistent top bar: music player left, mode toggle right ─────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="fixed z-30"
        style={{ top: 'max(16px, env(safe-area-inset-top))', left: '16px' }}
      >
        <MusicPlayer />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed z-30"
        style={{ top: 'max(16px, env(safe-area-inset-top))', right: '16px' }}
      >
        <SunMoonToggle mode={contentMode} onChange={handleModeChange} />
      </motion.div>

      {/* ── Dock ──────────────────────────────────────────────────────────── */}
      <Dock active={activeTab} onChange={handleTabChange} mode={contentMode} />
    </div>
  );
}
