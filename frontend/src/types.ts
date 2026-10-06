export interface LocationSelection {
  address: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

export interface PassengerFeedback {
  passengerName: string;
  passengerAvatar?: string;
  rating: number;
  comment: string;
  dateAgo?: string;
}

export interface Ride {
  id: string;
  driverId?: string;
  driver?: string;
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
  recentFeedback?: PassengerFeedback;
  status?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt?: string;
  };
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
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
    vehicleNumber?: string;
    vehicleModel?: string;
    vehicleFrontUrl?: string;
    vehicleRearUrl?: string;
    ownerSelfieUrl?: string;
    locationVerified?: boolean;
    idVerified?: boolean;
    bio?: string;
    emergencyContact?: string;
    rating?: number;
    verifiedDriver?: boolean;
  };
}

export interface PackageDeliveryRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  requesterPhone?: string;
  itemTitle: string;
  category: 'Documents' | 'Electronics' | 'Small Parcel' | 'Heavy Item' | 'Food/Grocery';
  weightClass: 'Under 1 kg' | '1 - 5 kg' | '5 - 15 kg' | '15+ kg';
  pickupAddress: string;
  dropAddress: string;
  pickupLocation?: LocationSelection;
  dropLocation?: LocationSelection;
  offeredReward: number; // in INR ₹
  status: 'OPEN' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  assignedTravelerId?: string;
  assignedTravelerName?: string;
  assignedTravelerAvatar?: string;
  notes?: string;
  createdAt: string;
}

export interface FreelanceRider {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  phone: string;
  city: string;
  serviceZone: string;
  vehicleType: 'EV Scooter' | 'Motorbike' | 'Car' | 'Auto / Loader';
  vehicleModel: string;
  vehicleNumber: string;
  baseRatePerTrip: number; // in INR ₹
  perKmRate: number; // in INR ₹
  isNegotiable?: boolean;
  isAvailableToday: boolean;
  availableDate?: string; // YYYY-MM-DD or "Today"
  timeSlotFrom?: string;  // e.g. "09:00 AM"
  timeSlotTo?: string;    // e.g. "08:00 PM"
  availableTimeSlot?: string;
  rating: number;
  totalCompletedJobs?: number;
  completedTasks?: number;
  bio: string;
  verifiedDriver: boolean;
  verifiedRider?: boolean;
}

export interface FreelanceTaskRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  freelancerId: string;
  freelancerName: string;
  taskTitle: string;
  pickupLocation: string;
  dropLocation: string;
  agreedPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
  createdAt: string;
}

export interface RegionalSpecialtyItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerPhone?: string;
  sellerRating?: number;
  itemTitle: string;
  originLocation: string; // e.g. "Puri", "Pipili", "Nimapada", "Cuttack"
  deliveryDestination: string; // e.g. "Bhubaneswar & Surrounding Areas"
  category: 'Sweets & Delicacies' | 'Handicrafts & Art' | 'Textiles & Handloom' | 'Local Spices & Produce';
  price: number; // in INR ₹
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  rideId?: string;
  ride?: Ride;
  requestId?: string;
  readAt?: string | null;
  isRead: boolean;
  createdAt: string;
}
