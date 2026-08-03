import React from 'react';
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
  Quote, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight, 
  ThumbsUp, 
  Shield, 
  Car,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { calculateDistanceKm } from '../utils/googlePlaces';

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

const DEFAULT_FEEDBACKS = [
  {
    passengerName: 'Ananya Sharma',
    passengerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Super smooth EV ride! Driver was on time, car was spotless, and helped me with luggage. Saved CO₂ too!',
    dateAgo: '2 days ago',
  },
  {
    passengerName: 'Debasish Mohanty',
    passengerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Helped me immensely during morning peak traffic. Safe driving, super polite driver & great playlist!',
    dateAgo: 'Yesterday',
  },
  {
    passengerName: 'Priya Raj',
    passengerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Very helpful commuter! Clean vehicle and comfortable ride. So glad to find this community pool.',
    dateAgo: '3 days ago',
  },
];

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
  searchQueryInfo,
  onOfferRideClick,
  onClearFilter,
}: RidesListProps) {
  
  const handleActionClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    if (isGuest && onPromptLogin) {
      onPromptLogin();
    } else {
      callback();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Separate active/upcoming rides from past/recently completed rides
  const upcomingRides = rides.filter(ride => ride.date >= todayStr);
  const completedRides = rides.filter(ride => ride.date < todayStr);

  const renderRideCard = (ride: Ride, isCompleted: boolean, index: number) => {
    const reqStatus = userRequests[ride.id] || (joinedRideIds.includes(ride.id) ? 'ACCEPTED' : null);
    const isDriver = currentUserId && (ride.driverId === currentUserId || ride.driver === currentUserId);

    // Get feedback or pick a fallback sample feedback for display
    const feedback = ride.recentFeedback || DEFAULT_FEEDBACKS[index % DEFAULT_FEEDBACKS.length];
    const routeKm = ride.routeDistanceKm || calculateDistanceKm(ride.pickupLocation, ride.destinationLocation);

    return (
      <motion.div
        layout
        key={ride.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className={`group relative bg-white border ${
          isCompleted ? 'border-emerald-200/80 bg-slate-50/70' : 'border-slate-200/80 hover:border-blue-500/50'
        } rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 overflow-hidden ${
          isGuest ? 'select-none pointer-events-none filter blur-[1px] opacity-60' : ''
        }`}
      >
        {/* Top Accent Gradient Header Line */}
        <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
          isCompleted 
            ? 'from-emerald-500 via-teal-400 to-emerald-600' 
            : 'from-blue-600 via-indigo-500 to-blue-500 group-hover:scale-x-100'
        }`} />

        {/* Status Header Bar for Completed Rides */}
        {isCompleted && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl text-emerald-950 text-xs font-black">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Recently Completed Ride</span>
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Trip Finish · {ride.date}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Column: Driver Info, Route & Details */}
          <div className="flex-1 space-y-4">
            
            {/* Driver Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src={ride.driverAvatar}
                    alt={ride.driverName}
                    className="h-13 w-13 rounded-2xl object-cover border-2 border-slate-200 shadow-sm group-hover:border-blue-500 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  {ride.verifiedDriver && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-sm border border-white" title="Verified Driver Badge">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-slate-900 text-base leading-tight tracking-tight">
                      {ride.driverName}
                    </h4>
                    <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-black border border-amber-200/80">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" />
                      <span>{ride.driverRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  {/* Vehicle Details */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center space-x-1 text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      <span>{ride.vehicleType === 'bike' ? '🏍️ Bike' : ride.vehicleType === 'ev' ? '⚡ EV' : '🚗 Car'}</span>
                      <span>· {ride.vehicleModel || ride.carModel}</span>
                    </span>

                    {ride.vehicleColor && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                        🎨 {ride.vehicleColor}
                      </span>
                    )}

                    {ride.vehicleNumber && (
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono tracking-wider">
                        {ride.vehicleNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Carbon Savings Floating Badge */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-black">
                  <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Saves {ride.carbonSaved} kg CO₂</span>
                </span>
              </div>
            </div>

            {/* Route Timeline Block */}
            <div className="bg-slate-50/90 border border-slate-200/70 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Leaving From</p>
                    <p className="text-sm font-black text-slate-900 truncate">{ride.leavingFrom}</p>
                  </div>
                </div>

                <div className="px-3 flex flex-col items-center flex-shrink-0">
                  <div className="flex items-center space-x-1 text-slate-300">
                    <div className="h-0.5 w-6 bg-slate-300" />
                    <Navigation className="h-3.5 w-3.5 text-blue-600 rotate-90" />
                    <div className="h-0.5 w-6 bg-slate-300" />
                  </div>
                  {routeKm > 0 && (
                    <span className="text-[10px] font-extrabold text-blue-600 mt-0.5">
                      {routeKm.toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2.5 flex-1 min-w-0 justify-end text-right">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Going To</p>
                    <p className="text-sm font-black text-slate-900 truncate">{ride.goingTo}</p>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Timing & Seat Info */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-slate-600">
              <span className="inline-flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>{ride.date}</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>{ride.time} AM</span>
              </span>
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl ${
                isCompleted
                  ? 'bg-slate-200 text-slate-600'
                  : ride.seatsAvailable > 0
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                <Users className="h-3.5 w-3.5" />
                <span>{isCompleted ? 'Pool Completed' : `${ride.seatsAvailable} of ${ride.totalSeats} seats open`}</span>
              </span>
            </div>

            {/* Passenger Testimonial / Feedback Box */}
            {feedback && (
              <div className="bg-gradient-to-r from-amber-50/60 via-slate-50 to-blue-50/40 border border-amber-200/60 p-3.5 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={feedback.passengerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={feedback.passengerName}
                      className="h-7 w-7 rounded-full object-cover border border-amber-300"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{feedback.passengerName}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Verified Passenger
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-500 text-[11px] font-extrabold">
                    {[...Array(feedback.rating || 5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    {feedback.dateAgo && (
                      <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                        • {feedback.dateAgo}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700 italic leading-relaxed flex items-start gap-1.5">
                  <Quote className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>"{feedback.comment}"</span>
                </p>
              </div>
            )}

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ride.interests.map((tag, idx) => (
                <span key={`int-${idx}`} className="flex items-center space-x-1 text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                  <Heart className="h-3 w-3 text-blue-600" />
                  <span>{tag}</span>
                </span>
              ))}
              {ride.musicTaste.map((tag, idx) => (
                <span key={`mus-${idx}`} className="flex items-center space-x-1 text-[11px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg font-bold">
                  <Music className="h-3 w-3 text-indigo-600" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

          </div>

          {/* Right Column: Pricing & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-3 lg:border-l lg:border-slate-100 lg:pl-6 min-w-[170px]">
            
            {/* Price Banner */}
            <div className="text-center lg:pb-2">
              <span className="text-3xl font-black text-blue-600 tracking-tight">Free</span>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" /> Community Ride
              </p>
            </div>

            {/* Action Buttons */}
            {isCompleted ? (
              <div className="space-y-2">
                <button
                  onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                  className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completed Trip</span>
                </button>
                <button
                  onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                  className="w-full py-2.5 px-4 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                  <span>View Discussion</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {isDriver ? (
                  <button
                    onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                    className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shadow-sm"
                  >
                    Manage Requests
                  </button>
                ) : reqStatus === 'ACCEPTED' ? (
                  <button
                    onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                    className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-emerald-600 text-white shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Joined Pool!</span>
                  </button>
                ) : reqStatus === 'PENDING' ? (
                  <button
                    onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                    className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>Request Pending...</span>
                  </button>
                ) : reqStatus === 'REJECTED' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-2xl font-extrabold text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  >
                    Request Declined
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleActionClick(e, () => onJoinRide(ride))}
                    disabled={ride.seatsAvailable <= 0}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs shadow-md transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center space-x-1.5 ${
                      ride.seatsAvailable <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/20'
                    }`}
                  >
                    <span>{ride.seatsAvailable <= 0 ? 'Pool Full' : 'Request to Join'}</span>
                    {ride.seatsAvailable > 0 && <ArrowRight className="h-4 w-4" />}
                  </button>
                )}

                <button
                  onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                  className="w-full py-2.5 px-4 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{reqStatus === 'ACCEPTED' ? 'Secure Chat (Unlocked)' : reqStatus === 'PENDING' ? 'View Status' : 'Secure Chat'}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    );
  };

  const hasAnyRides = rides.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 relative">
      
      {/* Positive Recommendation Card when 0 exact matches were found for criteria */}
      {!isExactMatchFound && searchQueryInfo && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-100/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1 rounded-full text-blue-600 text-xs font-extrabold shadow-xs border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Nearby Suggestions Active</span>
            </div>
            {onClearFilter && (
              <button
                onClick={onClearFilter}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-950">
              No direct rides on {searchQueryInfo.date ? searchQueryInfo.date : 'this date'} yet, but nearby options are available!
            </h3>
            <p className="mt-1 text-xs md:text-sm font-semibold text-slate-600 leading-relaxed max-w-2xl">
              We couldn't find an exact ride from <strong className="text-slate-900">"{searchQueryInfo.pickupAddress || 'Anywhere'}"</strong> to <strong className="text-slate-900">"{searchQueryInfo.destinationAddress || 'Anywhere'}"</strong>. Check out these popular nearby routes and active community pools below:
            </p>
          </div>

          {/* Quick Action Suggestions */}
          <div className="pt-2 border-t border-blue-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Popular Nearby Commute Destinations
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs">
                  📍 Bhubaneswar ↔ Puri
                </span>
                <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs">
                  📍 Cuttack ↔ Bhubaneswar
                </span>
                <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs">
                  📍 Bhubaneswar ↔ Rourkela
                </span>
              </div>
            </div>

            {onOfferRideClick && (
              <button
                onClick={onOfferRideClick}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Post This Ride as Driver</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guest Overlay Banner */}
      {isGuest && (
        <div className="relative z-20 flex flex-col items-center justify-center bg-slate-900/90 text-white rounded-3xl p-8 text-center shadow-xl mb-6">
          <div className="p-3 bg-blue-600/30 text-blue-400 rounded-2xl mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h4 className="text-xl font-black">View Active Ride Pools</h4>
          <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
            Sign in to join matching pools, chat securely with verified drivers, and start saving money & CO₂ emissions on your daily commute.
          </p>
          <button 
            onClick={onPromptLogin}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Sign In to Unlock Matching Pools
          </button>
        </div>
      )}

      {!hasAnyRides ? (
        <div className="text-center py-12 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
            🚗
          </div>
          <h4 className="text-lg font-black text-slate-900">No active rides registered in system yet</h4>
          <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto leading-relaxed">
            Be the first driver to post a trip for this route! Neighbors in your community will be able to join your pool.
          </p>
          {onOfferRideClick && (
            <button
              onClick={onOfferRideClick}
              className="mt-2 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-xs font-black shadow-md hover:bg-blue-700 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Offer a Ride Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">

          {/* SECTION 1: Active & Upcoming Matching Pools */}
          {upcomingRides.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                    <span>{isExactMatchFound ? 'Active & Upcoming Matching Pools' : 'Nearby Active Rides'}</span>
                  </h3>
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs font-black px-3 py-1 rounded-full border border-blue-100">
                  {upcomingRides.length} active pools
                </span>
              </div>

              <div className="grid gap-5">
                {upcomingRides.map((ride, idx) => renderRideCard(ride, false, idx))}
              </div>
            </div>
          )}

          {/* SECTION 2: Recently Completed Rides */}
          {completedRides.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                      <span>Recently Completed Rides</span>
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Past verified ride pools successfully completed with verified passenger feedback.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                  {completedRides.length} completed
                </span>
              </div>

              <div className="grid gap-5">
                {completedRides.map((ride, idx) => renderRideCard(ride, true, idx))}
              </div>
            </div>
          )}

          {/* If all rides happened to be in one category and not the other */}
          {upcomingRides.length === 0 && completedRides.length > 0 && (
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-center text-xs font-bold text-blue-900">
              💡 All listed rides above are recently completed. Post a new ride to create an active upcoming pool!
            </div>
          )}

        </div>
      )}
    </div>
  );
}
