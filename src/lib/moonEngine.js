import SunCalc from 'suncalc';

// ─── Moon phase lookup table ────────────────────────────────────────────────
const PHASE_INFO = [
  { name: 'New Moon',        emoji: '🌑', range: [0,       0.0625] },
  { name: 'Waxing Crescent', emoji: '🌒', range: [0.0625,  0.1875] },
  { name: 'First Quarter',   emoji: '🌓', range: [0.1875,  0.3125] },
  { name: 'Waxing Gibbous',  emoji: '🌔', range: [0.3125,  0.4375] },
  { name: 'Full Moon',       emoji: '🌕', range: [0.4375,  0.5625] },
  { name: 'Waning Gibbous',  emoji: '🌖', range: [0.5625,  0.6875] },
  { name: 'Last Quarter',    emoji: '🌗', range: [0.6875,  0.8125] },
  { name: 'Waning Crescent', emoji: '🌘', range: [0.8125,  1.0000] },
];

const LUNAR_MONTH = 29.530588853; // days

// ─── Known lunar eclipses 2025-2030 ────────────────────────────────────────
const LUNAR_ECLIPSES = [
  { date: '2025-03-14', type: 'total' },
  { date: '2025-09-07', type: 'total' },
  { date: '2026-03-03', type: 'total' },
  { date: '2026-08-28', type: 'partial' },
  { date: '2028-07-06', type: 'partial' },
  { date: '2029-01-01', type: 'total' },
  { date: '2029-06-26', type: 'total' },
  { date: '2029-12-20', type: 'total' },
];

/**
 * Returns phase name, emoji, illumination %, and age in days.
 */
export function getMoonPhaseInfo(date = new Date()) {
  const illum = SunCalc.getMoonIllumination(date);
  // SunCalc phase: 0 = new moon, 0.5 = full moon (wraps at 1)
  const phase = ((illum.phase % 1) + 1) % 1;
  const info = PHASE_INFO.find(p => phase >= p.range[0] && phase < p.range[1]) || PHASE_INFO[0];
  return {
    phase,
    illumination: Math.round(illum.fraction * 100),
    name: info.name,
    emoji: info.emoji,
    age: phase * LUNAR_MONTH,
  };
}

/**
 * Returns an array of active special events (blood moon, supermoon, blue moon).
 */
export function getSpecialEvents(date = new Date(), lat = 0, lon = 0) {
  const events = [];

  // ── Lunar eclipse (within 24 hours of a known date) ──────────────────────
  for (const eclipse of LUNAR_ECLIPSES) {
    const eclipseMs = new Date(eclipse.date + 'T12:00:00Z').getTime();
    const diffHours = Math.abs(date.getTime() - eclipseMs) / 3_600_000;
    if (diffHours < 24) {
      events.push(
        eclipse.type === 'total'
          ? { type: 'blood_moon',      label: '🩸 Blood Moon',     rarity: 'legendary' }
          : { type: 'partial_eclipse', label: '🌑 Partial Eclipse', rarity: 'epic' }
      );
    }
  }

  // ── Supermoon: full moon + distance < 360 000 km ─────────────────────────
  const { phase } = getMoonPhaseInfo(date);
  if (phase >= 0.4375 && phase < 0.5625) {
    const pos = SunCalc.getMoonPosition(date, lat, lon);
    if (pos.distance < 360_000) {
      events.push({ type: 'supermoon', label: '🌕 Supermoon', rarity: 'epic' });
    }

    // ── Blue Moon: second full moon in the calendar month ──────────────────
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    for (let day = 1; day < d; day++) {
      const check = new Date(y, m, day);
      const p2 = ((SunCalc.getMoonIllumination(check).phase % 1) + 1) % 1;
      if (p2 >= 0.4375 && p2 < 0.5625) {
        events.push({ type: 'blue_moon', label: '🔵 Blue Moon', rarity: 'epic' });
        break;
      }
    }
  }

  return events;
}

/**
 * Returns the date of the next full moon after `from`.
 */
export function getNextFullMoon(from = new Date()) {
  const { phase } = getMoonPhaseInfo(from);
  const daysToFull = phase < 0.5
    ? (0.5 - phase) * LUNAR_MONTH
    : (1.5 - phase) * LUNAR_MONTH;
  return new Date(from.getTime() + daysToFull * 86_400_000);
}

/**
 * Computes a 0-100 moon-viewing score.
 * @param {object} phaseInfo - from getMoonPhaseInfo()
 * @param {number} cloudCoverLow - % low-altitude cloud cover (0-100)
 * @param {number} altitudeDeg - moon altitude above horizon in degrees
 */
export function computeMoonScore(phaseInfo, cloudCoverLow = 20, altitudeDeg = 30) {
  let score = 28;

  const { phase } = phaseInfo;

  // ── Phase contribution (biggest factor) ──────────────────────────────────
  if (phase >= 0.4375 && phase < 0.5625)  score += 42; // full moon
  else if (
    (phase >= 0.3125 && phase < 0.4375) ||
    (phase >= 0.5625 && phase < 0.6875)
  )                                         score += 24; // gibbous
  else if (
    (phase >= 0.1875 && phase < 0.3125) ||
    (phase >= 0.6875 && phase < 0.8125)
  )                                         score += 8;  // quarters
  else                                      score -= 12; // crescent / new

  // ── Cloud cover ───────────────────────────────────────────────────────────
  score -= (cloudCoverLow / 100) * 30;

  // ── Altitude ──────────────────────────────────────────────────────────────
  if (altitudeDeg > 30)      score += 12;
  else if (altitudeDeg > 15) score += 5;
  else if (altitudeDeg < 5)  score -= 20;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Maps a moon score + special events to a display tier.
 */
export function moonScoreToTier(score, events = []) {
  if (events.some(e => e.type === 'blood_moon'))
    return { label: 'LEGENDARY', emoji: '🩸', color: '#CC2200' };
  if (score >= 85) return { label: 'EPIC',   emoji: '🌕', color: '#4169E1' };
  if (score >= 68) return { label: 'GREAT',  emoji: '✨', color: '#5B8EDA' };
  if (score >= 50) return { label: 'DECENT', emoji: '🌓', color: '#6B7FAB' };
  if (score >= 30) return { label: 'MEH',    emoji: '😶', color: '#708090' };
  return               { label: 'SKIP',   emoji: '☁️', color: '#505060' };
}
