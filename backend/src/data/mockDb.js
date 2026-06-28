let rides = [
  {
    id: 'ride-1',
    driverName: 'Alex Mercer',
    driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.9,
    leavingFrom: 'San Francisco, CA',
    goingTo: 'San Jose, CA',
    date: new Date().toISOString().split('T')[0],
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
    id: 'ride-2',
    driverName: 'Sophia Patel',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.8,
    leavingFrom: 'Oakland, CA',
    goingTo: 'San Francisco, CA',
    date: new Date().toISOString().split('T')[0],
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
  {
    id: 'ride-3',
    driverName: 'Marcus Vance',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    driverRating: 4.7,
    leavingFrom: 'Berkeley, CA',
    goingTo: 'Palo Alto, CA',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '07:45',
    price: 0,
    seatsAvailable: 1,
    totalSeats: 3,
    carModel: 'Chevrolet Bolt EV',
    interests: ['AI Research', 'Cycling', 'Vegan Food'],
    musicTaste: ['Electronic', 'Classical', 'Alternative'],
    carbonSaved: 18.1,
    verifiedDriver: true,
  },
];

let messages = [
  {
    id: 'msg-1',
    rideId: 'ride-1',
    sender: 'driver',
    text: "Hi! Welcome to my ride from SF to San Jose. We'll be taking Highway 101.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    rideId: 'ride-1',
    sender: 'user',
    text: 'Awesome, thank you Alex! Where should we meet for pick-up?',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

let globalStats = {
  totalKmShared: 142850,
  totalCo2SavedKg: 35712,
  treesEquivalent: 1623,
  tripsTaken: 2450,
};

export const db = {
  getRides(filters = {}) {
    let results = [...rides];

    if (filters.leavingFrom) {
      const leavingFrom = filters.leavingFrom.toLowerCase();
      results = results.filter((ride) => ride.leavingFrom.toLowerCase().includes(leavingFrom));
    }

    if (filters.goingTo) {
      const goingTo = filters.goingTo.toLowerCase();
      results = results.filter((ride) => ride.goingTo.toLowerCase().includes(goingTo));
    }

    if (filters.date) {
      results = results.filter((ride) => ride.date === filters.date);
    }

    return results;
  },

  getRideById(id) {
    return rides.find((ride) => ride.id === id) || null;
  },

  createRide(rideData) {
    const calculatedCarbon = Math.floor(Math.random() * 15) + 8;
    const newRide = {
      ...rideData,
      id: `ride-${Date.now()}`,
      driverAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      driverRating: 5.0,
      verifiedDriver: true,
      carbonSaved: calculatedCarbon,
    };

    rides.unshift(newRide);
    globalStats.tripsTaken += 1;
    globalStats.totalCo2SavedKg += calculatedCarbon;
    globalStats.treesEquivalent = Math.floor(globalStats.totalCo2SavedKg / 22);
    globalStats.totalKmShared += Math.floor(calculatedCarbon * 4);

    return newRide;
  },

  getMessages(rideId) {
    return messages.filter((message) => message.rideId === rideId);
  },

  createMessage(rideId, sender, text) {
    const newMessage = {
      id: `msg-${Date.now()}`,
      rideId,
      sender,
      text,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    return newMessage;
  },

  getStats() {
    return globalStats;
  },
};
