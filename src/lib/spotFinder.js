import { supabase } from './supabase';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// ─── Curated spots ───────────────────────────────────────────────────────────
// sunsetRating  — how good the western horizon view is (1–6)
// sunriseRating — how good the eastern horizon view is (1–6)
// Ratings of 0 mean the spot is actively bad for that direction and will be
// filtered out so it never appears in that mode.
const CURATED_SPOTS = [
  // ── Ocean-facing beaches (great for sunset, face west) ───────────────────
  { name: 'Ocean Beach',          type: 'beach',     lat: 37.7599, lon: -122.5108, sunsetRating: 6, sunriseRating: 0 },
  { name: 'Baker Beach',          type: 'beach',     lat: 37.7936, lon: -122.4837, sunsetRating: 5, sunriseRating: 0 },
  { name: 'China Beach',          type: 'beach',     lat: 37.7882, lon: -122.4893, sunsetRating: 4, sunriseRating: 0 },
  { name: 'Rodeo Beach',          type: 'beach',     lat: 37.8368, lon: -122.5305, sunsetRating: 5, sunriseRating: 0 },
  { name: 'Stinson Beach',        type: 'beach',     lat: 37.8946, lon: -122.6459, sunsetRating: 5, sunriseRating: 0 },
  { name: 'Muir Beach',           type: 'beach',     lat: 37.8596, lon: -122.5810, sunsetRating: 4, sunriseRating: 0 },

  // ── West-facing headlands & cliffs (sunset only) ─────────────────────────
  { name: "Land's End",           type: 'viewpoint', lat: 37.7786, lon: -122.5139, sunsetRating: 6, sunriseRating: 0 },
  { name: 'Marin Headlands',      type: 'viewpoint', lat: 37.8302, lon: -122.4996, sunsetRating: 6, sunriseRating: 0 },
  { name: 'Hawk Hill',            type: 'peak',      lat: 37.8325, lon: -122.4982, sunsetRating: 6, sunriseRating: 0 },
  { name: 'Point Bonita',         type: 'cape',      lat: 37.8149, lon: -122.5289, sunsetRating: 5, sunriseRating: 0 },
  { name: 'Fort Cronkhite',       type: 'viewpoint', lat: 37.8368, lon: -122.5235, sunsetRating: 4, sunriseRating: 0 },

  // ── 360° peaks — great for both ──────────────────────────────────────────
  { name: 'Twin Peaks',           type: 'peak',      lat: 37.7544, lon: -122.4477, sunsetRating: 5, sunriseRating: 5 },
  { name: 'Mount Tamalpais',      type: 'peak',      lat: 37.9238, lon: -122.5975, sunsetRating: 6, sunriseRating: 5 },
  { name: 'Mount Davidson',       type: 'peak',      lat: 37.7399, lon: -122.4537, sunsetRating: 4, sunriseRating: 3 },
  { name: 'Bernal Heights Park',  type: 'peak',      lat: 37.7411, lon: -122.4152, sunsetRating: 3, sunriseRating: 4 },
  { name: 'Corona Heights Park',  type: 'peak',      lat: 37.7634, lon: -122.4394, sunsetRating: 3, sunriseRating: 4 },
  { name: 'Buena Vista Park',     type: 'peak',      lat: 37.7695, lon: -122.4414, sunsetRating: 3, sunriseRating: 4 },

  // ── Bay-facing / east-facing — great for sunrise ─────────────────────────
  { name: 'Treasure Island',      type: 'viewpoint', lat: 37.8237, lon: -122.3705, sunsetRating: 5, sunriseRating: 6 },
  { name: 'Coit Tower',           type: 'viewpoint', lat: 37.8024, lon: -122.4059, sunsetRating: 3, sunriseRating: 6 },
  { name: 'Angel Island',         type: 'viewpoint', lat: 37.8614, lon: -122.4348, sunsetRating: 4, sunriseRating: 5 },
  { name: 'The Embarcadero',      type: 'pier',      lat: 37.7955, lon: -122.3937, sunsetRating: 1, sunriseRating: 5 },
  { name: 'Pier 39',              type: 'pier',      lat: 37.8087, lon: -122.4098, sunsetRating: 1, sunriseRating: 5 },
  { name: 'Sausalito Waterfront', type: 'marina',    lat: 37.8590, lon: -122.4852, sunsetRating: 2, sunriseRating: 5 },
  { name: 'Berkeley Marina',      type: 'marina',    lat: 37.8661, lon: -122.3280, sunsetRating: 4, sunriseRating: 2 },
  { name: 'Ina Coolbrith Park',   type: 'viewpoint', lat: 37.7985, lon: -122.4150, sunsetRating: 2, sunriseRating: 5 },

  // ── Mixed waterfront & parks ─────────────────────────────────────────────
  { name: 'Fort Point',           type: 'viewpoint', lat: 37.8105, lon: -122.4773, sunsetRating: 4, sunriseRating: 2 },
  { name: 'Crissy Field',         type: 'park',      lat: 37.8033, lon: -122.4649, sunsetRating: 4, sunriseRating: 3 },
  { name: 'Candlestick Point',    type: 'park',      lat: 37.7149, lon: -122.3827, sunsetRating: 2, sunriseRating: 3 },
  { name: 'Dolores Park',         type: 'park',      lat: 37.7596, lon: -122.4269, sunsetRating: 3, sunriseRating: 2 },
  { name: 'Potrero Hill',         type: 'peak',      lat: 37.7586, lon: -122.4006, sunsetRating: 2, sunriseRating: 3 },

  // ── Rooftop bars & restaurants ───────────────────────────────────────────
  { name: 'Top of the Mark',      type: 'rooftop',   lat: 37.7928, lon: -122.4130, sunsetRating: 5, sunriseRating: 4 },
  { name: "Charmaine's",          type: 'rooftop',   lat: 37.7783, lon: -122.4147, sunsetRating: 4, sunriseRating: 3 },
  { name: 'El Techo',             type: 'rooftop',   lat: 37.7524, lon: -122.4183, sunsetRating: 3, sunriseRating: 3 },
  { name: 'Salesforce Park',      type: 'rooftop',   lat: 37.7896, lon: -122.3965, sunsetRating: 3, sunriseRating: 5 },
  { name: '1 Hotel Rooftop',      type: 'rooftop',   lat: 37.7944, lon: -122.3944, sunsetRating: 2, sunriseRating: 5 },
  { name: 'Dirty Habit',          type: 'rooftop',   lat: 37.7852, lon: -122.4039, sunsetRating: 3, sunriseRating: 2 },
  { name: 'The View Lounge',      type: 'rooftop',   lat: 37.7845, lon: -122.4028, sunsetRating: 3, sunriseRating: 3 },
  { name: 'Nopa Rooftop',         type: 'rooftop',   lat: 37.7762, lon: -122.4323, sunsetRating: 3, sunriseRating: 2 },

  // ── Shinjuku / Tokyo, Japan ───────────────────────────────────────────────
  { name: 'Tokyo Metropolitan Gov. Observatory', type: 'viewpoint', lat: 35.6896, lon: 139.6921, sunsetRating: 5, sunriseRating: 4 },
  { name: 'Shibuya Sky',          type: 'rooftop',   lat: 35.6580, lon: 139.7016, sunsetRating: 5, sunriseRating: 5 },
  { name: 'Odaiba Seaside Park',  type: 'park',      lat: 35.6248, lon: 139.7739, sunsetRating: 5, sunriseRating: 4 },
  { name: 'Tokyo Tower',          type: 'viewpoint', lat: 35.6585, lon: 139.7454, sunsetRating: 4, sunriseRating: 4 },
  { name: 'Tokyo Skytree',        type: 'viewpoint', lat: 35.7101, lon: 139.8107, sunsetRating: 3, sunriseRating: 6 },
  { name: 'Hamarikyu Gardens',    type: 'park',      lat: 35.6596, lon: 139.7632, sunsetRating: 3, sunriseRating: 5 },
  { name: 'Shinjuku Gyoen',       type: 'park',      lat: 35.6852, lon: 139.7100, sunsetRating: 3, sunriseRating: 3 },
  { name: 'Ueno Park',            type: 'park',      lat: 35.7156, lon: 139.7734, sunsetRating: 2, sunriseRating: 4 },
  { name: 'Inokashira Park',      type: 'park',      lat: 35.7013, lon: 139.5769, sunsetRating: 4, sunriseRating: 2 },

  // ── Playa Santa Teresa, Costa Rica ───────────────────────────────────────
  { name: 'Playa Santa Teresa',   type: 'beach',     lat:  9.6497, lon: -85.1682, sunsetRating: 6, sunriseRating: 0 },
  { name: 'Playa Carmen',         type: 'beach',     lat:  9.6325, lon: -85.1712, sunsetRating: 6, sunriseRating: 0 },
  { name: 'Mal Pais',             type: 'beach',     lat:  9.6161, lon: -85.1718, sunsetRating: 5, sunriseRating: 0 },
  { name: 'Playa Hermosa',        type: 'beach',     lat:  9.5990, lon: -85.1708, sunsetRating: 5, sunriseRating: 0 },
  { name: 'Cabo Blanco Reserve',  type: 'cape',      lat:  9.7034, lon: -85.0927, sunsetRating: 5, sunriseRating: 2 },
  { name: 'Punta Cuevas',         type: 'viewpoint', lat:  9.6395, lon: -85.1755, sunsetRating: 4, sunriseRating: 1 },
  { name: 'Montezuma Beach',      type: 'beach',     lat:  9.6512, lon: -85.0690, sunsetRating: 3, sunriseRating: 5 },
  { name: 'Hotel Nantipa Deck',   type: 'rooftop',   lat:  9.6501, lon: -85.1668, sunsetRating: 5, sunriseRating: 1 },

  // ── Noida / Delhi NCR, India ─────────────────────────────────────────────
  { name: 'Yamuna Ghat',          type: 'park',      lat: 28.6139, lon:  77.3521, sunsetRating: 4, sunriseRating: 4 },
  { name: 'Okhla Bird Sanctuary', type: 'park',      lat: 28.5348, lon:  77.3262, sunsetRating: 3, sunriseRating: 5 },
  { name: 'Lotus Temple',         type: 'viewpoint', lat: 28.5535, lon:  77.2588, sunsetRating: 4, sunriseRating: 3 },
  { name: 'Humayun\'s Tomb',      type: 'viewpoint', lat: 28.5933, lon:  77.2507, sunsetRating: 4, sunriseRating: 3 },
  { name: 'Qutub Minar',          type: 'viewpoint', lat: 28.5245, lon:  77.1855, sunsetRating: 4, sunriseRating: 3 },
  { name: 'India Gate Lawns',     type: 'park',      lat: 28.6129, lon:  77.2295, sunsetRating: 3, sunriseRating: 4 },
  { name: 'Akshardham Ghats',     type: 'park',      lat: 28.6127, lon:  77.2773, sunsetRating: 3, sunriseRating: 5 },
  { name: 'Noida Golf Course',    type: 'park',      lat: 28.5497, lon:  77.3389, sunsetRating: 3, sunriseRating: 2 },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_PRIORITY = {
  beach: 6, cape: 6, headland: 5, cliff: 5, peak: 4, viewpoint: 4,
  rooftop: 4, pier: 3, breakwater: 3, marina: 3, ferry: 2, dock: 2, park: 1,
};

const FEATURE_COPY = {
  beach:      'Unobstructed ocean horizon',
  cape:       'Panoramic coastal views',
  headland:   'Open cliffside views',
  cliff:      'Dramatic elevated coastline',
  peak:       'Elevated 360° panorama',
  viewpoint:  'Designated scenic overlook',
  rooftop:    'Rooftop bar with open sky views',
  pier:       'Open water vista',
  breakwater: 'Waterfront vantage point',
  marina:     'Waterfront with open sky',
  ferry:      'On-water views',
  dock:       'Waterfront access',
  park:       'Open sky access',
};

function getFeature(type) { return FEATURE_COPY[type] || 'Open sky access'; }

function scoreCurated(spot, userLat, userLon, facing, maxKm = 35) {
  const dist = haversineKm(userLat, userLon, spot.lat, spot.lon);
  if (dist > maxKm) return -1;

  const rating = facing === 'east' ? spot.sunriseRating : spot.sunsetRating;
  if (rating === 0) return -1; // wrong direction for this mode

  // Distance penalty: closer is better
  const distPenalty = Math.min(dist / 25, 1) * 4;

  return rating * 2 - distPenalty;
}

// ─── Overpass query (supplemental) ───────────────────────────────────────────
function buildQuery(lat, lon) {
  return `[out:json][timeout:10];
(
  node["natural"="peak"](around:20000,${lat},${lon});
  node["tourism"="viewpoint"](around:20000,${lat},${lon});
  node["natural"="beach"](around:20000,${lat},${lon});
  node["natural"="cliff"](around:20000,${lat},${lon});
  node["natural"="cape"](around:20000,${lat},${lon});
  node["man_made"="pier"](around:20000,${lat},${lon});
  node["leisure"="marina"](around:15000,${lat},${lon});
  way["natural"="beach"](around:20000,${lat},${lon});
);
out body center 20;`;
}

function osmType(el) {
  const t = el.tags || {};
  if (t.natural === 'beach')     return 'beach';
  if (t.natural === 'cape')      return 'cape';
  if (t.natural === 'cliff')     return 'cliff';
  if (t.natural === 'peak')      return 'peak';
  if (t.tourism === 'viewpoint') return 'viewpoint';
  if (t.man_made === 'pier')     return 'pier';
  if (t.leisure === 'marina')    return 'marina';
  return 'park';
}

function scoreOsm(el, userLat, userLon) {
  const lat = el.lat || el.center?.lat;
  const lon = el.lon || el.center?.lon;
  if (!lat || !lon) return -1;
  const dist = haversineKm(userLat, userLon, lat, lon);
  if (dist > 35) return -1;
  const type = osmType(el);
  const distPenalty = Math.min(dist / 25, 1) * 5;
  return (TYPE_PRIORITY[type] || 1) - distPenalty;
}

// ─── Spots cache ──────────────────────────────────────────────────────────────
// Source of truth:  Supabase `spots` table (permanent, cloud-stored)
// Client cache:     localStorage — survives page reloads, no TTL
// Offline fallback: CURATED_SPOTS hardcoded above

const LS_ALL_KEY = 'gh_spots_all_v2'; // bump suffix to force a one-time refresh

async function loadAllSpotsFromSource() {
  // 1. Check localStorage first — instant if already fetched
  try {
    const raw = localStorage.getItem(LS_ALL_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }

  // 2. Fetch from Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('name,type,lat,lon,sunset_rating,sunrise_rating');
      if (!error && data?.length) {
        // Normalise column names to camelCase so the rest of the code is unchanged
        const normalised = data.map(r => ({
          name:          r.name,
          type:          r.type,
          lat:           r.lat,
          lon:           r.lon,
          sunsetRating:  r.sunset_rating,
          sunriseRating: r.sunrise_rating,
        }));
        try { localStorage.setItem(LS_ALL_KEY, JSON.stringify(normalised)); } catch { /* quota */ }
        return normalised;
      }
    } catch { /* fall through to hardcoded */ }
  }

  // 3. Hardcoded fallback (offline / Supabase not yet seeded)
  return CURATED_SPOTS;
}

function cacheKey(lat, lon, facing, maxKm) {
  return `gh_scored_${lat.toFixed(3)}_${lon.toFixed(3)}_${facing}_${maxKm === Infinity ? 'all' : maxKm}`;
}

function readScoredCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeScoredCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota */ }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function findBestSpots(lat, lon, limit = 10, facing = 'west', maxKm = 35) {
  const key = cacheKey(lat, lon, facing, maxKm);

  // Return permanently-cached scored results if available
  const cached = readScoredCache(key);
  if (cached) return cached;

  // Load all spots (Supabase → localStorage → hardcoded)
  const allSpots = await loadAllSpotsFromSource();

  // 1. Score and filter
  const curated = allSpots
    .map(spot => ({
      ...spot,
      feature:  getFeature(spot.type),
      distance: `${(haversineKm(lat, lon, spot.lat, spot.lon) / 1.60934).toFixed(1)} mi`,
      score:    scoreCurated(spot, lat, lon, facing, maxKm),
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // 2. Overpass API — only for local queries (not global map view)
  //    When maxKm = Infinity the curated global list is already complete.
  let apiSpots = [];
  if (maxKm !== Infinity) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(buildQuery(lat, lon))}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (data.elements?.length) {
        apiSpots = data.elements
          .map(el => {
            const spotLat = el.lat || el.center?.lat;
            const spotLon = el.lon || el.center?.lon;
            if (!spotLat || !spotLon || !el.tags?.name) return null;
            const type = osmType(el);
            const dist = haversineKm(lat, lon, spotLat, spotLon);
            return {
              name:     el.tags.name,
              type,
              feature:  getFeature(type),
              distance: `${(dist / 1.60934).toFixed(1)} mi`,
              lat: spotLat, lon: spotLon,
              score: scoreOsm(el, lat, lon),
            };
          })
          .filter(s => s && s.score > 0);
      }
    } catch { /* API unavailable — curated list is sufficient */ }
  }

  // 3. Merge: curated first, API supplements unnamed/additional spots
  const curatedNames = new Set(curated.map(s => s.name.toLowerCase()));
  const merged = [
    ...curated,
    ...apiSpots.filter(s => !curatedNames.has(s.name.toLowerCase())),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (merged.length === 0) {
    return [{
      name: facing === 'east' ? 'Any east-facing viewpoint' : 'Any west-facing spot',
      feature: facing === 'east'
        ? 'Find open sky with a clear eastern horizon'
        : 'Find open sky with a clear western horizon',
      distance: null, type: 'general',
    }];
  }

  writeScoredCache(key, merged);
  return merged;
}
