import { Message, Ride, User } from '../models/index.js';

const seedUsers = [
  {
    name: 'Alex Mercer',
    email: 'alex.mercer@lift.example',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    profile: { rating: 4.9, verifiedDriver: true },
  },
  {
    name: 'Sophia Patel',
    email: 'sophia.patel@lift.example',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    profile: { rating: 4.8, verifiedDriver: true },
  },
  {
    name: 'Marcus Vance',
    email: 'marcus.vance@lift.example',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    profile: { rating: 4.7, verifiedDriver: true },
  },
];

function today(offsetDays = 0) {
  return new Date(Date.now() + offsetDays * 86400000).toISOString().split('T')[0];
}

function location(address, placeId, latitude, longitude) {
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

export async function seedInitialData() {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    return;
  }

  const existingRideCount = await Ride.estimatedDocumentCount();
  if (existingRideCount > 0) {
    return;
  }

  const usersByEmail = new Map();

  for (const seedUser of seedUsers) {
    const user = await User.findOneAndUpdate(
      { email: seedUser.email },
      {
        $setOnInsert: {
          ...seedUser,
          authProvider: 'local',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    usersByEmail.set(seedUser.email, user);
  }

  const rides = [
    {
      driver: usersByEmail.get('alex.mercer@lift.example')._id,
      driverName: 'Alex Mercer',
      driverAvatar: seedUsers[0].avatarUrl,
      driverRating: 4.9,
      leavingFrom: 'Bhubaneswar, Odisha, India',
      goingTo: 'Puri, Odisha, India',
      pickupLocation: location('Bhubaneswar, Odisha, India', 'place_bhubaneswar', 20.2961, 85.8245),
      destinationLocation: location('Puri, Odisha, India', 'place_puri', 19.8135, 85.8312),
      date: today(),
      time: '08:30',
      price: 0,
      seatsAvailable: 3,
      totalSeats: 4,
      carModel: 'Tesla Model 3 (EV)',
      vehicleType: 'ev',
      vehicleModel: 'Tesla Model 3 (EV)',
      vehicleColor: 'Pearl White',
      vehicleNumber: 'OD 02 EV 9999',
      interests: ['Tech', 'Sustainability', 'Hiking'],
      musicTaste: ['Indie Rock', 'Synthwave', 'Ambient'],
      carbonSaved: 14.5,
      verifiedDriver: true,
    },
    {
      driver: usersByEmail.get('sophia.patel@lift.example')._id,
      driverName: 'Sophia Patel',
      driverAvatar: seedUsers[1].avatarUrl,
      driverRating: 4.8,
      leavingFrom: 'Cuttack, Odisha, India',
      goingTo: 'Bhubaneswar, Odisha, India',
      pickupLocation: location('Cuttack, Odisha, India', 'place_cuttack', 20.4625, 85.8828),
      destinationLocation: location('Bhubaneswar, Odisha, India', 'place_bhubaneswar', 20.2961, 85.8245),
      date: today(),
      time: '09:00',
      price: 0,
      seatsAvailable: 2,
      totalSeats: 4,
      carModel: 'Hyundai Creta',
      vehicleType: 'car',
      vehicleModel: 'Hyundai Creta',
      vehicleColor: 'Midnight Black',
      vehicleNumber: 'OD 05 AB 1234',
      interests: ['Design', 'Coffee', 'Yoga'],
      musicTaste: ['Lofi Beats', 'Jazz', 'R&B'],
      carbonSaved: 8.2,
      verifiedDriver: true,
    },
    {
      driver: usersByEmail.get('marcus.vance@lift.example')._id,
      driverName: 'Marcus Vance',
      driverAvatar: seedUsers[2].avatarUrl,
      driverRating: 4.7,
      leavingFrom: 'Bhubaneswar, Odisha, India',
      goingTo: 'Rourkela, Odisha, India',
      pickupLocation: location('Bhubaneswar, Odisha, India', 'place_bhubaneswar', 20.2961, 85.8245),
      destinationLocation: location('Rourkela, Odisha, India', 'place_rourkela', 22.2604, 84.8536),
      date: today(1),
      time: '07:45',
      price: 0,
      seatsAvailable: 1,
      totalSeats: 3,
      carModel: 'Royal Enfield Classic 350',
      vehicleType: 'bike',
      vehicleModel: 'Royal Enfield Classic 350',
      vehicleColor: 'Stealth Black',
      vehicleNumber: 'OD 07 RE 3500',
      interests: ['AI Research', 'Cycling', 'Vegan Food'],
      musicTaste: ['Electronic', 'Classical', 'Alternative'],
      carbonSaved: 18.1,
      verifiedDriver: true,
    },
    {
      driver: usersByEmail.get('alex.mercer@lift.example')._id,
      driverName: 'Alex Mercer',
      driverAvatar: seedUsers[0].avatarUrl,
      driverRating: 4.9,
      leavingFrom: 'San Francisco, CA',
      goingTo: 'San Jose, CA',
      pickupLocation: location('San Francisco, CA', 'demo:san-francisco-ca', 37.7749, -122.4194),
      destinationLocation: location('San Jose, CA', 'demo:san-jose-ca', 37.3382, -121.8863),
      date: today(),
      time: '08:30',
      price: 0,
      seatsAvailable: 3,
      totalSeats: 4,
      carModel: 'Tesla Model 3 (EV)',
      interests: ['Tech', 'Sustainability', 'Hiking'],
      musicTaste: ['Indie Rock', 'Synthwave', 'Ambient'],
      carbonSaved: 14.5,
      verifiedDriver: true,
    },
    {
      driver: usersByEmail.get('sophia.patel@lift.example')._id,
      driverName: 'Sophia Patel',
      driverAvatar: seedUsers[1].avatarUrl,
      driverRating: 4.8,
      leavingFrom: 'Oakland, CA',
      goingTo: 'San Francisco, CA',
      pickupLocation: location('Oakland, CA', 'demo:oakland-ca', 37.8044, -122.2712),
      destinationLocation: location('San Francisco, CA', 'demo:san-francisco-ca', 37.7749, -122.4194),
      date: today(),
      time: '09:00',
      price: 0,
      seatsAvailable: 2,
      totalSeats: 4,
      carModel: 'Hyundai Ioniq 5',
      interests: ['Design', 'Coffee', 'Yoga'],
      musicTaste: ['Lofi Beats', 'Jazz', 'R&B'],
      carbonSaved: 8.2,
      verifiedDriver: true,
    },
  ];

  const insertedRides = await Ride.insertMany(rides);
  const alexRide = insertedRides[0];
  const alexUser = usersByEmail.get('alex.mercer@lift.example');
  const sophiaUser = usersByEmail.get('sophia.patel@lift.example');

  await Message.insertMany([
    {
      ride: alexRide._id,
      sender: alexUser._id,
      text: "Hi! Welcome to my ride from SF to San Jose. We'll be taking Highway 101.",
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      ride: alexRide._id,
      sender: sophiaUser._id,
      recipient: alexUser._id,
      text: 'Awesome, thank you Alex! Where should we meet for pick-up?',
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(Date.now() - 1800000),
    },
  ]);

  console.log(`Seeded ${rides.length} demo rides into MongoDB`);
}
