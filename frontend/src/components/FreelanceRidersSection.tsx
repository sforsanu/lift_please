import React, { useState, useEffect } from 'react';
import { Zap, Bike, MapPin, Flag, Star, ShieldCheck, Check, Plus, MessageSquare, Loader2, IndianRupee, Clock, UserCheck, Car, Phone, Filter, Calendar, ExternalLink, HelpCircle, AlertCircle, Edit3 } from 'lucide-react';
import type { FreelanceRider, Ride, AuthUser } from '../types';

interface FreelanceRidersSectionProps {
  currentUser: AuthUser;
  onOpenChat: (ride: Ride) => void;
  onNavigateToProfile?: () => void;
}

export default function FreelanceRidersSection({ currentUser, onOpenChat, onNavigateToProfile }: FreelanceRidersSectionProps) {
  const [freelancers, setFreelancers] = useState<FreelanceRider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ALL');

  // Rider's own availability state
  const [isAvailableToday, setIsAvailableToday] = useState(false);
  const [myServiceZone, setMyServiceZone] = useState('Patia, Infocity, Bhubaneswar & Puri');
  const [myVehicleType, setMyVehicleType] = useState<'EV Scooter' | 'Motorbike' | 'Car' | 'Auto / Loader'>('EV Scooter');
  const [myBaseRate, setMyBaseRate] = useState('150');
  const [myKmRate, setMyKmRate] = useState('15');
  const [myIsNegotiable, setMyIsNegotiable] = useState(true);
  const [myAvailableDate, setMyAvailableDate] = useState('Today');
  const [myTimeSlotFrom, setMyTimeSlotFrom] = useState('08:00 AM');
  const [myTimeSlotTo, setMyTimeSlotTo] = useState('08:00 PM');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  // Profile Detail & Price Discussion Modal State
  const [viewProfileRider, setViewProfileRider] = useState<FreelanceRider | null>(null);
  const [discussionPrice, setDiscussionPrice] = useState<string>('');
  const [discussionNote, setDiscussionNote] = useState<string>('');

  // Hire Task Modal State
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelanceRider | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [pickupAddr, setPickupAddr] = useState('');
  const [dropAddr, setDropAddr] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const [isHiring, setIsHiring] = useState(false);
  const [hireSuccess, setHireSuccess] = useState('');

  const fetchFreelancers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/freelancers?includeOffline=true', { credentials: 'include' });
      if (res.ok) {
        const data: FreelanceRider[] = await res.json();
        const myUserId = String(currentUser.id || (currentUser as any)._id);
        const myProfile = data.find(
          (f: FreelanceRider) => String(f.userId) === myUserId || f.name.toLowerCase() === (currentUser.name || '').toLowerCase()
        );
        if (myProfile) {
          setIsAvailableToday(myProfile.isAvailableToday);
          setMyServiceZone(myProfile.serviceZone || myServiceZone);
          setMyVehicleType(myProfile.vehicleType || myVehicleType);
          setMyBaseRate(String(myProfile.baseRatePerTrip || myBaseRate));
          setMyKmRate(String(myProfile.perKmRate || myKmRate));
          if (myProfile.isNegotiable !== undefined) setMyIsNegotiable(myProfile.isNegotiable);
          if (myProfile.availableDate) setMyAvailableDate(myProfile.availableDate);
          if (myProfile.timeSlotFrom) setMyTimeSlotFrom(myProfile.timeSlotFrom);
          if (myProfile.timeSlotTo) setMyTimeSlotTo(myProfile.timeSlotTo);
        }
        // Filter out offline riders from public directory feed
        setFreelancers(data.filter((f) => f.isAvailableToday));
      }
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const handleToggleMyStatus = async () => {
    setIsSavingStatus(true);
    try {
      const res = await fetch('/api/freelancers/toggle-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isAvailableToday: !isAvailableToday,
          serviceZone: myServiceZone,
          vehicleType: myVehicleType,
          baseRatePerTrip: Number(myBaseRate),
          perKmRate: Number(myKmRate),
          isNegotiable: myIsNegotiable,
          availableDate: myAvailableDate,
          timeSlotFrom: myTimeSlotFrom,
          timeSlotTo: myTimeSlotTo,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setIsAvailableToday(updated.isAvailableToday);
        fetchFreelancers();
      }
    } catch (err) {
      console.error('Error toggling rider availability:', err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleRiderProfileClick = (rider: FreelanceRider) => {
    setViewProfileRider(rider);
    setDiscussionPrice(String(rider.baseRatePerTrip));
    setDiscussionNote('');
  };

  const handleStartPriceNegotiationChat = async (rider: FreelanceRider) => {
    const finalPrice = Number(discussionPrice) || rider.baseRatePerTrip;
    try {
      const res = await fetch('/api/freelancers/discuss-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          freelancerId: rider.id,
          discussionPrice: finalPrice,
          discussionNote,
        }),
      });
      if (res.ok) {
        const matchRide: Ride = await res.json();
        setViewProfileRider(null);
        onOpenChat(matchRide);
      }
    } catch (err) {
      console.error('Error starting price negotiation:', err);
    }
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFreelancer || !taskTitle.trim()) return;

    setIsHiring(true);
    try {
      const res = await fetch('/api/freelancers/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          freelancerId: selectedFreelancer.id,
          taskTitle,
          pickupLocation: pickupAddr,
          dropLocation: dropAddr,
          agreedPrice: Number(agreedPrice || selectedFreelancer.baseRatePerTrip),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHireSuccess(`Task request sent to ${selectedFreelancer.name}! Opening chat...`);
        setTimeout(() => {
          const matchRide: Ride = data.ride || {
            id: `ride_free_${selectedFreelancer.id}`,
            driverName: selectedFreelancer.name,
            driverAvatar: selectedFreelancer.avatarUrl,
            driverRating: selectedFreelancer.rating,
            leavingFrom: pickupAddr || 'Pickup Location',
            goingTo: dropAddr || 'Drop Location',
            date: 'Today',
            time: 'Instant / On-Demand',
            price: Number(agreedPrice || selectedFreelancer.baseRatePerTrip),
            seatsAvailable: 1,
            totalSeats: 1,
            carModel: `${selectedFreelancer.vehicleType} (${selectedFreelancer.vehicleModel})`,
            interests: ['On-Demand Freelance Rider'],
            musicTaste: [],
            carbonSaved: 2.0,
            verifiedDriver: true,
          };
          setSelectedFreelancer(null);
          setHireSuccess('');
          setTaskTitle('');
          onOpenChat(matchRide);
        }, 1000);
      }
    } catch (err) {
      console.error('Error hiring freelancer:', err);
    } finally {
      setIsHiring(false);
    }
  };

  const filteredFreelancers = freelancers.filter((item) => {
    if (selectedCity !== 'ALL' && item.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedVehicle !== 'ALL' && item.vehicleType !== selectedVehicle) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            On-Demand Freelance Riders
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Hire Freelance Riders Free Today ⚡
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-2xl leading-relaxed">
            Need an on-demand rider for local errands, quick parcel pickup, or custom travel? Click any rider profile photo to inspect their full profile or discuss custom pricing!
          </p>
        </div>

        {/* Status & Price Control Card */}
        <div className="p-4 bg-slate-900/95 border border-slate-800 rounded-2xl space-y-3 relative z-10 flex-shrink-0 min-w-[320px] shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-200 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" /> My Freelance Listing & Pricing
            </span>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
              isAvailableToday ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {isAvailableToday ? 'Free Today' : 'Offline'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Base Rate (₹)</label>
              <input
                type="number"
                value={myBaseRate}
                onChange={(e) => setMyBaseRate(e.target.value)}
                placeholder="150"
                className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-emerald-400 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Per KM Rate (₹)</label>
              <input
                type="number"
                value={myKmRate}
                onChange={(e) => setMyKmRate(e.target.value)}
                placeholder="15"
                className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400">Price Negotiation Setting</label>
            <select
              value={myIsNegotiable ? 'yes' : 'no'}
              onChange={(e) => setMyIsNegotiable(e.target.value === 'yes')}
              className="w-full h-8 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-extrabold text-white outline-none focus:border-indigo-500"
            >
              <option value="yes">💬 Negotiable Rate (Allow Price Discussion)</option>
              <option value="no">🔒 Fixed Price (Non-Negotiable)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Date</label>
              <select
                value={myAvailableDate}
                onChange={(e) => setMyAvailableDate(e.target.value)}
                className="w-full h-8 px-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-bold text-white outline-none focus:border-blue-500"
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Weekend">Weekend</option>
                <option value="Full Week">Full Week</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Start</label>
              <select
                value={myTimeSlotFrom}
                onChange={(e) => setMyTimeSlotFrom(e.target.value)}
                className="w-full h-8 px-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-bold text-white outline-none focus:border-blue-500"
              >
                <option value="06:00 AM">06:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">End</label>
              <select
                value={myTimeSlotTo}
                onChange={(e) => setMyTimeSlotTo(e.target.value)}
                className="w-full h-8 px-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-bold text-white outline-none focus:border-blue-500"
              >
                <option value="05:00 PM">05:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
                <option value="09:00 PM">09:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleToggleMyStatus}
            disabled={isSavingStatus}
            className={`w-full h-10 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border ${
              isAvailableToday 
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/30'
            }`}
          >
            {isSavingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                <span>{isAvailableToday ? 'Turn Offline / Update Listing' : "Mark Me Free Today"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Filter Freelance Directory:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Cities (Bhubaneswar, Puri, Cuttack)</option>
            <option value="Bhubaneswar">Bhubaneswar</option>
            <option value="Puri">Puri</option>
            <option value="Cuttack">Cuttack</option>
          </select>

          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="EV Scooter">⚡ EV Scooter</option>
            <option value="Motorbike">🏍️ Motorbike</option>
            <option value="Car">🚗 Car</option>
            <option value="Auto / Loader">🛺 Auto / Loader</option>
          </select>
        </div>
      </div>

      {/* Freelance Riders Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-bold">Loading available freelance riders...</p>
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <Bike className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-black text-slate-800">No active freelance riders available</h4>
          <p className="text-xs text-slate-500 font-semibold">Riders mark themselves "Free Today" when ready. Toggle status above or change filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredFreelancers.map((rider) => {
            const isMyOwnProfile =
              String(rider.userId) === String(currentUser.id || (currentUser as any)._id) ||
              rider.name.toLowerCase() === (currentUser.name || '').toLowerCase();

            return (
              <div key={rider.id} className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between relative overflow-hidden group">
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* Clickable Profile Photo & Header Section */}
                    <div 
                      onClick={() => handleRiderProfileClick(rider)} 
                      className="flex items-center gap-3 cursor-pointer group/avatar relative"
                      title="Click to check full profile & price options"
                    >
                      <div className="relative">
                        <img 
                          src={rider.avatarUrl} 
                          alt={rider.name} 
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md group-hover/avatar:border-blue-600 group-hover/avatar:scale-105 group-hover/avatar:ring-4 group-hover/avatar:ring-blue-500/20 transition-all duration-200" 
                        />
                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-md border border-white" title="Click to view profile">
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-slate-900 group-hover/avatar:text-blue-600 transition-colors flex items-center gap-1.5">
                          {rider.name}
                          {rider.verifiedDriver && <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          {rider.city} · {rider.totalCompletedJobs} jobs done
                          <span className="text-[10px] text-blue-600 font-extrabold underline ml-0.5">(View Profile)</span>
                        </p>
                      </div>
                    </div>
                    
                    <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex-shrink-0">
                      <Star className="h-3.5 w-3.5 fill-current" /> {rider.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                      {rider.vehicleType} ({rider.vehicleModel})
                    </span>
                    
                    {/* Price Negotiation Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                      rider.isNegotiable !== false 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {rider.isNegotiable !== false ? '💬 Price Negotiable' : '🔒 Fixed Rate'}
                    </span>

                    {isMyOwnProfile && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200">
                        Your Listing
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-semibold line-clamp-2 leading-relaxed">
                    "{rider.bio}"
                  </p>

                  <div className="rounded-2xl bg-slate-50 p-3.5 text-xs font-bold text-slate-700 space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl">
                      <span className="flex items-center gap-1 text-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        {rider.availableDate || 'Today'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-800">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        {rider.timeSlotFrom || '08:00 AM'} - {rider.timeSlotTo || '08:00 PM'}
                      </span>
                    </div>

                    <p className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-400">Service Zone:</span>
                      <span className="text-slate-900 truncate max-w-[170px]">{rider.serviceZone}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Trip Base Rate:</span>
                      <span className="flex items-center gap-1.5">
                        <strong className="text-emerald-600 text-sm">₹{rider.baseRatePerTrip}</strong>
                        {rider.isNegotiable !== false ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">Negotiable</span>
                        ) : (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">Fixed</span>
                        )}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-400">Per KM Rate:</span>
                      <span className="text-slate-900">₹{rider.perKmRate} / km</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleRiderProfileClick(rider)}
                    className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Check Profile</span>
                  </button>

                  {isMyOwnProfile ? (
                    <button
                      onClick={() => onNavigateToProfile && onNavigateToProfile()}
                      className="h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedFreelancer(rider);
                        setAgreedPrice(String(rider.baseRatePerTrip));
                      }}
                      className="h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-blue-400/30"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Hire Rider</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FREELANCER PROFILE & PRICE DISCUSSION MODAL */}
      {viewProfileRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 space-y-0">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={viewProfileRider.avatarUrl} 
                    alt={viewProfileRider.name} 
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-blue-500 shadow-xl shadow-blue-500/20" 
                  />
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      {viewProfileRider.name}
                      {viewProfileRider.verifiedDriver && <ShieldCheck className="h-5 w-5 text-emerald-400" />}
                    </h3>
                    <p className="text-xs text-blue-300 font-bold mt-1">
                      {viewProfileRider.vehicleType} ({viewProfileRider.vehicleModel}) · {viewProfileRider.city}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        <Star className="h-3.5 w-3.5 fill-current" /> {viewProfileRider.rating.toFixed(1)} Rating
                      </span>
                      <span className="text-xs font-extrabold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                        {viewProfileRider.totalCompletedJobs} jobs completed
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setViewProfileRider(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full border border-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Bio & Details Grid */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">About Freelancer</h4>
                  <p className="text-xs text-slate-200 font-semibold leading-relaxed">"{viewProfileRider.bio}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Service Zone</span>
                    <strong className="text-white block">{viewProfileRider.serviceZone}</strong>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Available Slot</span>
                    <strong className="text-emerald-400 block">{viewProfileRider.availableDate || 'Today'} ({viewProfileRider.timeSlotFrom} - {viewProfileRider.timeSlotTo})</strong>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Vehicle Registration</span>
                    <strong className="text-slate-200 font-mono block">{viewProfileRider.vehicleNumber || 'OD 02 AB 1234'}</strong>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 font-bold block text-[11px]">Contact Phone</span>
                    <strong className="text-blue-400 font-mono block">📞 +91 {viewProfileRider.phone || '9876543210'}</strong>
                  </div>
                </div>
              </div>

              {/* PRICE DISCUSSION & NEGOTIATION SECTION */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-emerald-400" />
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Price Discussion & Negotiation</h4>
                  </div>
                  
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                    viewProfileRider.isNegotiable !== false 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {viewProfileRider.isNegotiable !== false ? '💬 Price is Negotiable' : '🔒 Fixed Rate'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold">Standard Trip Base Rate</span>
                    <p className="text-xl font-black text-emerald-400 mt-0.5">₹{viewProfileRider.baseRatePerTrip}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold">Per Kilometer Charge</span>
                    <p className="text-xl font-black text-white mt-0.5">₹{viewProfileRider.perKmRate} / km</p>
                  </div>
                </div>

                {viewProfileRider.isNegotiable !== false ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>This rider allows price discussion! You can propose your budget or discuss custom pricing below:</span>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                        Propose / Negotiate Your Budget (₹)
                      </label>
                      <input
                        type="number"
                        value={discussionPrice}
                        onChange={(e) => setDiscussionPrice(e.target.value)}
                        placeholder={String(viewProfileRider.baseRatePerTrip)}
                        className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-black text-emerald-400 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                        Negotiation Note / Special Details (Optional)
                      </label>
                      <input
                        type="text"
                        value={discussionNote}
                        onChange={(e) => setDiscussionNote(e.target.value)}
                        placeholder="e.g. Can do ₹130 for 2 round trips today"
                        className="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <span>This rider has listed a fixed non-negotiable rate for their trip services.</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleStartPriceNegotiationChat(viewProfileRider)}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Discuss Price in Encrypted Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFreelancer(viewProfileRider);
                      setAgreedPrice(discussionPrice || String(viewProfileRider.baseRatePerTrip));
                      setViewProfileRider(null);
                    }}
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Direct Task Hire</span>
                  </button>
                </div>

              </div>

              {/* Redirect to full main profile if viewing own card */}
              {onNavigateToProfile && (String(viewProfileRider.userId) === String(currentUser.id || (currentUser as any)._id) || viewProfileRider.name.toLowerCase() === (currentUser.name || '').toLowerCase()) && (
                <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-200">This is your active freelancer listing profile.</span>
                  <button
                    onClick={() => {
                      setViewProfileRider(null);
                      onNavigateToProfile();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Go to My Profile Section</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* HIRE FREELANCER TASK MODAL */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-6 text-white border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img src={selectedFreelancer.avatarUrl} alt={selectedFreelancer.name} className="h-12 w-12 rounded-xl object-cover border-2 border-blue-500" />
                <div>
                  <h3 className="text-xl font-black text-white">Hire {selectedFreelancer.name}</h3>
                  <p className="text-xs text-blue-400 font-semibold mt-0.5">{selectedFreelancer.vehicleType} · {selectedFreelancer.city}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleHireSubmit} className="p-6 space-y-4">
              {hireSuccess && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-extrabold text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4" /> {hireSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Task Title / Details
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Pickup documents from Patia and deliver to Puri"
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddr}
                  onChange={(e) => setPickupAddr(e.target.value)}
                  placeholder="e.g. Infocity Square, Patia, Bhubaneswar"
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                  Drop Location
                </label>
                <input
                  type="text"
                  required
                  value={dropAddr}
                  onChange={(e) => setDropAddr(e.target.value)}
                  placeholder="e.g. Sanabandhakera, Brahmagiri, Puri"
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Offered Price Rate (₹)
                  </label>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    selectedFreelancer.isNegotiable !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedFreelancer.isNegotiable !== false ? '💬 Price Negotiable' : '🔒 Fixed Rate'}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder={String(selectedFreelancer.baseRatePerTrip)}
                  className="w-full h-12 px-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFreelancer(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-extrabold text-slate-400 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHiring}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isHiring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  <span>Confirm Task & Open Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
