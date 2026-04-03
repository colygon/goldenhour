import { useState, useEffect } from 'react';
import { supabase, haversineKm } from '../lib/supabase';

// ─── Sun posts (sunset / golden hour) ───────────────────────────────────────
const SUN_POSTS = [
  // ── San Francisco Bay Area ────────────────────────────────────────────────
  {
    id: 's1',
    lat: 37.7956, lon: -122.4829,
    media_url: 'https://images.pexels.com/photos/1141853/pexels-photo-1141853.jpeg?auto=compress&cs=tinysrgb&w=1080',
    media_type: 'photo',
    caption: 'The fog rolled in just as the sky turned pink 🌉',
    location_name: 'Baker Beach',
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    sunset_score: 94,
  },
  {
    id: 's2',
    lat: 37.8270, lon: -122.4801,
    media_url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1080&q=90&fit=crop',
    media_type: 'photo',
    caption: 'Teal sky, orange bridge. Worth every cold minute.',
    location_name: 'Marin Headlands',
    created_at: new Date(Date.now() - 13 * 60000).toISOString(),
    sunset_score: 91,
  },
  {
    id: 's3',
    lat: 37.8297, lon: -122.4995,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/San_Francisco_Bay%2C_Golden_Gate_Bridge_and_Marin_Headlands_at_sunset.jpg/1280px-San_Francisco_Bay%2C_Golden_Gate_Bridge_and_Marin_Headlands_at_sunset.jpg',
    media_type: 'photo',
    caption: 'The whole bay turns gold from up here 🌉',
    location_name: 'Hawk Hill',
    created_at: new Date(Date.now() - 22 * 60000).toISOString(),
    sunset_score: 97,
  },
  {
    id: 's4',
    lat: 37.7887, lon: -122.5092,
    media_url: 'https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=1080&q=90&fit=crop',
    media_type: 'photo',
    caption: "Pushed through the brush for this. No regrets.",
    location_name: "Land's End",
    created_at: new Date(Date.now() - 31 * 60000).toISOString(),
    sunset_score: 88,
  },
  {
    id: 's5',
    lat: 37.8302, lon: -122.5306,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Rodeo_Lagoon_sunset.jpg/1280px-Rodeo_Lagoon_sunset.jpg',
    media_type: 'photo',
    caption: 'Painted the whole lagoon orange tonight 🧡',
    location_name: 'Rodeo Beach',
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    sunset_score: 86,
  },
  {
    id: 's6',
    lat: 37.7525, lon: -122.4477,
    media_url: 'https://images.unsplash.com/photo-1506815444479-bfdb1e96c566?w=1080&q=90&fit=crop',
    media_type: 'photo',
    caption: 'Sky was absolutely on fire tonight 🔥',
    location_name: 'Twin Peaks',
    created_at: new Date(Date.now() - 49 * 60000).toISOString(),
    sunset_score: 92,
  },
  {
    id: 's7',
    lat: 37.7601, lon: -122.5105,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Beach_sf_ocean_beach_at_sunset.jpg',
    media_type: 'photo',
    caption: 'Miles of golden light at the edge of the city',
    location_name: 'Ocean Beach',
    created_at: new Date(Date.now() - 58 * 60000).toISOString(),
    sunset_score: 83,
  },
  // ── Tokyo, Japan ─────────────────────────────────────────────────────────
  {
    id: 's8',
    lat: 35.6584, lon: 139.7022,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Minato_City%2C_Tokyo%2C_Japan.jpg/1280px-Minato_City%2C_Tokyo%2C_Japan.jpg',
    media_type: 'photo',
    caption: 'Tokyo Tower burning gold at dusk 🗼',
    location_name: 'Shibuya Sky',
    created_at: new Date(Date.now() - 67 * 60000).toISOString(),
    sunset_score: 89,
  },
  {
    id: 's9',
    lat: 35.6586, lon: 139.7454,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Tokyo_Tower_At_Dusk_%28223572511%29.jpeg',
    media_type: 'photo',
    caption: 'Every evening feels like magic from up here ✨',
    location_name: 'Tokyo Tower',
    created_at: new Date(Date.now() - 76 * 60000).toISOString(),
    sunset_score: 87,
  },
  // ── Playa Santa Teresa, Costa Rica ────────────────────────────────────────
  {
    id: 's10',
    lat: 9.6497, lon: -85.1682,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Pacific_Sunset_Costa_Rica_0354.jpg/1280px-Pacific_Sunset_Costa_Rica_0354.jpg',
    media_type: 'photo',
    caption: 'Barefoot in the sand, watching the Pacific go orange 🌊',
    location_name: 'Playa Santa Teresa',
    created_at: new Date(Date.now() - 85 * 60000).toISOString(),
    sunset_score: 95,
  },
  // ── Delhi / Noida, India ──────────────────────────────────────────────────
  {
    id: 's11',
    lat: 28.6637, lon: 77.2827,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Sacred_Silence_at_Sunset_at_Yamuna.jpg/1280px-Sacred_Silence_at_Sunset_at_Yamuna.jpg',
    media_type: 'photo',
    caption: 'The Yamuna turns to fire every evening 🙏',
    location_name: 'Yamuna Ghat',
    created_at: new Date(Date.now() - 94 * 60000).toISOString(),
    sunset_score: 90,
  },
];

// ─── Moon posts (moonrise / lunar / night sky) ───────────────────────────────
const MOON_POSTS = [
  {
    id: 'm1',
    lat: 37.7958, lon: -122.3937,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Moonrise_at_San_Francisco_%E2%80%93_Oakland_Bay_Bridge_%28Unsplash%29.jpg/1280px-Moonrise_at_San_Francisco_%E2%80%93_Oakland_Bay_Bridge_%28Unsplash%29.jpg',
    media_type: 'photo',
    caption: 'Moon rising over the Bay Bridge — worth every cold minute 🌕',
    location_name: 'Oakland Bay Bridge',
    created_at: new Date(Date.now() - 6 * 60000).toISOString(),
    sunset_score: 96,
  },
  {
    id: 'm2',
    lat: 37.8200, lon: -122.4783,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Super_moon_over_San_Francisco_Bay.jpg/1280px-Super_moon_over_San_Francisco_Bay.jpg',
    media_type: 'photo',
    caption: 'Supermoon so bright it felt like daylight on the water 🌕',
    location_name: 'San Francisco Bay',
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    sunset_score: 99,
  },
  {
    id: 'm3',
    lat: 44.1, lon: -124.1,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Full_moon_over_the_Oregon_coast_-_Flickr_-_Bonnie_Moreland_%28free_images%29.jpg/1280px-Full_moon_over_the_Oregon_coast_-_Flickr_-_Bonnie_Moreland_%28free_images%29.jpg',
    media_type: 'photo',
    caption: 'Full moon path straight to the horizon 🌊🌕',
    location_name: 'Oregon Coast',
    created_at: new Date(Date.now() - 29 * 60000).toISOString(),
    sunset_score: 93,
  },
  {
    id: 'm4',
    lat: 19.8207, lon: -155.4681,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Moonrise_over_Maunakea_%28iotw2419a%29.jpg/1280px-Moonrise_over_Maunakea_%28iotw2419a%29.jpg',
    media_type: 'photo',
    caption: 'Above the clouds, the moon belongs to no one 🏔🌕',
    location_name: 'Maunakea Summit',
    created_at: new Date(Date.now() - 41 * 60000).toISOString(),
    sunset_score: 98,
  },
  {
    id: 'm5',
    lat: 35.3606, lon: 138.7274,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Moon_and_Mt._Fuji_September_2012_%282%29.jpg/1280px-Moon_and_Mt._Fuji_September_2012_%282%29.jpg',
    media_type: 'photo',
    caption: 'Fuji + full moon. This one goes on the wall. 🗻🌕',
    location_name: 'Mt. Fuji',
    created_at: new Date(Date.now() - 55 * 60000).toISOString(),
    sunset_score: 97,
  },
  {
    id: 'm6',
    lat: 34.0522, lon: -118.2437,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Blood_Moon_%28124455907%29.jpeg/1280px-Blood_Moon_%28124455907%29.jpeg',
    media_type: 'photo',
    caption: 'Blood moon over the basin — set an alarm for this one 🩸🌕',
    location_name: 'Los Angeles',
    created_at: new Date(Date.now() - 68 * 60000).toISOString(),
    sunset_score: 100,
  },
  {
    id: 'm7',
    lat: 30.2, lon: -98.7,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Night_sky_with_moon_and_stars_over_cotton_field_in_Batesville%2C_Texas.jpg/1280px-Night_sky_with_moon_and_stars_over_cotton_field_in_Batesville%2C_Texas.jpg',
    media_type: 'photo',
    caption: 'Texas sky, no light pollution, just moon and stars ⭐',
    location_name: 'Texas Hill Country',
    created_at: new Date(Date.now() - 80 * 60000).toISOString(),
    sunset_score: 91,
  },
  {
    id: 'm8',
    lat: -27.4698, lon: 153.0251,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Full_Moon_rising_over_Brisbane_River-1_%2814633318102%29.jpg/1280px-Full_Moon_rising_over_Brisbane_River-1_%2814633318102%29.jpg',
    media_type: 'photo',
    caption: 'Brisbane River at full moon — everything glows 🌕',
    location_name: 'Brisbane River',
    created_at: new Date(Date.now() - 93 * 60000).toISOString(),
    sunset_score: 88,
  },
  {
    id: 'm9',
    lat: 58.3, lon: 12.1,
    media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Waxing_crescent_moon_setting_over_Tuntorp_1.jpg/1280px-Waxing_crescent_moon_setting_over_Tuntorp_1.jpg',
    media_type: 'photo',
    caption: "Crescent sliver in the dusk — blink and it's gone 🌙",
    location_name: 'Tuntorp, Sweden',
    created_at: new Date(Date.now() - 107 * 60000).toISOString(),
    sunset_score: 82,
  },
];

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useCommunityFeed(lat, lon, mode = 'sun') {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoPosts = [...(mode === 'moon' ? MOON_POSTS : SUN_POSTS)];

    // Sort by proximity if we have user location
    const sorted = (lat && lon)
      ? demoPosts.sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon))
      : demoPosts;

    // If Supabase isn't configured, use demo data
    if (!supabase) {
      setPosts(sorted);
      setLoading(false);
      return;
    }

    if (!lat || !lon) return;

    const today = new Date().toISOString().split('T')[0];

    // Fetch nearby posts for the current mode
    supabase
      .rpc('posts_nearby', { lat, lon, radius_km: 25, date: today })
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error || !data?.length) {
          setPosts(sorted);
        } else {
          setPosts(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setPosts(sorted);
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel('nearby-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `sunset_date=eq.${today}` },
        (payload) => {
          const dist = haversineKm(lat, lon, payload.new.lat, payload.new.lon);
          if (dist <= 25) setPosts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [lat, lon, mode]);

  return { posts, loading };
}
