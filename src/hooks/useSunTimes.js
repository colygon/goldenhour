import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';

const fmt = (d) =>
  d?.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

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
          const sunset    = new Date(data.results.sunset);
          const sunrise   = new Date(data.results.sunrise);
          const goldenHour = new Date(sunset.getTime() - 60 * 60 * 1000);

          // TODAY's actual sunset via SunCalc — the API returns tomorrow's when
          // called after today's sunset has already passed, so we need a reliable
          // local reference for the isPastSunset check.
          const todayTimes  = SunCalc.getTimes(new Date(), lat, lon);
          const todaySunset = todayTimes.sunset; // always today's astronomical sunset

          // Tomorrow's sunset for the "come back tomorrow" CTA
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowTimes  = SunCalc.getTimes(tomorrow, lat, lon);
          const tomorrowSunset = tomorrowTimes.sunset;
          const tomorrowGolden = new Date(tomorrowSunset.getTime() - 60 * 60 * 1000);

          // The displayed sunset time: use the API value (it's the next coming sunset,
          // which is "today's" when called before sunset, "tomorrow's" when after).
          // For post-sunset, show todaySunset formatted time instead.
          const isPast = new Date() > todaySunset;
          const displaySunset   = isPast ? todaySunset  : sunset;
          const displayGolden   = new Date(displaySunset.getTime() - 60 * 60 * 1000);

          const tomorrowSunrise        = tomorrowTimes.sunrise;
          const tomorrowMorningGolden  = new Date(tomorrowSunrise.getTime() - 60 * 60 * 1000);

          setSunTimes({
            sunset:        todaySunset,          // reliable today's sunset for isPastSunset
            sunrise,
            goldenHour:    displayGolden,
            sunsetFormatted:     fmt(displaySunset),
            goldenHourFormatted: fmt(displayGolden),
            tomorrowSunset,
            tomorrowSunsetFormatted:      fmt(tomorrowSunset),
            tomorrowGoldenFormatted:      fmt(tomorrowGolden),
            tomorrowSunrise,
            tomorrowSunriseFormatted:     fmt(tomorrowSunrise),
            tomorrowMorningGoldenFormatted: fmt(tomorrowMorningGolden),
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
