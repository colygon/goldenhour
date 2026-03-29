import { useState, useEffect } from 'react';

export function useSunTimes(lat, lon) {
  const [sunTimes, setSunTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchSunTimes = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`
        );
        const data = await res.json();

        if (data.status === 'OK') {
          const sunset = new Date(data.results.sunset);
          const sunrise = new Date(data.results.sunrise);
          // Golden hour: ~1 hour before sunset
          const goldenHour = new Date(sunset.getTime() - 60 * 60 * 1000);

          setSunTimes({
            sunset,
            sunrise,
            goldenHour,
            sunsetFormatted: sunset.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            }),
            goldenHourFormatted: goldenHour.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            }),
          });
        } else {
          setError('Failed to fetch sun times');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSunTimes();
  }, [lat, lon]);

  return { sunTimes, loading, error };
}
