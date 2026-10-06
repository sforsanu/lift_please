import React, { useState, useMemo } from 'react';
import { Ride } from '../types';
import {
  Star,
  MapPin,
  Flag,
  Calendar,
  Clock,
  Music,
  Heart,
  MessageSquare,
  ShieldCheck,
  Leaf,
  Sparkles,
  Plus,
  Navigation,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Shield,
  Car,
  Users,
  Filter,
  Zap,
  Bike,
} from 'lucide-react';
import { motion } from 'motion/react';
import { calculateDistanceKm } from '../utils/googlePlaces';
import LiveTrackingModal from './LiveTrackingModal';

interface RidesListProps {
  rides: Ride[];
  onJoinRide: (ride: Ride) => void;
  onOpenChat: (ride: Ride) => void;
  joinedRideIds: string[];
  userRequests?: Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'>;
  currentUserId?: string;
  isGuest?: boolean;
  onPromptLogin?: () => void;
  isExactMatchFound?: boolean;
  searchQueryInfo?: { pickupAddress?: string; destinationAddress?: string; date?: string } | null;
  onOfferRideClick?: () => void;
  onClearFilter?: () => void;
}

export default function RidesList({
  rides,
  onJoinRide,
  onOpenChat,
  joinedRideIds,
  userRequests = {},
  currentUserId,
  isGuest = false,
  onPromptLogin,
  isExactMatchFound = true,
  searchQueryInfo = null,
  onOfferRideClick,
  onClearFilter,
}: RidesListProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'EV' | 'HIGH_RATING' | 'BIKE'>('ALL');
  const [activeTrackingRide, setActiveTrackingRide] = useState<Ride | null>(null);

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      if (filterType === 'EV') return ride.vehicleType === 'ev' || ride.carModel?.toLowerCase().includes('ev') || ride.carModel?.toLowerCase().includes('tesla');
      if (filterType === 'HIGH_RATING') return ride.driverRating >= 4.8;
      if (filterType === 'BIKE') return ride.vehicleType === 'bike' || ride.carModel?.toLowerCase().includes('royal') || ride.carModel?.toLowerCase().includes('bike');
      return true;
    });
  }, [rides, filterType]);

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Search Header Info / Exact Match Warning */}
      {!isExactMatchFound && searchQueryInfo && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-semibold text-amber-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📍</span>
            <div>
              <p className="font-extrabold text-slate-900">No exact matches found for requested date & locations.</p>
              <p className="text-slate-600 mt-0.5">Showing all active community ride pools as recommendations below.</p>
            </div>
          </div>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-extrabold text-xs hover:bg-amber-100 cursor-pointer transition-colors shadow-2xs"
            >
              Show All
            </button>
          )}
        </div>
      )}

      {/* Header & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Community Pools</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Available Ride Pools</h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            {filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'} ready for shared commuting
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Pools', icon: Car },
            { id: 'EV', label: 'EV Only ⚡', icon: Zap },
            { id: 'HIGH_RATING', label: '★ 4.8+ Top Rated', icon: Star },
            { id: 'BIKE', label: 'Bikes 🏍️', icon: Bike },
          ].map((chip) => {
            const active = filterType === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterType(chip.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rides Grid / Card List */}
      {filteredRides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            🚗
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No ride pools match this filter</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 max-w-md mx-auto">
              Try switching back to "All Pools" or offer a new ride for co-travelers in your area.
            </p>
          </div>
          {onOfferRideClick && (
            <button
              onClick={onOfferRideClick}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Offer a Ride Pool</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRides.map((ride) => {
            const isDriverSelf = currentUserId === (ride.driverId || ride.driver);
            const isJoined = joinedRideIds.includes(ride.id);
            const reqStatus = userRequests[ride.id];
            const distance =
              ride.pickupLocation && ride.destinationLocation
                ? calculateDistanceKm(
                    ride.pickupLocation.latitude,
                    ride.pickupLocation.longitude,
                    ride.destinationLocation.latitude,
                    ride.destinationLocation.longitude
                  )
                : null;

            return (
              <div
                key={ride.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Bar: Driver & Rating */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ride.driverAvatar}
                        alt={ride.driverName}
                        className="h-12 w-12 rounded-2xl object-cover border-2 border-blue-500/30 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-slate-900">{ride.driverName}</h4>
                          {ride.verifiedDriver && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" title="Verified Driver" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500">
                          {ride.carModel || 'Vehicle'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 shadow-2xs">
                      <Star className="mr-1 h-3.5 w-3.5 fill-current text-amber-400" />
                      {ride.driverRating.toFixed(1)}
                    </div>
                  </div>

                  {/* Route Visualizer */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3 mb-4">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Pickup</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{ride.leavingFrom}</p>
                      </div>
                    </div>

                    <div className="ml-2 pl-3 border-l-2 border-dashed border-blue-300 text-[10px] font-extrabold text-blue-600 py-0.5">
                      {distance ? `${distance.toFixed(1)} km commute` : 'Direct Route'}
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Flag className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Destination</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{ride.goingTo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges Row: Time, Seats, CO2 */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      {ride.time} ({ride.date})
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                      {ride.carbonSaved} kg CO₂ offset
                    </span>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                      {ride.seatsAvailable} seats open
                    </span>
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTrackingRide(ride)}
                    className="h-11 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Navigation className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    <span>Track Live</span>
                  </button>

                  {isJoined ? (
                    <button
                      onClick={() => onOpenChat(ride)}
                      className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Chat</span>
                    </button>
                  ) : reqStatus === 'PENDING' ? (
                    <button
                      disabled
                      className="h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold flex items-center justify-center space-x-1 cursor-not-allowed"
                    >
                      <span>Request Sent ⏳</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => (isGuest && onPromptLogin ? onPromptLogin() : onJoinRide(ride))}
                      className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                    >
                      <span>{isGuest ? 'Sign In to Join' : 'Join Pool'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Tracking Modal when clicked */}
      {activeTrackingRide && (
        <LiveTrackingModal
          ride={activeTrackingRide}
          onClose={() => setActiveTrackingRide(null)}
          currentUser={isGuest ? undefined : (currentUserId as any)}
        />
      )}
    </section>
  );
}
