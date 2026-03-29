import { useState } from 'react';
import { uploadMedia } from '../lib/cloudinary';
import { supabase, getOrCreateUser } from '../lib/supabase';

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = async ({ file, caption, lat, lon, locationName, sunsetScore }) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      const userId = await getOrCreateUser();

      // Upload to Cloudinary
      const result = await uploadMedia(file, setProgress);

      const post = {
        user_id: userId,
        media_url: result.secure_url,
        media_type: file.type.startsWith('video/') ? 'video' : 'photo',
        thumbnail_url: result.eager?.[0]?.secure_url || result.secure_url,
        duration_sec: result.duration ? Math.round(result.duration) : null,
        caption: caption?.slice(0, 120) || null,
        lat,
        lon,
        location_name: locationName,
        sunset_score: sunsetScore,
        sunset_date: new Date().toISOString().split('T')[0],
      };

      // Insert into Supabase if configured
      if (supabase) {
        const { error: dbError } = await supabase.from('posts').insert(post);
        if (dbError) throw dbError;
      }

      setUploading(false);
      setProgress(100);
      return post;
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  return { upload, uploading, progress, error };
}
