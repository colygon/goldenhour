import { useState, useEffect } from 'react';
import { computeSunsetScore, scoreToTier, generateSkyLine } from '../lib/scoreEngine';

export function useSunsetScore(lat, lon, sunsetTime) {
  const [score, setScore] = useState(null);
  const [tier, setTier] = useState(null);
  const [skyLine, setSkyLine] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchAndScore = async () => {
      try {
        setLoading(true);

        // Fetch weather and air quality in parallel
        const [weatherRes, aqiRes] = await Promise.all([
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,cloud_cover_high,cloud_cover_mid,cloud_cover_low,visibility,relative_humidity_2m,precipitation_probability,weather_code&daily=sunset,sunrise&forecast_days=1&timezone=auto`
          ),
          fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&forecast_days=1&timezone=auto`
          ),
        ]);

        const weather = await weatherRes.json();
        const aqi = await aqiRes.json();

        // Find the hour closest to sunset
        let sunsetHourIndex = 18; // default ~6pm
        if (sunsetTime) {
          sunsetHourIndex = sunsetTime.getHours();
        } else if (weather.daily?.sunset?.[0]) {
          const apiSunset = new Date(weather.daily.sunset[0]);
          sunsetHourIndex = apiSunset.getHours();
        }

        // Clamp to valid range
        sunsetHourIndex = Math.max(0, Math.min(23, sunsetHourIndex));

        const wx = {
          cloudCover: weather.hourly?.cloud_cover?.[sunsetHourIndex] ?? 50,
          cloudCoverHigh: weather.hourly?.cloud_cover_high?.[sunsetHourIndex] ?? 0,
          cloudCoverMid: weather.hourly?.cloud_cover_mid?.[sunsetHourIndex] ?? 0,
          cloudCoverLow: weather.hourly?.cloud_cover_low?.[sunsetHourIndex] ?? 0,
          visibility: (weather.hourly?.visibility?.[sunsetHourIndex] ?? 20000) / 1000, // m to km
          humidity: weather.hourly?.relative_humidity_2m?.[sunsetHourIndex] ?? 50,
          precipProbability: weather.hourly?.precipitation_probability?.[sunsetHourIndex] ?? 0,
          pm25: aqi.hourly?.pm2_5?.[sunsetHourIndex] ?? 5,
          fogProbability: 0, // derived below
        };

        // Derive fog probability from visibility + humidity
        if (wx.visibility < 1 && wx.humidity > 90) wx.fogProbability = 0.9;
        else if (wx.visibility < 5 && wx.humidity > 80) wx.fogProbability = 0.5;
        else if (wx.visibility < 10 && wx.humidity > 85) wx.fogProbability = 0.3;

        setWeatherData(wx);

        const computed = computeSunsetScore(wx);
        const computedTier = scoreToTier(computed);
        const line = generateSkyLine(wx, computedTier);

        setScore(computed);
        setTier(computedTier);
        setSkyLine(line);

        // Cache
        localStorage.setItem(
          'gh_last_score',
          JSON.stringify({ score: computed, tier: computedTier, skyLine: line, timestamp: Date.now() })
        );
      } catch (err) {
        setError(err.message);
        // Try cached
        const cached = localStorage.getItem('gh_last_score');
        if (cached) {
          const parsed = JSON.parse(cached);
          setScore(parsed.score);
          setTier(parsed.tier);
          setSkyLine(parsed.skyLine);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndScore();
  }, [lat, lon, sunsetTime]);

  return { score, tier, skyLine, loading, error, weatherData };
}
