export interface DetectedLocation {
  city: string;
  region?: string;
  country?: string;
  formatted: string;
  coords?: { lat: number; lng: number };
}

/**
 * Proactively detects the visitor's approximate city / region using IP or timezone
 */
export async function detectVisitorApproximateLocation(): Promise<DetectedLocation | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.cityName) {
        const parts = [data.cityName, data.regionName, data.countryName].filter(Boolean);
        return {
          city: data.cityName,
          region: data.regionName,
          country: data.countryName,
          formatted: parts.join(', '),
          coords: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : undefined,
        };
      }
    }
  } catch {
    // Graceful fallback to timezone
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const cityPart = tz.split('/').pop()?.replace(/_/g, ' ');
      if (cityPart) {
        return {
          city: cityPart,
          formatted: `${cityPart} Region`,
        };
      }
    }
  } catch {
    // No-op
  }

  return null;
}

/**
 * Reverse-geocodes exact GPS coordinates to human-readable city, state, country
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county;
        const state = addr.state || addr.province || addr.region;
        const country = addr.country;
        const parts = [city, state, country].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    }
  } catch {
    // Fallback to coordinates
  }

  return 'Real-Time Location Verified';
}
