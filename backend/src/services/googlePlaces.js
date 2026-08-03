import { httpError } from '../utils/httpError.js';

const GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

function coordinatesAreClose(expected, actual) {
  const latitudeDelta = Math.abs(expected.latitude - actual.latitude);
  const longitudeDelta = Math.abs(expected.longitude - actual.longitude);

  return latitudeDelta <= 0.01 && longitudeDelta <= 0.01;
}

export async function verifyGooglePlaceLocation(location, fieldName) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (
    !apiKey ||
    !location.placeId ||
    location.placeId.startsWith('custom_') ||
    location.placeId.startsWith('place_') ||
    location.placeId.startsWith('osm_') ||
    location.placeId.startsWith('photon_') ||
    location.placeId.startsWith('poi_') ||
    location.placeId.startsWith('gps_') ||
    location.placeId.startsWith('legacy:') ||
    !location.placeId.startsWith('ChIJ')
  ) {
    return;
  }

  const params = new URLSearchParams({
    place_id: location.placeId,
    fields: 'place_id,formatted_address,geometry',
    key: apiKey,
  });

  let response;
  try {
    response = await fetch(`${GOOGLE_PLACE_DETAILS_URL}?${params.toString()}`);
  } catch {
    throw httpError(502, `Unable to verify ${fieldName} with Google Places`);
  }

  if (!response.ok) {
    throw httpError(502, `Google Places verification failed for ${fieldName}`);
  }

  const body = await response.json().catch(() => null);

  if (body?.status !== 'OK' || !body.result?.place_id || !body.result?.geometry?.location) {
    throw httpError(400, `${fieldName}.placeId is invalid`);
  }

  const googleLocation = {
    latitude: Number(body.result.geometry.location.lat),
    longitude: Number(body.result.geometry.location.lng),
  };

  if (!coordinatesAreClose(location, googleLocation)) {
    throw httpError(400, `${fieldName} coordinates do not match the selected Google place`);
  }
}
