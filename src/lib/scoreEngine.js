export function computeSunsetScore(wx) {
  let score = 50;

  // High clouds (cirrus) = color amplifier
  if (wx.cloudCoverHigh > 20 && wx.cloudCoverHigh < 60) {
    score += 25;
  } else if (wx.cloudCoverHigh >= 60 && wx.cloudCoverHigh < 85) {
    score += 10;
  }

  // Low clouds = color blocker
  if (wx.cloudCoverLow > 70) score -= 30;
  else if (wx.cloudCoverLow > 40) score -= 15;
  else if (wx.cloudCoverLow > 20) score -= 5;

  // Total cloud cover
  if (wx.cloudCover > 95) score -= 20;
  if (wx.cloudCover < 5) score -= 10;
  if (wx.cloudCover > 5 && wx.cloudCover < 40) score += 5;

  // Humidity
  if (wx.humidity < 40) score += 10;
  if (wx.humidity > 80) score -= 10;

  // Air quality / particulates
  if (wx.pm25 > 12 && wx.pm25 < 55) score += 15;
  if (wx.pm25 >= 55 && wx.pm25 < 150) score += 8;
  if (wx.pm25 >= 150) score -= 10;

  // Fog / visibility
  if (wx.fogProbability > 0.6) score -= 25;
  if (wx.visibility < 5) score -= 20;
  else if (wx.visibility < 10) score -= 8;

  // Rain
  if (wx.precipProbability > 70) score -= 20;
  else if (wx.precipProbability > 30) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreToTier(score) {
  if (score >= 85) return { label: 'EPIC', emoji: '🔥', color: '#FF4500' };
  if (score >= 70) return { label: 'GREAT', emoji: '✨', color: '#FF8C00' };
  if (score >= 50) return { label: 'DECENT', emoji: '🌤', color: '#FFB347' };
  if (score >= 30) return { label: 'MEH', emoji: '😐', color: '#A9A9A9' };
  return { label: 'SKIP IT', emoji: '🌫', color: '#708090' };
}

export function generateSkyLine(wx, tier) {
  if (tier.label === 'EPIC')
    return 'Low humidity, scattered high cirrus — expect deep reds and purples tonight.';
  if (tier.label === 'GREAT')
    return 'Thin cloud wisps at altitude with warm air — a solid golden display.';
  if (tier.label === 'DECENT')
    return 'Patchy mid-level clouds — some color, but not wall-to-wall.';
  if (tier.label === 'MEH')
    return 'Mostly overcast with thick low clouds — limited color payoff.';
  return 'Dense cloud cover or fog. Nothing to see. Stay cozy.';
}
