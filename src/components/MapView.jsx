import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { findBestSpots } from '../lib/spotFinder';
import { supabase } from '../lib/supabase';

// Fix Leaflet's broken default icon URLs in Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', iconRetinaUrl: '', shadowUrl: '' });

// ─── Type emoji map ─────────────────────────────────────────────────────────
const TYPE_ICONS = {
  beach: '🏖', peak: '⛰', viewpoint: '🔭', pier: '🌊', park: '🌳',
  cape: '🏔', headland: '🏔', cliff: '🧗', breakwater: '⚓', marina: '⛵',
  rooftop: '🍸', ferry: '⛴', dock: '🚢', general: '📍', user: '📍',
};

// ─── Custom pin marker ───────────────────────────────────────────────────────
function createSpotIcon(type, isTop, viewMode, isUser = false) {
  const emoji = TYPE_ICONS[type] || '📍';
  const sunriseBg  = 'linear-gradient(135deg,#FF8C42,#FFCF77)';
  const sunsetBg   = 'linear-gradient(135deg,#FF5500,#FFB300)';
  const userBg     = 'linear-gradient(135deg,#7EB2FF,#a78bfa)';
  const dimSunrise = 'linear-gradient(135deg,rgba(255,140,66,0.65),rgba(255,207,119,0.65))';
  const dimSunset  = 'linear-gradient(135deg,rgba(255,85,0,0.65),rgba(255,179,0,0.65))';
  const bg = isUser
    ? userBg
    : isTop
      ? (viewMode === 'sunrise' ? sunriseBg : sunsetBg)
      : (viewMode === 'sunrise' ? dimSunrise : dimSunset);

  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:${bg};border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 3px 14px rgba(${isUser ? '126,178,255' : '255,100,0'},0.55);border:2px solid rgba(255,255,255,0.85);"><span style="transform:rotate(45deg);font-size:17px;line-height:1;display:block;">${emoji}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
}

// ─── Recenter on first load only ─────────────────────────────────────────────
function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.setView([lat, lon], 13, { animate: true });
  }, [lat, lon, map]);
  return null;
}

// ─── Tracks map bounds whenever the user pans or zooms ───────────────────────
function BoundsWatcher({ onChange }) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds()),
    zoomend: () => onChange(map.getBounds()),
  });
  useEffect(() => { onChange(map.getBounds()); }, []); // eslint-disable-line
  return null;
}

// ─── Always tracks map center (used by add-pin mode) ─────────────────────────
function CenterTracker({ onCenter }) {
  const map = useMapEvents({
    move: () => onCenter(map.getCenter()),
  });
  useEffect(() => { onCenter(map.getCenter()); }, []); // eslint-disable-line
  return null;
}

// ─── Module-level cache — one entry per mode, persists across re-renders ─────
const spotsCache = new Map();

// ─── Best-for multi-toggle options ───────────────────────────────────────────
const BEST_FOR_OPTS = [
  { id: 'sunset',   label: '☀️ Sunset'   },
  { id: 'sunrise',  label: '🌄 Sunrise'  },
  { id: 'moonrise', label: '🌙 Moonrise' },
];

// ─── MapView ─────────────────────────────────────────────────────────────────
export default function MapView({ lat, lon }) {
  const [viewMode, setViewMode] = useState('sunset');
  const [allSpots, setAllSpots] = useState([]);
  const [bounds, setBounds]     = useState(null);
  const [loading, setLoading]   = useState(true);

  // Add-a-spot state
  const [addMode, setAddMode]     = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [formName, setFormName]   = useState('');
  const [formBestFor, setFormBestFor] = useState(['sunset']);
  const [saving, setSaving]       = useState(false);
  const mapCenterRef = useRef({ lat: lat ?? 37.7749, lng: -(lon ? -lon : 122.4194) });

  // Load ALL curated spots (no distance cap) once per mode switch
  const loadAll = useCallback(async (mode) => {
    if (!lat || !lon) return;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)},${mode},all`;
    if (spotsCache.has(key)) {
      setAllSpots(spotsCache.get(key));
      setLoading(false);
      return;
    }
    setLoading(true);
    const facing  = mode === 'sunrise' ? 'east' : 'west';
    const results = await findBestSpots(lat, lon, Infinity, facing, Infinity);
    spotsCache.set(key, results);
    setAllSpots(results);
    setLoading(false);
  }, [lat, lon]);

  useEffect(() => { loadAll(viewMode); }, [loadAll, viewMode]);

  const visibleSpots = (bounds && allSpots.length)
    ? allSpots.filter(s => s.lat && s.lon && bounds.contains([s.lat, s.lon]))
    : [];

  const center      = [lat ?? 37.7749, lon ?? -122.4194];
  const isSunrise   = viewMode === 'sunrise';
  const accentColor = isSunrise ? '#FFCF77' : '#FF8C00';
  const bestLabel   = isSunrise ? '⭐ Best sunrise spot' : '⭐ Best spot tonight';

  const dirHint = loading
    ? 'Loading spots…'
    : addMode
      ? 'Pan map to position, then tap Place Pin'
      : visibleSpots.length > 0
        ? `${visibleSpots.length} spot${visibleSpots.length !== 1 ? 's' : ''} in view`
        : 'No spots in view — pan or zoom out';

  // ── Toggle a "best for" option ────────────────────────────────────────────
  const toggleBestFor = (id) => {
    setFormBestFor(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(x => x !== id) : prev   // keep at least one
        : [...prev, id]
    );
  };

  // ── Save the user-added spot ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    const { lat: pinLat, lng: pinLng } = mapCenterRef.current;
    const sunsetRating  = formBestFor.includes('sunset')   ? 8 : (formBestFor.includes('moonrise') ? 4 : 0);
    const sunriseRating = formBestFor.includes('sunrise')  ? 8 : (formBestFor.includes('moonrise') ? 4 : 0);

    const newSpot = {
      name: formName.trim(),
      type: 'user',
      lat: pinLat,
      lon: pinLng,
      sunsetRating,
      sunriseRating,
      isUserAdded: true,
    };

    // Optimistically add to local list so it shows on map immediately
    setAllSpots(prev => [newSpot, ...prev]);

    // Try to persist to Supabase (requires an INSERT policy on the spots table)
    if (supabase) {
      supabase.from('spots').insert({
        name: newSpot.name,
        type: newSpot.type,
        lat: newSpot.lat,
        lon: newSpot.lon,
        sunset_rating: sunsetRating,
        sunrise_rating: sunriseRating,
      }).then(() => {}).catch(() => {});
    }

    setSaving(false);
    setShowForm(false);
    setAddMode(false);
    setFormName('');
    setFormBestFor(['sunset']);
  };

  const cancelAdd = () => {
    setAddMode(false);
    setShowForm(false);
    setFormName('');
    setFormBestFor(['sunset']);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
    >
      {/* ── Leaflet isolated stacking context ─────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <RecenterMap lat={lat} lon={lon} />
          <BoundsWatcher onChange={setBounds} />
          <CenterTracker onCenter={c => { mapCenterRef.current = c; }} />

          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {/* User location dot */}
          {lat && lon && (
            <CircleMarker
              center={[lat, lon]}
              radius={10}
              pathOptions={{
                color: accentColor, fillColor: accentColor,
                fillOpacity: 0.9, weight: 3,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui', fontSize: 13, minWidth: 120 }}>
                  <strong>📍 You are here</strong>
                </div>
              </Popup>
            </CircleMarker>
          )}

          {/* All spots currently in the viewport */}
          {visibleSpots.map((spot, i) => (
            <Marker
              key={`${spot.lat}-${spot.lon}-${i}`}
              position={[spot.lat, spot.lon]}
              icon={createSpotIcon(spot.type, i === 0, viewMode, spot.isUserAdded)}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui', fontSize: 13, minWidth: 170 }}>
                  <strong style={{ fontSize: 14 }}>
                    {TYPE_ICONS[spot.type] || '📍'} {spot.name}
                  </strong>
                  {spot.isUserAdded && (
                    <p style={{ color: '#7EB2FF', fontSize: 11, margin: '3px 0 2px', fontWeight: 700 }}>
                      ✦ Added by you
                    </p>
                  )}
                  {spot.feature && (
                    <p style={{ color: '#666', margin: '4px 0 2px' }}>★ {spot.feature}</p>
                  )}
                  {spot.distance && (
                    <p style={{ color: '#999', fontSize: 11 }}>{spot.distance} away</p>
                  )}
                  {i === 0 && !spot.isUserAdded && (
                    <p style={{ color: accentColor, fontSize: 11, fontWeight: 700, margin: '4px 0 0' }}>
                      {bestLabel}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block', marginTop: 8, padding: '6px 0',
                      color: accentColor, fontWeight: 700, fontSize: 12,
                      textDecoration: 'none', borderTop: '1px solid #eee',
                    }}
                  >
                    Get Directions →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Crosshair pin — shown in add mode ─────────────────────────────── */}
      <AnimatePresence>
        {addMode && !showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -100%)',
              zIndex: 25, pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg,#7EB2FF,#a78bfa)',
              borderRadius: '50% 50% 50% 4px',
              transform: 'rotate(-45deg)',
              boxShadow: '0 4px 20px rgba(126,178,255,0.7)',
              border: '2.5px solid rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ transform: 'rotate(45deg)', fontSize: '20px', lineHeight: 1 }}>+</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header overlay ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          padding: '56px 20px 40px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 70%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: 0 }}>
          {addMode ? 'Drop a Pin' : (isSunrise ? 'Sunrise Spots' : 'Sunset Spots')}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>
          {dirHint}
        </p>
      </div>

      {/* ── Sunrise / Sunset toggle (hidden in add mode) ──────────────────── */}
      <AnimatePresence>
        {!addMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 'max(56px, calc(env(safe-area-inset-top) + 44px))',
              right: '16px', zIndex: 20,
              display: 'flex', gap: '2px', padding: '3px',
              borderRadius: '9999px',
              background: 'rgba(10,10,10,0.85)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            {[
              { id: 'sunset',  label: '🌅 Sunset'  },
              { id: 'sunrise', label: '🌄 Sunrise' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                style={{
                  padding: '6px 14px', borderRadius: '9999px',
                  fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  transition: 'all 200ms ease',
                  background: viewMode === id
                    ? (id === 'sunrise'
                      ? 'linear-gradient(to right,#FF8C42,#FFCF77)'
                      : 'linear-gradient(to right,#FF5500,#FFB300)')
                    : 'transparent',
                  color: viewMode === id ? '#000' : 'rgba(255,255,255,0.55)',
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── "Place Pin" confirm bar — shown in add mode ───────────────────── */}
      <AnimatePresence>
        {addMode && !showForm && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'absolute', zIndex: 30,
              bottom: 'max(100px, calc(env(safe-area-inset-bottom) + 88px))',
              left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '10px', alignItems: 'center',
            }}
          >
            <button
              onClick={cancelAdd}
              style={{
                height: '44px', padding: '0 20px', borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.20)',
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: 'rgba(255,255,255,0.70)', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setShowForm(true)}
              style={{
                height: '44px', padding: '0 24px', borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg,#7EB2FF,#a78bfa)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 4px 16px rgba(126,178,255,0.45)',
                cursor: 'pointer',
              }}
            >
              📍 Place Pin Here
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Spot FAB (hidden in add mode) ────────────────────────────── */}
      <AnimatePresence>
        {!addMode && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setAddMode(true)}
            style={{
              position: 'absolute', zIndex: 20,
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#7EB2FF,#a78bfa)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', color: '#fff', fontWeight: 700,
              boxShadow: '0 4px 18px rgba(126,178,255,0.45)',
              bottom: 'max(100px, calc(env(safe-area-inset-bottom) + 88px))',
              right: '20px',
            }}
            aria-label="Add a spot"
          >
            +
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Add Spot form sheet ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 35,
              background: 'rgba(12,10,18,0.97)',
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              borderTop: '0.5px solid rgba(255,255,255,0.14)',
              borderRadius: '24px 24px 0 0',
              padding: '12px 20px',
              paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Handle */}
            <div style={{
              width: '40px', height: '4px', borderRadius: '9999px',
              background: 'rgba(255,255,255,0.18)',
              margin: '0 auto 20px',
            }} />

            <h3 style={{
              fontSize: '1.2rem', fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-display)',
              margin: '0 0 20px',
            }}>
              📍 Add a Spot
            </h3>

            {/* Location name */}
            <label style={{
              display: 'block',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)',
              marginBottom: '8px',
            }}>
              Location Name
            </label>
            <input
              autoFocus
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Eagle Rock Overlook"
              className="input-glass"
              style={{ marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}
            />

            {/* Best for */}
            <label style={{
              display: 'block',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--muted-foreground)',
              marginBottom: '10px',
            }}>
              Best For
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {BEST_FOR_OPTS.map(({ id, label }) => {
                const active = formBestFor.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleBestFor(id)}
                    style={{
                      height: '40px', padding: '0 16px', borderRadius: '9999px',
                      border: `1px solid ${active ? 'rgba(126,178,255,0.6)' : 'rgba(255,255,255,0.18)'}`,
                      background: active ? 'rgba(126,178,255,0.18)' : 'rgba(255,255,255,0.06)',
                      color: active ? '#7EB2FF' : 'rgba(255,255,255,0.60)',
                      fontSize: '0.85rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 180ms ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={cancelAdd}
                style={{
                  flex: 1, height: '48px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.60)', fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                style={{
                  flex: 2, height: '48px', borderRadius: '12px',
                  border: 'none',
                  background: formName.trim()
                    ? 'linear-gradient(135deg,#7EB2FF,#a78bfa)'
                    : 'rgba(255,255,255,0.10)',
                  color: formName.trim() ? '#fff' : 'rgba(255,255,255,0.30)',
                  fontWeight: 700, fontSize: '0.95rem',
                  boxShadow: formName.trim() ? '0 4px 16px rgba(126,178,255,0.35)' : 'none',
                  cursor: formName.trim() ? 'pointer' : 'default',
                  transition: 'all 200ms ease',
                }}
              >
                {saving ? 'Saving…' : '✓ Add Spot'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OSM attribution */}
      <p style={{
        position: 'absolute', bottom: '90px', right: '12px', zIndex: 20,
        fontSize: '10px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
      }}>
        © OpenStreetMap contributors
      </p>
    </motion.div>
  );
}
