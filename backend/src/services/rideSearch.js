import { Ride } from '../models/index.js';

const ACTIVE_STATUSES = ['ACTIVE', 'scheduled'];

function compactMatch(match) {
  return Object.fromEntries(Object.entries(match).filter(([, value]) => value !== undefined));
}

function baseMatch({ date, seatsAvailable }) {
  const minimumSeats = Number(seatsAvailable);

  return compactMatch({
    status: { $in: ACTIVE_STATUSES },
    date: typeof date === 'string' && date.trim() ? date.trim() : undefined,
    seatsAvailable: Number.isFinite(minimumSeats) && minimumSeats > 0 ? { $gte: minimumSeats } : { $gt: 0 },
  });
}

function rideProjection(extraFields = {}) {
  return {
    _id: 0,
    id: { $toString: '$_id' },
    driverName: 1,
    driverAvatar: 1,
    driverRating: 1,
    leavingFrom: 1,
    goingTo: 1,
    pickupLocation: 1,
    destinationLocation: 1,
    date: 1,
    time: 1,
    price: 1,
    seatsAvailable: 1,
    totalSeats: 1,
    carModel: 1,
    interests: 1,
    musicTaste: 1,
    carbonSaved: 1,
    verifiedDriver: 1,
    ...extraFields,
  };
}

export async function searchRides({
  pickup,
  destination,
  date,
  seatsAvailable,
  radiusKm,
}) {
  const match = baseMatch({ date, seatsAvailable });
  const maxDistance = radiusKm * 1000;

  if (pickup) {
    const pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [pickup.longitude, pickup.latitude],
          },
          key: 'pickupLocation.coordinates',
          distanceField: 'distanceMeters',
          maxDistance,
          spherical: true,
          query: match,
        },
      },
    ];

    if (destination) {
      pipeline.push({
        $match: {
          'destinationLocation.coordinates': {
            $geoWithin: {
              $centerSphere: [[destination.longitude, destination.latitude], radiusKm / 6378.1],
            },
          },
        },
      });
    }

    pipeline.push(
      { $sort: { distanceMeters: 1, date: 1, time: 1 } },
      { $limit: 100 },
      {
        $project: rideProjection({
          distanceInKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
        }),
      },
    );

    return Ride.aggregate(pipeline);
  }

  if (destination) {
    return Ride.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [destination.longitude, destination.latitude],
          },
          key: 'destinationLocation.coordinates',
          distanceField: 'distanceMeters',
          maxDistance,
          spherical: true,
          query: match,
        },
      },
      { $sort: { distanceMeters: 1, date: 1, time: 1 } },
      { $limit: 100 },
      {
        $project: rideProjection({
          distanceInKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
        }),
      },
    ]);
  }

  const rides = await Ride.find(match)
    .sort({ date: 1, time: 1, createdAt: -1 })
    .limit(100)
    .select('-__v')
    .lean();

  return rides.map((ride) => ({
    ...ride,
    id: ride._id.toString(),
    _id: undefined,
  }));
}
