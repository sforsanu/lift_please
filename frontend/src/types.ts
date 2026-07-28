export interface LocationSelection {
  address: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

export interface Ride {
  id: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  leavingFrom: string;
  goingTo: string;
  pickupLocation?: LocationSelection;
  destinationLocation?: LocationSelection;
  date: string; // YYYY-MM-DD
  time: string;  // HH:MM
  price: number; // 0 for free
  seatsAvailable: number;
  totalSeats: number;
  carModel: string;
  vehicleType?: 'car' | 'bike' | 'ev';
  vehicleModel?: string;
  vehicleNumber?: string;
  vehicleColor?: string;
  interests: string[];
  musicTaste: string[];
  carbonSaved: number; // CO2 savings in kg
  verifiedDriver: boolean;
  distanceInKm?: number;
  routeDistanceKm?: number;
}

export interface RideRequestInfo {
  id: string;
  requesterId?: string;
  requesterName?: string;
  requesterAvatar?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
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

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  avatarUrl?: string;
  authProvider?: 'local' | 'google';
  profile?: {
    phone?: string;
    bio?: string;
    rating?: number;
    verifiedDriver?: boolean;
  };
}
