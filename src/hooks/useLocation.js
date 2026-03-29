import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try cached location first
    const cached = localStorage.getItem('gh_location');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setLocation(parsed);
        setLoading(false);
      } catch {}
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
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
        const loc = { lat: latitude, lon: longitude, city: name };
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
