export interface Ride {
  id: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  leavingFrom: string;
  goingTo: string;
  date: string; // YYYY-MM-DD
  time: string;  // HH:MM
  price: number; // 0 for free
  seatsAvailable: number;
  totalSeats: number;
  carModel: string;
  interests: string[];
  musicTaste: string[];
  carbonSaved: number; // CO2 savings in kg
  verifiedDriver: boolean;
}

export interface Message {
  id: string;
  rideId: string;
  sender: 'user' | 'driver';
  text: string;
  timestamp: string;
}

export interface CarbonStats {
  totalKmShared: number;
  totalCo2SavedKg: number;
  treesEquivalent: number;
  tripsTaken: number;
}
