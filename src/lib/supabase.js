import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export function haversineKm(lat1, lon1, lat2, lon2) {
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

// Anonymous user management
export async function getOrCreateUser() {
  let userId = localStorage.getItem('gh_user_id');

  if (userId) return userId;

  if (!supabase) {
    // Generate a local-only ID when Supabase is not configured
    userId = crypto.randomUUID();
    localStorage.setItem('gh_user_id', userId);
    return userId;
  }

  try {
    const { data } = await supabase
      .from('users')
      .insert({ avatar_seed: Math.random().toString(36).slice(2) })
      .select()
      .single();

    userId = data.id;
    localStorage.setItem('gh_user_id', userId);
    return userId;
  } catch {
    userId = crypto.randomUUID();
    localStorage.setItem('gh_user_id', userId);
    return userId;
  }
}
