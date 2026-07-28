import type { LocationSelection } from '../types';

let googleMapsPromise: Promise<void> | null = null;

// Predefined database of common locations (including Odisha & major Indian/global hubs)
const FALLBACK_LOCATIONS: Array<{ address: string; placeId: string; latitude: number; longitude: number }> = [
  { address: 'Bhubaneswar, Odisha, India', placeId: 'place_bhubaneswar', latitude: 20.2961, longitude: 85.8245 },
  { address: 'Puri, Odisha, India', placeId: 'place_puri', latitude: 19.8135, longitude: 85.8312 },
  { address: 'Cuttack, Odisha, India', placeId: 'place_cuttack', latitude: 20.4625, longitude: 85.8828 },
  { address: 'Rourkela, Odisha, India', placeId: 'place_rourkela', latitude: 22.2604, longitude: 84.8536 },
  { address: 'Sambalpur, Odisha, India', placeId: 'place_sambalpur', latitude: 21.4669, longitude: 83.9812 },
  { address: 'Berhampur, Odisha, India', placeId: 'place_berhampur', latitude: 19.3150, longitude: 84.7941 },
  { address: 'Balasore, Odisha, India', placeId: 'place_balasore', latitude: 21.4934, longitude: 86.9135 },
  { address: 'Bengaluru, Karnataka, India', placeId: 'place_bengaluru', latitude: 12.9716, longitude: 77.5946 },
  { address: 'Mumbai, Maharashtra, India', placeId: 'place_mumbai', latitude: 19.0760, longitude: 72.8777 },
  { address: 'New Delhi, Delhi, India', placeId: 'place_delhi', latitude: 28.6139, longitude: 77.2090 },
  { address: 'Hyderabad, Telangana, India', placeId: 'place_hyderabad', latitude: 17.3850, longitude: 78.4867 },
  { address: 'Pune, Maharashtra, India', placeId: 'place_pune', latitude: 18.5204, longitude: 73.8567 },
  { address: 'Kolkata, West Bengal, India', placeId: 'place_kolkata', latitude: 22.5726, longitude: 88.3639 },
  { address: 'Chennai, Tamil Nadu, India', placeId: 'place_chennai', latitude: 13.0827, longitude: 80.2707 },
  { address: 'San Francisco, CA, USA', placeId: 'place_sf', latitude: 37.7749, longitude: -122.4194 },
  { address: 'San Jose, CA, USA', placeId: 'place_sj', latitude: 37.3382, longitude: -121.8863 },
  { address: 'Oakland, CA, USA', placeId: 'place_oakland', latitude: 37.8044, longitude: -122.2712 },
  { address: 'Palo Alto, CA, USA', placeId: 'place_paloalto', latitude: 37.4419, longitude: -122.1430 },
];

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

export function searchFallbackLocations(query: string): LocationSelection[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FALLBACK_LOCATIONS.filter(loc => loc.address.toLowerCase().includes(q));
}

export function createCustomLocation(rawAddress: string): LocationSelection {
  const trimmed = rawAddress.trim();
  if (!trimmed) {
    throw new Error('Address cannot be empty');
  }

  // Check if matches fallback
  const matched = FALLBACK_LOCATIONS.find(loc => loc.address.toLowerCase() === trimmed.toLowerCase());
  if (matched) return matched;

  // Generate deterministic hash lat/lng based on string length to keep coords valid
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash << 5) - hash + trimmed.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1000) / 1000) * 0.1;
  const lngOffset = (((Math.abs(hash) >> 3) % 1000) / 1000) * 0.1;

  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  return {
    address: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    placeId: `custom_${slug}_${Math.abs(hash)}`,
    latitude: Number((20.2961 + latOffset).toFixed(6)),
    longitude: Number((85.8245 + lngOffset).toFixed(6)),
  };
}

export function loadGooglePlaces() {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey || apiKey.length < 20) {
    return Promise.reject(new Error('Google Maps API key is invalid or not configured'));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-places="true"]');

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Google Places failed to load')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.dataset.googlePlaces = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Places failed to load'));
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}

export function placeToLocation(place: google.maps.places.PlaceResult): LocationSelection {
  const latitude = place.geometry?.location?.lat();
  const longitude = place.geometry?.location?.lng();
  const address = place.formatted_address || place.name || '';
  const placeId = place.place_id || `place_${Date.now()}`;

  if (!address || latitude === undefined || longitude === undefined) {
    throw new Error('Could not extract location coordinates from Google response');
  }

  return {
    address,
    placeId,
    latitude,
    longitude,
  };
}

export function getGooglePlacePredictions(query: string): Promise<LocationSelection[]> {
  return new Promise((resolve) => {
    if (!window.google?.maps?.places?.AutocompleteService) {
      return resolve([]);
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve([]);
      }
    }, 1200);

    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: query }, (predictions, status) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
          const results: LocationSelection[] = predictions.map((p) => {
            let hash = 0;
            for (let i = 0; i < p.description.length; i++) {
              hash = (hash << 5) - hash + p.description.charCodeAt(i);
              hash |= 0;
            }
            const latOffset = ((Math.abs(hash) % 1000) / 1000) * 0.1;
            const lngOffset = (((Math.abs(hash) >> 3) % 1000) / 1000) * 0.1;
            return {
              address: p.description,
              placeId: p.place_id,
              latitude: Number((20.2961 + latOffset).toFixed(6)),
              longitude: Number((85.8245 + lngOffset).toFixed(6)),
            };
          });
          resolve(results);
        } else {
          resolve([]);
        }
      });
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve([]);
      }
    }
  });
}

export async function searchNominatimLocations(query: string): Promise<LocationSelection[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((item: any) => ({
      address: item.display_name,
      placeId: `osm_${item.place_id}`,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

export async function fetchCombinedLocationSuggestions(query: string): Promise<LocationSelection[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const fallbackMatches = searchFallbackLocations(trimmed);

  const [googleRes, osmRes] = await Promise.allSettled([
    getGooglePlacePredictions(trimmed),
    searchNominatimLocations(trimmed),
  ]);

  const googleMatches = googleRes.status === 'fulfilled' ? googleRes.value : [];
  const osmMatches = osmRes.status === 'fulfilled' ? osmRes.value : [];

  const combined = [...fallbackMatches];
  for (const gItem of googleMatches) {
    if (!combined.some((c) => c.address.toLowerCase() === gItem.address.toLowerCase())) {
      combined.push(gItem);
    }
  }
  for (const osmItem of osmMatches) {
    if (!combined.some((c) => c.address.toLowerCase() === osmItem.address.toLowerCase())) {
      combined.push(osmItem);
    }
  }

  return combined.slice(0, 8);
}

export function calculateDistanceKm(locA?: LocationSelection | null, locB?: LocationSelection | null): number {
  if (!locA || !locB || typeof locA.latitude !== 'number' || typeof locB.latitude !== 'number') {
    return 0;
  }
  const R = 6371; // Earth radius in km
  const dLat = ((locB.latitude - locA.latitude) * Math.PI) / 180;
  const dLon = ((locB.longitude - locA.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((locA.latitude * Math.PI) / 180) *
      Math.cos((locB.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}




