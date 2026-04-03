import { useState, useEffect } from 'react';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || null;
  } catch {
    return null;
  }
}

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cached location — only use if fresh (within TTL)
    const cached = localStorage.getItem('gh_location');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed.cachedAt || 0);
        if (age < CACHE_TTL_MS) {
          setLocation(parsed);
          setLoading(false);
        }
      } catch {}
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        // Reverse geocode to get a human-readable city name
        const city = await reverseGeocode(lat, lon);
        const loc = { lat, lon, city, cachedAt: Date.now() };
        setLocation(loc);
        setLoading(false);
        localStorage.setItem('gh_location', JSON.stringify(loc));
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const setManualLocation = async (cityName) => {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
      );
      const data = await res.json();
      if (data.results?.length) {
        const { latitude, longitude, name } = data.results[0];
        const loc = { lat: latitude, lon: longitude, city: name, cachedAt: Date.now() };
        setLocation(loc);
        setError(null);
        localStorage.setItem('gh_location', JSON.stringify(loc));
      } else {
        setError('City not found');
      }
    } catch {
      setError('Failed to look up city');
    }
  };

  return { location, error, loading, setManualLocation };
}
