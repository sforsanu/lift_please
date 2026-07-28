import React from 'react';
import { Ride } from '../types';
import { Star, MapPin, Flag, Calendar, Clock, Music, Heart, MessageSquare, ShieldCheck, Leaf, Sparkles, Plus, Compass, Navigation } from 'lucide-react';
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

  const hasRides = rides.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 relative">
      
      {/* Positive Recommendation Card when 0 exact matches were found for criteria */}
      {!isExactMatchFound && searchQueryInfo && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-100/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1 rounded-full text-brand-blue text-xs font-extrabold shadow-2xs border border-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
              <span>Nearby Suggestions Active</span>
            </div>
            {onClearFilter && (
              <button
                onClick={onClearFilter}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-950">
              No direct rides on {searchQueryInfo.date ? searchQueryInfo.date : 'this date'} yet, but nearby options are available!
            </h3>
            <p className="mt-1 text-xs md:text-sm font-semibold text-gray-600 leading-relaxed max-w-2xl">
              We couldn't find an exact ride from <strong className="text-gray-900">"{searchQueryInfo.pickupAddress || 'Anywhere'}"</strong> to <strong className="text-gray-900">"{searchQueryInfo.destinationAddress || 'Anywhere'}"</strong>. Check out these popular nearby routes and active community pools below:
            </p>
          </div>

          {/* Quick Action Suggestions */}
          <div className="pt-1 border-t border-blue-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
                Popular Nearby Commute Destinations
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs">
                  📍 Bhubaneswar ↔ Puri
                </span>
                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs">
                  📍 Cuttack ↔ Bhubaneswar
                </span>
                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs">
                  📍 Bhubaneswar ↔ Rourkela
                </span>
              </div>
            </div>

            {onOfferRideClick && (
              <button
                onClick={onOfferRideClick}
                className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-extrabold px-4 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Post This Ride as Driver</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
          <span>{isExactMatchFound ? 'Available Matching Pools' : 'Nearby Available Rides'}</span>
          <span className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-2.5 py-1 rounded-full">
            {rides.length} matches
          </span>
        </h3>
      </div>


      {!hasRides ? (
        <div className="text-center py-10 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto space-y-3">
          <div className="h-12 w-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
            🚗
          </div>
          <h4 className="text-base font-black text-gray-900">No active rides registered in system yet</h4>
          <p className="text-xs font-semibold text-gray-500 max-w-sm mx-auto leading-relaxed">
            Be the first driver to post a trip for this route! Neighbors in your community will be able to join your pool.
          </p>
          {onOfferRideClick && (
            <button
              onClick={onOfferRideClick}
              className="mt-2 inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Offer a Ride Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 relative">
        {/* If guest, overlay a beautiful registration card */}
        {isGuest && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-[5px] rounded-[36px] border-2 border-dashed border-gray-200 p-8 text-center">
            <div className="bg-white rounded-3xl p-8 max-w-sm shadow-xl border border-gray-100 space-y-4">
              <div className="h-12 w-12 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mx-auto text-xl font-black">
                🔑
              </div>
              <h4 className="text-lg font-extrabold text-gray-900">View Active Ride Pools</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Join matching pools, chat securely with verified drivers, and start saving money & CO₂ emissions on your daily commute.
              </p>
              <button 
                onClick={onPromptLogin}
                className="w-full h-11 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-full font-bold text-sm shadow-md shadow-brand-blue/10 active:scale-95 transition-transform cursor-pointer"
              >
                Sign In to Unlock Matching Pools
              </button>
            </div>
          </div>
        )}

        {rides.map((ride) => {
          const reqStatus = userRequests[ride.id] || (joinedRideIds.includes(ride.id) ? 'ACCEPTED' : null);
          const isDriver = currentUserId && (ride.driverId === currentUserId || ride.driver === currentUserId);

          return (
            <motion.div
              layout
              key={ride.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 ${isGuest ? 'select-none pointer-events-none filter blur-[1px] opacity-60' : ''}`}
            >
              {/* Driver profile + route info */}
              <div className="flex-1 space-y-4">
                
                {/* Driver Meta Row */}
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <img
                      src={ride.driverAvatar}
                      alt={ride.driverName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-brand-blue/10"
                      referrerPolicy="no-referrer"
                    />
                    {ride.verifiedDriver && (
                      <span className="absolute -bottom-1 -right-1 bg-brand-green text-white p-0.5 rounded-full border border-white" title="Verified Driver">
                        <ShieldCheck className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-gray-900 text-sm leading-none">{ride.driverName}</h4>
                      <div className="flex items-center text-amber-500 text-xs font-semibold">
                        <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                        <span>{ride.driverRating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {/* Vehicle details row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-brand-blue border border-blue-100">
                        <span>{ride.vehicleType === 'bike' ? '🏍️ Bike' : ride.vehicleType === 'ev' ? '⚡ EV' : '🚗 Car'}</span>
                        <span>· {ride.vehicleModel || ride.carModel}</span>
                      </span>

                      {ride.vehicleColor && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          🎨 {ride.vehicleColor}
                        </span>
                      )}

                      {ride.vehicleNumber && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono">
                          {ride.vehicleNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Route specs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-start space-x-2.5">
                    <MapPin className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leaving From</p>
                      <p className="text-sm font-bold text-gray-800">{ride.leavingFrom}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <Flag className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Going To</p>
                      <p className="text-sm font-bold text-gray-800">{ride.goingTo}</p>
                    </div>
                  </div>
                </div>

                {/* Timing & Sustainability badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="flex items-center space-x-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-semibold">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{ride.date}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{ride.time} AM</span>
                  </span>
                  <span className="flex items-center space-x-1.5 bg-[#d1fae5] text-brand-green px-3 py-1.5 rounded-full font-bold">
                    <Leaf className="h-3.5 w-3.5" />
                    <span>Saves {ride.carbonSaved} kg CO₂</span>
                  </span>
                  <span className="bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full font-bold">
                    {ride.seatsAvailable} of {ride.totalSeats} seats open
                  </span>
                  {(() => {
                    const routeKm = ride.routeDistanceKm || calculateDistanceKm(ride.pickupLocation, ride.destinationLocation);
                    if (routeKm > 0) {
                      return (
                        <span className="flex items-center space-x-1.5 bg-blue-50 text-brand-blue border border-blue-200/80 px-3 py-1.5 rounded-full font-extrabold">
                          <Navigation className="h-3.5 w-3.5 text-brand-blue" />
                          <span>{routeKm.toFixed(1)} km route</span>
                        </span>
                      );
                    }
                    return null;
                  })()}
                  {typeof ride.distanceInKm === 'number' && (
                    <span className="bg-white border border-brand-blue/20 text-brand-blue px-3 py-1.5 rounded-full font-bold">
                      {ride.distanceInKm.toFixed(1)} km away
                    </span>
                  )}
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {/* Interests */}
                  {ride.interests.map((tag, idx) => (
                    <span key={`int-${idx}`} className="flex items-center space-x-1 text-[11px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md border border-slate-200 font-semibold">
                      <Heart className="h-3 w-3 text-brand-blue" />
                      <span>{tag}</span>
                    </span>
                  ))}
                  {/* Music */}
                  {ride.musicTaste.map((tag, idx) => (
                    <span key={`mus-${idx}`} className="flex items-center space-x-1 text-[11px] bg-indigo-50/50 text-indigo-500 px-2.5 py-1 rounded-md border border-indigo-100 font-semibold">
                      <Music className="h-3 w-3 text-indigo-500" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

              </div>

              {/* Action buttons (right column) */}
              <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-3 md:border-l md:border-gray-100 md:pl-6 min-w-[160px]">
                
                {/* Price Display - 100% Free Forever */}
                <div className="text-center md:pb-2">
                  <p className="text-2xl font-black text-brand-blue">Free</p>
                  <p className="text-[10px] text-brand-green font-extrabold uppercase tracking-widest mt-0.5">Community Ride</p>
                </div>

                {/* Request / Join Status Button */}
                {isDriver ? (
                  <button
                    onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                    className="w-full py-3 px-4 rounded-full font-bold text-xs bg-blue-50 text-brand-blue border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    Manage Requests
                  </button>
                ) : reqStatus === 'ACCEPTED' ? (
                  <button
                    onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                    className="w-full py-3 px-4 rounded-full font-bold text-xs bg-brand-green text-white shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Joined Pool!</span>
                  </button>
                ) : reqStatus === 'PENDING' ? (
                  <button
                    onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                    className="w-full py-3 px-4 rounded-full font-bold text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>Request Pending...</span>
                  </button>
                ) : reqStatus === 'REJECTED' ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-full font-bold text-xs bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                  >
                    Request Declined
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleActionClick(e, () => onJoinRide(ride))}
                    disabled={ride.seatsAvailable <= 0}
                    className={`w-full py-3 px-4 rounded-full font-bold text-xs shadow-sm transition-all active:scale-[0.97] cursor-pointer ${
                      ride.seatsAvailable <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-brand-blue/20'
                    }`}
                  >
                    {ride.seatsAvailable <= 0 ? 'Full Pool' : 'Request to Join'}
                  </button>
                )}

                {/* Secure Chat Button */}
                <button
                  onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                  className="w-full py-3 px-4 border border-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 text-gray-700 hover:text-brand-blue rounded-full font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{reqStatus === 'ACCEPTED' ? 'Secure Chat (Unlocked)' : reqStatus === 'PENDING' ? 'View Status' : 'Secure Chat'}</span>
                </button>

              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
