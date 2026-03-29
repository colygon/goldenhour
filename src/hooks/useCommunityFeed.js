import { useState, useEffect } from 'react';
import { supabase, haversineKm } from '../lib/supabase';

// Demo posts for when Supabase isn't configured
const DEMO_POSTS = [
  {
    id: '1',
    media_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&q=80',
    media_type: 'photo',
    caption: 'Incredible colors tonight',
    location_name: 'Ocean Beach',
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    sunset_score: 92,
  },
  {
    id: '2',
    media_url: 'https://images.unsplash.com/photo-1506815444479-bfdb1e96c566?w=600&q=80',
    media_type: 'photo',
    caption: 'Golden hour magic',
    location_name: 'Baker Beach',
    created_at: new Date(Date.now() - 11 * 60000).toISOString(),
    sunset_score: 88,
  },
  {
    id: '3',
    media_url: 'https://images.unsplash.com/photo-1532978379173-523e16f371f2?w=600&q=80',
    media_type: 'photo',
    caption: 'The sky is on fire',
    location_name: 'Twin Peaks',
    created_at: new Date(Date.now() - 22 * 60000).toISOString(),
    sunset_score: 95,
  },
  {
    id: '4',
    media_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=600&q=80',
    media_type: 'photo',
    caption: 'Worth the drive',
    location_name: 'Marin Headlands',
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    sunset_score: 81,
  },
  {
    id: '5',
    media_url: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=600&q=80',
    media_type: 'photo',
    caption: 'Purple skies',
    location_name: 'Lands End Trail',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    sunset_score: 79,
  },
  {
    id: '6',
    media_url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&q=80',
    media_type: 'photo',
    caption: 'Absolutely unreal',
    location_name: 'Crissy Field',
    created_at: new Date(Date.now() - 52 * 60000).toISOString(),
    sunset_score: 90,
  },
];

export function useCommunityFeed(lat, lon) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase isn't configured, use demo data
    if (!supabase) {
      setPosts(DEMO_POSTS);
      setLoading(false);
      return;
    }

    if (!lat || !lon) return;

    const today = new Date().toISOString().split('T')[0];

    // Fetch nearby posts
    supabase
      .rpc('posts_nearby', { lat, lon, radius_km: 25, date: today })
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      })
      .catch(() => {
        setPosts(DEMO_POSTS);
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel('nearby-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `sunset_date=eq.${today}`,
        },
        (payload) => {
          const dist = haversineKm(lat, lon, payload.new.lat, payload.new.lon);
          if (dist <= 25) {
            setPosts((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [lat, lon]);

  return { posts, loading };
}
