import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { Message, Ride, RideRequest } from '../models/index.js';
import { Notification } from '../models/Notification.js';
import { verifyGooglePlaceLocation } from '../services/googlePlaces.js';
import { searchRides } from '../services/rideSearch.js';
import { httpError } from '../utils/httpError.js';
import { calculateHaversineDistance, getSearchRadiusKm, normalizeLocation, parseCoordinatePair } from '../utils/location.js';

const router = Router();

function serializeRide(ride) {
  return ride.toJSON ? ride.toJSON() : ride;
}

router.get('/', async (req, res, next) => {
  try {
    const {
      pickupLatitude,
      pickupLongitude,
      destinationLatitude,
      destinationLongitude,
      date,
      seatsAvailable,
      radiusKm,
    } = req.query;

    const pickup = pickupLatitude !== undefined || pickupLongitude !== undefined
      ? parseCoordinatePair(pickupLatitude, pickupLongitude, 'pickup')
      : null;
    const destination = destinationLatitude !== undefined || destinationLongitude !== undefined
      ? parseCoordinatePair(destinationLatitude, destinationLongitude, 'destination')
      : null;

    const rides = await searchRides({
      pickup,
      destination,
      date,
      seatsAvailable,
      radiusKm: getSearchRadiusKm(radiusKm),
    });

    res.json(rides.map(serializeRide));
  } catch (error) {
    next(error);
  }
});

router.get('/user-requests', authenticate, async (req, res, next) => {
  try {
    const requests = await RideRequest.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }],
    });
    return res.json(
      requests.map((r) => ({
        id: r._id.toString(),
        rideId: r.ride.toString(),
        status: r.status,
        createdAt: r.createdAt,
      })),
    );
  } catch (error) {
    return next(error);
  }
});

router.get('/user-conversations', authenticate, async (req, res, next) => {
  try {
    const requests = await RideRequest.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }],
    }).populate('ride');

    const userRides = await Ride.find({ driver: req.user._id });
    const map = new Map();

    userRides.forEach((r) => {
      map.set(r._id.toString(), serializeRide(r));
    });

    requests.forEach((reqItem) => {
      if (reqItem.ride) {
        map.set(reqItem.ride._id.toString(), serializeRide(reqItem.ride));
      }
    });

    return res.json(Array.from(map.values()));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    return res.json(ride);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      pickupLocation,
      destinationLocation,
      date,
      time,
      price,
      seatsAvailable,
      totalSeats,
      carModel,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      vehicleColor,
      interests,
      musicTaste,
    } = req.body;

    if (!date || !time) {
      throw httpError(400, 'pickupLocation, destinationLocation, date, and time are required');
    }

    const normalizedPickupLocation = normalizeLocation(pickupLocation, 'pickupLocation');
    const normalizedDestinationLocation = normalizeLocation(destinationLocation, 'destinationLocation');
    await Promise.all([
      verifyGooglePlaceLocation(normalizedPickupLocation, 'pickupLocation'),
      verifyGooglePlaceLocation(normalizedDestinationLocation, 'destinationLocation'),
    ]);

    const seats = Number(seatsAvailable) || 3;
    const calculatedCarbon = Math.floor(Math.random() * 15) + 8;
    const routeDistanceKm = calculateHaversineDistance(
      normalizedPickupLocation.latitude,
      normalizedPickupLocation.longitude,
      normalizedDestinationLocation.latitude,
      normalizedDestinationLocation.longitude,
    );

    const newRide = await Ride.create({
      driver: req.user._id,
      driverName: req.user.name || req.user.email,
      driverAvatar: req.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      driverRating: req.user.profile?.rating || 5,
      verifiedDriver: Boolean(req.user.profile?.verifiedDriver),
      leavingFrom: normalizedPickupLocation.address,
      goingTo: normalizedDestinationLocation.address,
      pickupLocation: normalizedPickupLocation,
      destinationLocation: normalizedDestinationLocation,
      date,
      time,
      price: Number(price) || 0,
      seatsAvailable: seats,
      totalSeats: Number(totalSeats) || seats + 1,
      carModel: vehicleModel || carModel || 'Tesla Model Y (EV)',
      vehicleType: vehicleType || 'car',
      vehicleModel: vehicleModel || carModel || 'Tesla Model Y (EV)',
      vehicleNumber,
      vehicleColor,
      interests: Array.isArray(interests) ? interests : ['Commuting'],
      musicTaste: Array.isArray(musicTaste) ? musicTaste : ['Pop'],
      carbonSaved: calculatedCarbon,
      routeDistanceKm,
    });

    return res.status(201).json(newRide);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/request-status', authenticate, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      throw httpError(404, 'Ride not found');
    }

    const isDriver = ride.driver.equals(req.user._id);

    if (isDriver) {
      const requests = await RideRequest.find({ ride: ride._id })
        .populate('requester', 'name email avatarUrl')
        .sort({ createdAt: -1 });

      return res.json({
        isDriver: true,
        requests: requests.map((r) => ({
          id: r._id.toString(),
          requesterId: r.requester?._id?.toString(),
          requesterName: r.requester?.name || r.requester?.email || 'Co-traveler',
          requesterAvatar: r.requester?.avatarUrl,
          status: r.status,
          createdAt: r.createdAt,
        })),
      });
    }

    const request = await RideRequest.findOne({ ride: ride._id, requester: req.user._id });
    return res.json({
      isDriver: false,
      request: request
        ? {
            id: request._id.toString(),
            status: request.status,
            createdAt: request.createdAt,
          }
        : null,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/request', authenticate, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      throw httpError(404, 'Ride not found');
    }

    if (ride.driver.equals(req.user._id)) {
      throw httpError(400, 'Driver cannot send a request to their own ride');
    }

    let request = await RideRequest.findOne({ ride: ride._id, requester: req.user._id });
    if (!request) {
      request = await RideRequest.create({
        ride: ride._id,
        requester: req.user._id,
        owner: ride.driver,
        status: 'PENDING',
      });
    }

    return res.status(201).json({
      id: request._id.toString(),
      status: request.status,
      createdAt: request.createdAt,
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/requests/:requestId/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      throw httpError(400, 'Invalid status update. Allowed values: ACCEPTED, REJECTED');
    }

    const request = await RideRequest.findById(req.params.requestId);
    if (!request) {
      throw httpError(404, 'Request not found');
    }

    if (!request.owner.equals(req.user._id)) {
      throw httpError(403, 'Only the ride driver can respond to chat requests');
    }

    request.status = status;
    await request.save();

    await Notification.create({
      user: request.requester,
      type: status === 'ACCEPTED' ? 'RIDE_ACCEPTED' : 'RIDE_REJECTED',
      title: status === 'ACCEPTED' ? '⚡ Request Accepted!' : '❌ Request Declined',
      message: status === 'ACCEPTED'
        ? `Your task/ride request was accepted by the rider! Direct messaging active.`
        : `Your task/ride request was declined by the rider.`,
      ride: request.ride,
      request: request._id,
    });

    return res.json({
      id: request._id.toString(),
      status: request.status,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      throw httpError(404, 'Ride not found');
    }

    const isDriver = ride.driver.equals(req.user._id);

    if (!isDriver) {
      const existingRequest = await RideRequest.findOne({
        ride: ride._id,
        requester: req.user._id,
      });

      if (!existingRequest) {
        return res.json([]);
      }
    }

    const messages = await Message.find({ ride: ride._id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(200);

    res.json(
      messages.map((message) => ({
        id: message._id.toString(),
        rideId: ride._id.toString(),
        sender: message.sender?._id?.equals(ride.driver) ? 'driver' : 'user',
        text: message.text,
        timestamp: message.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { text } = req.body;
    const rideId = req.params.id;

    if (!text?.trim()) {
      throw httpError(400, 'text is required');
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const isDriver = ride.driver.equals(req.user._id);

    if (!isDriver) {
      const acceptedRequest = await RideRequest.findOne({
        ride: ride._id,
        requester: req.user._id,
        status: 'ACCEPTED',
      });

      if (!acceptedRequest) {
        throw httpError(403, 'Your chat request must be accepted by the driver before sending messages.');
      }
    }

    const recipient = isDriver ? undefined : ride.driver;
    const userMessage = await Message.create({
      ride: ride._id,
      sender: req.user._id,
      recipient,
      text: text.trim(),
    });

    return res.status(201).json({
      id: userMessage._id.toString(),
      rideId: ride._id.toString(),
      sender: isDriver ? 'driver' : 'user',
      text: userMessage.text,
      timestamp: userMessage.createdAt.toISOString(),
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/rides/:id/live-location - Fetch real-time rider location and trip status
router.get('/:id/live-location', authenticate, async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      throw httpError(404, 'Ride not found');
    }

    const isDriver = ride.driver.equals(req.user._id);

    return res.json({
      rideId: ride._id.toString(),
      isDriver,
      status: ride.status || 'ACTIVE',
      currentLocation: ride.currentLocation || {
        latitude: ride.pickupLocation?.latitude || 20.2961,
        longitude: ride.pickupLocation?.longitude || 85.8245,
        updatedAt: ride.updatedAt,
      },
      pickupLocation: ride.pickupLocation,
      destinationLocation: ride.destinationLocation,
      leavingFrom: ride.leavingFrom,
      goingTo: ride.goingTo,
      driverName: ride.driverName,
      driverAvatar: ride.driverAvatar,
      carModel: ride.carModel,
      vehicleType: ride.vehicleType,
      pickupPin: ride.pickupPin || '4819',
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/rides/:id/verify-pickup-pin - Verify 4-digit PIN when rider meets client
router.post('/:id/verify-pickup-pin', authenticate, async (req, res, next) => {
  try {
    const { pin } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      throw httpError(404, 'Ride not found');
    }

    if (!ride.driver.equals(req.user._id)) {
      throw httpError(403, 'Only the assigned rider/driver can verify pickup PIN');
    }

    const expectedPin = ride.pickupPin || '4819';
    if (!pin || pin.toString().trim() !== expectedPin.toString().trim()) {
      return res.status(400).json({ message: 'Incorrect Pickup PIN. Please check the 4-digit PIN on client screen.' });
    }

    ride.status = 'client_picked_up';
    await ride.save();

    // Notify client
    const requests = await RideRequest.find({ ride: ride._id });
    for (const reqItem of requests) {
      await Notification.create({
        user: reqItem.requester,
        type: 'RIDE_REQUEST',
        title: '🔑 Pickup PIN Verified!',
        message: `Your rider ${ride.driverName} has verified your Pickup PIN! Live GPS tracking is active.`,
        ride: ride._id,
        request: reqItem._id,
      });
    }

    return res.json({
      success: true,
      status: ride.status,
      message: 'Pickup PIN verified! Client picked up & in transit.',
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/rides/:id/live-location - Update live rider GPS position & trip status
router.patch('/:id/live-location', authenticate, async (req, res, next) => {
  try {
    const { latitude, longitude, status } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      throw httpError(404, 'Ride not found');
    }

    if (!ride.driver.equals(req.user._id)) {
      throw httpError(403, 'Only the assigned rider/driver can update live location');
    }

    if (latitude !== undefined && longitude !== undefined) {
      ride.currentLocation = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        updatedAt: new Date(),
      };
    }

    if (status && ['ACTIVE', 'started', 'client_picked_up', 'completed', 'COMPLETED', 'CANCELLED'].includes(status)) {
      const prevStatus = ride.status;
      ride.status = status;

      // Find requests for this ride to notify clients
      const requests = await RideRequest.find({ ride: ride._id });

      for (const reqItem of requests) {
        if (status === 'client_picked_up' && prevStatus !== 'client_picked_up') {
          await Notification.create({
            user: reqItem.requester,
            type: 'RIDE_REQUEST',
            title: '🚕 Client Picked Up!',
            message: `Your rider ${ride.driverName} has picked you up! Live GPS tracking is active for ${ride.goingTo}.`,
            ride: ride._id,
            request: reqItem._id,
          });
        } else if ((status === 'completed' || status === 'COMPLETED') && prevStatus !== 'completed' && prevStatus !== 'COMPLETED') {
          await Notification.create({
            user: reqItem.requester,
            type: 'RIDE_COMPLETED',
            title: '🏁 Trip Completed!',
            message: `You have arrived safely at ${ride.goingTo}. Thank you for riding with Lift!`,
            ride: ride._id,
            request: reqItem._id,
          });
        }
      }
    }

    await ride.save();

    return res.json({
      success: true,
      rideId: ride._id.toString(),
      status: ride.status,
      currentLocation: ride.currentLocation,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
