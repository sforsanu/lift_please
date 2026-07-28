import { Ride } from '../models/index.js';

function legacyLocation(address, suffix) {
  const normalizedAddress = typeof address === 'string' ? address.trim() : '';

  if (!normalizedAddress) {
    return undefined;
  }

  return {
    address: normalizedAddress,
    placeId: `legacy:${suffix}:${normalizedAddress.toLowerCase()}`,
  };
}

export async function migrateLegacyRideLocations() {
  const legacyRides = await Ride.find({
    $or: [
      { pickupLocation: { $exists: false } },
      { destinationLocation: { $exists: false } },
      { 'pickupLocation.address': { $exists: false } },
      { 'destinationLocation.address': { $exists: false } },
    ],
  }).select('_id leavingFrom goingTo pickupLocation destinationLocation');

  if (legacyRides.length === 0) {
    return;
  }

  const writes = legacyRides.map((ride) => {
    const $set = {};

    if (!ride.pickupLocation?.address) {
      const pickupLocation = legacyLocation(ride.leavingFrom, 'pickup');
      if (pickupLocation) {
        $set.pickupLocation = pickupLocation;
      }
    }

    if (!ride.destinationLocation?.address) {
      const destinationLocation = legacyLocation(ride.goingTo, 'destination');
      if (destinationLocation) {
        $set.destinationLocation = destinationLocation;
      }
    }

    return Object.keys($set).length
      ? {
          updateOne: {
            filter: { _id: ride._id },
            update: { $set },
          },
        }
      : null;
  }).filter(Boolean);

  if (writes.length > 0) {
    await Ride.bulkWrite(writes, { ordered: false });
    console.log(`Backfilled ${writes.length} legacy ride location address records`);
  }
}
