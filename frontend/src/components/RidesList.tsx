import React from 'react';
import { Ride } from '../types';
import { Star, MapPin, Flag, Calendar, Clock, Music, Heart, MessageSquare, ShieldCheck, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface RidesListProps {
  rides: Ride[];
  onJoinRide: (ride: Ride) => void;
  onOpenChat: (ride: Ride) => void;
  joinedRideIds: string[];
  isGuest?: boolean;
  onPromptLogin?: () => void;
}

export default function RidesList({ 
  rides, 
  onJoinRide, 
  onOpenChat, 
  joinedRideIds,
  isGuest = false,
  onPromptLogin
}: RidesListProps) {
  
  if (rides.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto my-8">
        <span className="text-4xl">🚗</span>
        <h4 className="mt-4 text-lg font-bold text-gray-900">No matching rides found</h4>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Try searching for a different destination or list your own trip as a driver to help your neighbors!
        </p>
      </div>
    );
  }

  const handleActionClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    if (isGuest && onPromptLogin) {
      onPromptLogin();
    } else {
      callback();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
          <span>Available Matching Pools</span>
          <span className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-2.5 py-1 rounded-full">
            {rides.length} matches
          </span>
        </h3>
      </div>

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
          const isJoined = joinedRideIds.includes(ride.id);

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
                    <p className="text-xs text-gray-400 font-medium mt-1">{ride.carModel}</p>
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
              <div className="flex flex-col sm:flex-row md:flex-col justify-center gap-3 md:border-l md:border-gray-100 md:pl-6 min-w-[150px]">
                
                {/* Price Display - 100% Free Forever */}
                <div className="text-center md:pb-2">
                  <p className="text-2xl font-black text-brand-blue">Free</p>
                  <p className="text-[10px] text-brand-green font-extrabold uppercase tracking-widest mt-0.5">Community Ride</p>
                </div>

                {/* Join Button */}
                <button
                  onClick={(e) => handleActionClick(e, () => onJoinRide(ride))}
                  disabled={isJoined || ride.seatsAvailable <= 0}
                  className={`w-full py-3 px-4 rounded-full font-bold text-sm shadow-sm transition-all active:scale-[0.97] cursor-pointer ${
                    isJoined
                      ? 'bg-brand-green text-white shadow-[#5cfd80]/20'
                      : ride.seatsAvailable <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-brand-blue hover:bg-brand-blue-hover text-white shadow-brand-blue/20'
                  }`}
                >
                  {isJoined ? 'Joined Pool!' : ride.seatsAvailable <= 0 ? 'Full Pool' : 'Join Pool'}
                </button>

                {/* Chat Button */}
                <button
                  onClick={(e) => handleActionClick(e, () => onOpenChat(ride))}
                  className="w-full py-3 px-4 border border-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 text-gray-700 hover:text-brand-blue rounded-full font-bold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Secure Chat</span>
                </button>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
