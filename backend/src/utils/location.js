import { httpError } from './httpError.js';

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function isValidLatitude(value) {
  const latitude = toFiniteNumber(value);
  return latitude !== null && latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE;
}

export function isValidLongitude(value) {
  const longitude = toFiniteNumber(value);
  return longitude !== null && longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE;
}

export function normalizeLocation(input, fieldName = 'location') {
  if (!input || typeof input !== 'object') {
    throw httpError(400, `${fieldName} is required`);
  }

  const address = typeof input.address === 'string' ? input.address.trim() : '';
  const placeId = typeof input.placeId === 'string' ? input.placeId.trim() : '';
  const latitude = toFiniteNumber(input.latitude);
  const longitude = toFiniteNumber(input.longitude);

  if (!address) {
    throw httpError(400, `${fieldName}.address is required`);
  }

  if (!placeId) {
    throw httpError(400, `${fieldName}.placeId is required`);
  }

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    throw httpError(400, `${fieldName} must include valid latitude and longitude`);
  }

  return {
    address,
    placeId,
    latitude,
    longitude,
    coordinates: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  };
}

export function parseCoordinatePair(latitudeValue, longitudeValue, fieldName = 'location') {
  const latitude = toFiniteNumber(latitudeValue);
  const longitude = toFiniteNumber(longitudeValue);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    throw httpError(400, `${fieldName} must include valid latitude and longitude`);
  }

  return { latitude, longitude };
}

export function getSearchRadiusKm(value) {
  const fallback = Number(process.env.SEARCH_RADIUS_DEFAULT_KM || 10);
  const requested = Number(value);
  const radius = Number.isFinite(requested) && requested > 0 ? requested : fallback;

  return Math.min(radius, 100);
}

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const nLat1 = toFiniteNumber(lat1);
  const nLon1 = toFiniteNumber(lon1);
  const nLat2 = toFiniteNumber(lat2);
  const nLon2 = toFiniteNumber(lon2);

  if (nLat1 === null || nLon1 === null || nLat2 === null || nLon2 === null) {
    return 0;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

