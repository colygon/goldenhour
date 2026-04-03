import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';
import {
  getMoonPhaseInfo,
  getSpecialEvents,
  getNextFullMoon,
  computeMoonScore,
  moonScoreToTier,
} from '../lib/moonEngine';

/**
 * Computes moon data for tonight at the given lat/lon.
 * Pure calculation — no network requests.
 *
 * @param {number|null} lat
 * @param {number|null} lon
 * @param {number} cloudCoverLow  - % low cloud cover from weather API (0-100)
 */
export function useMoonData(lat, lon, cloudCoverLow = 20) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;

    const now = new Date();

    const moonTimes = SunCalc.getMoonTimes(now, lat, lon);
    const moonPos   = SunCalc.getMoonPosition(now, lat, lon);
    const altitudeDeg = (moonPos.altitude * 180) / Math.PI;

    const phaseInfo = getMoonPhaseInfo(now);
    const events    = getSpecialEvents(now, lat, lon);
    const score     = computeMoonScore(phaseInfo, cloudCoverLow, altitudeDeg);
    const tier      = moonScoreToTier(score, events);

    const nextFull   = getNextFullMoon(now);
    const daysToFull = Math.max(0, Math.round((nextFull - now) / 86_400_000));

    const fmt = (d) => {
      if (!d || isNaN(d)) return null;
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    setData({
      moonrise:          moonTimes.rise,
      moonset:           moonTimes.set,
      moonriseFormatted: fmt(moonTimes.rise),
      moonsetFormatted:  fmt(moonTimes.set),
      phaseInfo,
      events,
      score,
      tier,
      nextFullMoon: nextFull,
      daysToFull,
      altitudeDeg,
      distanceKm: Math.round(moonPos.distance / 1000),
    });
    setLoading(false);
  }, [lat, lon, cloudCoverLow]);

  return { data, loading };
}
