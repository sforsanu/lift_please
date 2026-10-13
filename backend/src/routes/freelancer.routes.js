import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.middleware.js';
import { Message, Ride, RideRequest, User } from '../models/index.js';
import { Notification } from '../models/Notification.js';

const router = Router();

// In-memory seed storage for freelance riders
let freelanceRiders = [
  {
    id: 'free_201',
    userId: 'user_rider_01',
    name: 'Rajesh Kumar Swain',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    phone: '9876543211',
    city: 'Bhubaneswar',
    serviceZone: 'Patia, Infocity, Chandrasekharpur, KIIT',
    vehicleType: 'EV Scooter',
    vehicleModel: 'Ather 450X EV',
    vehicleNumber: 'OD 02 BR 8899',
    baseRatePerTrip: 120,
    perKmRate: 12,
    isNegotiable: true,
    isAvailableToday: true,
    availableDate: 'Today',
    timeSlotFrom: '08:00 AM',
    timeSlotTo: '08:00 PM',
    rating: 4.9,
    totalCompletedJobs: 42,
    bio: 'Full-time EV Rider free today for instant package delivery, document drops, and local rides.',
    verifiedDriver: true,
  },
  {
    id: 'free_202',
    userId: 'user_rider_02',
    name: 'Debasis Patnaik',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '9776655443',
    city: 'Puri',
    serviceZone: 'Puri Town, Brahmagiri, Satapada, Swargadwar',
    vehicleType: 'Motorbike',
    vehicleModel: 'TVS Apache 160',
    vehicleNumber: 'OD 13 E 4512',
    baseRatePerTrip: 150,
    perKmRate: 14,
    isNegotiable: false,
    isAvailableToday: true,
    availableDate: 'Today',
    timeSlotFrom: '09:00 AM',
    timeSlotTo: '07:00 PM',
    rating: 4.8,
    totalCompletedJobs: 28,
    bio: 'Local Brahmagiri/Puri freelance rider available for urgent parcel delivery and local drop-offs.',
    verifiedDriver: true,
  },
  {
    id: 'free_203',
    userId: 'user_rider_03',
    name: 'Subhashree Nayak',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    phone: '9437123456',
    city: 'Cuttack',
    serviceZone: 'Badambadi, CNBT, Chauliaganj, Link Road',
    vehicleType: 'Car',
    vehicleModel: 'Tata Tiago EV',
    vehicleNumber: 'OD 05 AE 1020',
    baseRatePerTrip: 250,
    perKmRate: 18,
    isNegotiable: true,
    isAvailableToday: true,
    availableDate: 'Today',
    timeSlotFrom: '10:00 AM',
    timeSlotTo: '09:00 PM',
    rating: 5.0,
    totalCompletedJobs: 65,
    bio: 'Spacious EV car freelance rider available for heavy luggage, parcel moves, and intercity trips.',
    verifiedDriver: true,
  },
];

let taskRequests = [];

function getDeduplicatedRiders() {
  const seen = new Set();
  return freelanceRiders.filter((item) => {
    const key = (item.name || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function findOrCreateFreelancerUser(freelancer) {
  let user = null;
  if (freelancer.userId && mongoose.Types.ObjectId.isValid(freelancer.userId)) {
    user = await User.findById(freelancer.userId);
  }
  if (!user && freelancer.name) {
    user = await User.findOne({ name: new RegExp('^' + freelancer.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
  }
  if (!user) {
    const slug = (freelancer.name || 'freelancer').toLowerCase().replace(/[^a-z0-9]/g, '');
    user = await User.create({
      name: freelancer.name,
      email: `${slug}@lift.example`,
      avatarUrl: freelancer.avatarUrl,
      profile: {
        phone: freelancer.phone,
        city: freelancer.city,
        verifiedDriver: Boolean(freelancer.verifiedDriver),
        vehicleNumber: freelancer.vehicleNumber,
        vehicleModel: freelancer.vehicleModel,
        rating: freelancer.rating || 5.0,
      },
      authProvider: 'local',
    });
  }
  return user;
}

router.get('/', (req, res) => {
  const includeOffline = req.query.includeOffline === 'true';
  const riders = getDeduplicatedRiders();
  if (includeOffline) {
    res.json(riders);
  } else {
    // Only return active available riders in public directory
    res.json(riders.filter((r) => r.isAvailableToday));
  }
});

router.get('/my-tasks', authenticate, async (req, res, next) => {
  try {
    const requests = await RideRequest.find({ owner: req.user._id })
      .populate('ride')
      .populate('requester', 'name email avatarUrl profile')
      .sort({ createdAt: -1 });

    return res.json(
      requests.map((r) => ({
        id: r._id.toString(),
        rideId: r.ride?._id?.toString(),
        ride: r.ride ? (r.ride.toJSON ? r.ride.toJSON() : r.ride) : null,
        requesterId: r.requester?._id?.toString(),
        requesterName: r.requester?.name || r.requester?.email || 'Client',
        requesterAvatar: r.requester?.avatarUrl,
        status: r.status,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    return next(err);
  }
});

router.post('/toggle-availability', authenticate, (req, res) => {
  const userId = String(req.user._id || req.user.id || 'user_current');
  const userName = req.user.name || 'Freelance Rider';

  // Find existing profile by userId OR name to PREVENT duplicates
  let rider = freelanceRiders.find(
    (r) => String(r.userId) === userId || r.name.toLowerCase() === userName.toLowerCase()
  );

  const { isAvailableToday, serviceZone, vehicleType, baseRatePerTrip, perKmRate, isNegotiable, availableDate, timeSlotFrom, timeSlotTo, bio } = req.body;

  if (rider) {
    rider.userId = userId;
    rider.name = req.user.name || rider.name;
    rider.avatarUrl = req.user.avatarUrl || rider.avatarUrl;
    rider.isAvailableToday = isAvailableToday !== undefined ? Boolean(isAvailableToday) : !rider.isAvailableToday;
    if (serviceZone) rider.serviceZone = serviceZone;
    if (vehicleType) rider.vehicleType = vehicleType;
    if (baseRatePerTrip) rider.baseRatePerTrip = Number(baseRatePerTrip);
    if (perKmRate) rider.perKmRate = Number(perKmRate);
    if (isNegotiable !== undefined) rider.isNegotiable = Boolean(isNegotiable);
    if (availableDate) rider.availableDate = availableDate;
    if (timeSlotFrom) rider.timeSlotFrom = timeSlotFrom;
    if (timeSlotTo) rider.timeSlotTo = timeSlotTo;
    if (bio !== undefined) rider.bio = bio;
  } else {
    rider = {
      id: `free_${Date.now()}`,
      userId,
      name: userName,
      avatarUrl: req.user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      phone: req.user.profile?.phone || '9876543210',
      city: req.user.profile?.city || 'Puri',
      serviceZone: serviceZone || 'Patia, Infocity, Bhubaneswar & Puri',
      vehicleType: vehicleType || 'EV Scooter',
      vehicleModel: req.user.profile?.vehicleModel || 'Standard Vehicle',
      vehicleNumber: req.user.profile?.vehicleNumber || 'OD 02 AB 1234',
      baseRatePerTrip: Number(baseRatePerTrip) || 150,
      perKmRate: Number(perKmRate) || 15,
      isNegotiable: isNegotiable !== undefined ? Boolean(isNegotiable) : true,
      isAvailableToday: isAvailableToday !== undefined ? Boolean(isAvailableToday) : true,
      availableDate: availableDate || 'Today',
      timeSlotFrom: timeSlotFrom || '08:00 AM',
      timeSlotTo: timeSlotTo || '08:00 PM',
      rating: 5.0,
      totalCompletedJobs: 1,
      bio: bio || req.user.profile?.bio || 'Freelance rider available for on-demand tasks today.',
      verifiedDriver: Boolean(req.user.profile?.verifiedDriver || req.user.profile?.vehicleNumber),
    };
    freelanceRiders.unshift(rider);
  }

  // Clean up any existing duplicates
  freelanceRiders = getDeduplicatedRiders();

  res.json(rider);
});

function getValidDateStr(inputDate) {
  if (inputDate && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    return inputDate;
  }
  return new Date().toISOString().split('T')[0];
}

function getValidTimeStr(inputTime) {
  if (inputTime && /^\d{2}:\d{2}$/.test(inputTime)) {
    return inputTime;
  }
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseVehicleType(typeStr) {
  const str = (typeStr || '').toLowerCase();
  if (str.includes('ev') || str.includes('scooter') || str.includes('electric')) return 'ev';
  if (str.includes('bike') || str.includes('motor')) return 'bike';
  return 'car';
}

router.post('/hire', authenticate, async (req, res, next) => {
  try {
    const { freelancerId, taskTitle, pickupLocation, dropLocation, agreedPrice } = req.body;
    const freelancer = freelanceRiders.find((f) => f.id === freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelance rider not found.' });
    }

    const freelancerUser = await findOrCreateFreelancerUser(freelancer);
    const clientUser = req.user;

    const pickupAddr = pickupLocation || 'Pickup Address';
    const dropAddr = dropLocation || 'Drop Address';
    const title = taskTitle || 'On-Demand Freelance Delivery & Travel';
    const price = Number(agreedPrice) || freelancer.baseRatePerTrip;

    const dateStr = getValidDateStr(freelancer.availableDate);
    const timeStr = getValidTimeStr('08:00');
    const vType = parseVehicleType(freelancer.vehicleType);

    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Create Ride document in MongoDB
    const taskRide = await Ride.create({
      driver: freelancerUser._id,
      driverName: freelancer.name,
      driverAvatar: freelancer.avatarUrl,
      driverRating: freelancer.rating || 5.0,
      verifiedDriver: Boolean(freelancer.verifiedDriver),
      leavingFrom: pickupAddr,
      goingTo: dropAddr,
      pickupLocation: {
        address: pickupAddr,
        latitude: 20.2961,
        longitude: 85.8245,
        coordinates: { type: 'Point', coordinates: [85.8245, 20.2961] },
      },
      destinationLocation: {
        address: dropAddr,
        latitude: 19.8135,
        longitude: 85.8312,
        coordinates: { type: 'Point', coordinates: [85.8312, 19.8135] },
      },
      date: dateStr,
      time: timeStr,
      price,
      seatsAvailable: 1,
      totalSeats: 1,
      carModel: `${freelancer.vehicleType} (${freelancer.vehicleModel})`,
      vehicleType: vType,
      vehicleModel: freelancer.vehicleModel,
      interests: ['On-Demand Freelance Rider', title],
      carbonSaved: 2.5,
      pickupPin: pin,
    });

    // 2. Create RideRequest document in MongoDB (status PENDING so freelancer must accept manually)
    const taskRequest = await RideRequest.create({
      ride: taskRide._id,
      requester: clientUser._id,
      owner: freelancerUser._id,
      status: 'PENDING',
    });

    // 3. Create initial Message document in MongoDB
    await Message.create({
      ride: taskRide._id,
      sender: clientUser._id,
      recipient: freelancerUser._id,
      text: `⚡ Task Hire Request: ${title}\n📍 Pickup: ${pickupAddr}\n🏁 Drop: ${dropAddr}\n💰 Offered Price: ₹${price}\n🔑 Pickup Verification PIN: ${pin}`,
    });

    // 4. Create Notification document in MongoDB for the freelancer
    await Notification.create({
      user: freelancerUser._id,
      type: 'RIDE_REQUEST',
      title: `⚡ New Task Hire Request from ${clientUser.name || 'Client'}`,
      message: `Task: "${title}" | Rate: ₹${price} | Pickup: ${pickupAddr}`,
      ride: taskRide._id,
      request: taskRequest._id,
    });

    const task = {
      id: `task_${Date.now()}`,
      clientId: clientUser._id.toString(),
      clientName: clientUser.name || 'Client',
      clientAvatar: clientUser.avatarUrl,
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      taskTitle: title,
      pickupLocation: pickupAddr,
      dropLocation: dropAddr,
      agreedPrice: price,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      ride: taskRide.toJSON ? taskRide.toJSON() : taskRide,
    };

    taskRequests.unshift(task);
    return res.status(201).json(task);
  } catch (err) {
    console.error('Error in /hire route:', err);
    return next(err);
  }
});

router.post('/discuss-price', authenticate, async (req, res, next) => {
  try {
    const { freelancerId, discussionPrice, discussionNote } = req.body;
    const freelancer = freelanceRiders.find((f) => f.id === freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelance rider not found.' });
    }

    const freelancerUser = await findOrCreateFreelancerUser(freelancer);
    const clientUser = req.user;
    const price = Number(discussionPrice) || freelancer.baseRatePerTrip;

    const dateStr = getValidDateStr(freelancer.availableDate);
    const timeStr = getValidTimeStr('08:00');
    const vType = parseVehicleType(freelancer.vehicleType);

    const taskRide = await Ride.create({
      driver: freelancerUser._id,
      driverName: freelancer.name,
      driverAvatar: freelancer.avatarUrl,
      driverRating: freelancer.rating || 5.0,
      verifiedDriver: Boolean(freelancer.verifiedDriver),
      leavingFrom: 'Service Zone: ' + freelancer.serviceZone,
      goingTo: 'On-Demand Custom Route',
      pickupLocation: {
        address: freelancer.serviceZone,
        latitude: 20.2961,
        longitude: 85.8245,
        coordinates: { type: 'Point', coordinates: [85.8245, 20.2961] },
      },
      destinationLocation: {
        address: 'Custom Route',
        latitude: 19.8135,
        longitude: 85.8312,
        coordinates: { type: 'Point', coordinates: [85.8312, 19.8135] },
      },
      date: dateStr,
      time: timeStr,
      price,
      seatsAvailable: 1,
      totalSeats: 1,
      carModel: `${freelancer.vehicleType} (${freelancer.vehicleModel})`,
      vehicleType: vType,
      vehicleModel: freelancer.vehicleModel,
      interests: ['Freelance Price Negotiation', discussionNote ? `Note: ${discussionNote}` : ''],
      carbonSaved: 2.0,
    });

    const taskRequest = await RideRequest.create({
      ride: taskRide._id,
      requester: clientUser._id,
      owner: freelancerUser._id,
      status: 'PENDING',
    });

    await Message.create({
      ride: taskRide._id,
      sender: clientUser._id,
      recipient: freelancerUser._id,
      text: `💬 Price Discussion Request from ${clientUser.name || 'Client'}\nProposed Price: ₹${price}${discussionNote ? `\nNote: ${discussionNote}` : ''}`,
    });

    await Notification.create({
      user: freelancerUser._id,
      type: 'RIDE_REQUEST',
      title: `💬 Price Discussion from ${clientUser.name || 'Client'}`,
      message: `Proposed budget: ₹${price} for ${freelancer.serviceZone}`,
      ride: taskRide._id,
      request: taskRequest._id,
    });

    return res.status(201).json(taskRide.toJSON ? taskRide.toJSON() : taskRide);
  } catch (err) {
    console.error('Error in /discuss-price route:', err);
    return next(err);
  }
});

export default router;

