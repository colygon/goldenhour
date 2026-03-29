const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function buildQuery(lat, lon) {
  return `[out:json][timeout:10];
(
  node["natural"="peak"](around:15000,${lat},${lon});
  node["tourism"="viewpoint"](around:15000,${lat},${lon});
  node["natural"="beach"](around:15000,${lat},${lon});
  node["man_made"="pier"](around:15000,${lat},${lon});
  way["leisure"="park"](around:8000,${lat},${lon});
);
out body center 10;`;
}

function haversineKm(lat1, lon1, lat2, lon2) {
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

function milesToKm(mi) {
  return mi * 1.60934;
}

const TYPE_PRIORITY = {
  beach: 5,
  peak: 4,
  viewpoint: 3,
  pier: 2,
  park: 1,
};

function getType(element) {
  if (element.tags?.natural === 'beach') return 'beach';
  if (element.tags?.natural === 'peak') return 'peak';
  if (element.tags?.tourism === 'viewpoint') return 'viewpoint';
  if (element.tags?.man_made === 'pier') return 'pier';
  if (element.tags?.leisure === 'park') return 'park';
  return 'park';
}

function getFeature(type) {
  const features = {
    beach: 'Unobstructed horizon',
    peak: 'Elevated panoramic view',
    viewpoint: 'Designated viewpoint',
    pier: 'Open water vista',
    park: 'Open sky access',
  };
  return features[type] || 'Open sky access';
}

function scoreSpot(element, userLat, userLon) {
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;
  if (!lat || !lon) return -1;

  const type = getType(element);
  const dist = haversineKm(userLat, userLon, lat, lon);

  // West-facing bonus: spots to the west of the user
  const lonDiff = lon - userLon;
  const westBonus = lonDiff < 0 ? Math.min(Math.abs(lonDiff) * 10, 5) : 0;

  // Type priority
  const typePriority = TYPE_PRIORITY[type] || 1;

  // Distance penalty (closer is better)
  const distPenalty = Math.min(dist / 15, 1) * 5;

  return typePriority * 2 + westBonus - distPenalty;
}

export async function findBestSpots(lat, lon, limit = 3) {
  try {
    const query = buildQuery(lat, lon);
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = await res.json();
    if (!data.elements?.length) {
      return [
        {
          name: 'Any west-facing spot',
          feature: 'Find open sky with clear western horizon',
          distance: null,
          type: 'general',
        },
      ];
    }

    const scored = data.elements
      .map((el) => {
        const spotLat = el.lat || el.center?.lat;
        const spotLon = el.lon || el.center?.lon;
        const type = getType(el);
        const dist = spotLat && spotLon ? haversineKm(lat, lon, spotLat, spotLon) : null;
        const distMi = dist !== null ? (dist / 1.60934).toFixed(1) : null;

        return {
          name: el.tags?.name || `Unnamed ${type}`,
          feature: getFeature(type),
          distance: distMi ? `${distMi} mi` : null,
          type,
          score: scoreSpot(el, lat, lon),
          lat: spotLat,
          lon: spotLon,
        };
      })
      .filter((s) => s.score > 0 && s.name !== `Unnamed park`)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (scored.length === 0) {
      return [
        {
          name: 'Any west-facing spot',
          feature: 'Find open sky with clear western horizon',
          distance: null,
          type: 'general',
        },
      ];
    }

    return scored;
  } catch (err) {
    console.error('Spot finder error:', err);
    return [
      {
        name: 'Any west-facing spot',
        feature: 'Find open sky with clear western horizon',
        distance: null,
        type: 'general',
      },
    ];
  }
}
