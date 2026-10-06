import React, { useState, useEffect } from 'react';
import {
  Zap,
  Bike,
  MapPin,
  Flag,
  Star,
  ShieldCheck,
  Check,
  Plus,
  MessageSquare,
  Loader2,
  Clock,
  UserCheck,
  Car,
  Phone,
  Filter,
  Calendar,
  X,
  AlertCircle,
  Edit3,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { FreelanceRider, Ride, AuthUser, LocationSelection } from '../types';
import GooglePlacesInput from './GooglePlacesInput';

interface FreelanceRidersSectionProps {
  currentUser: AuthUser;
  onOpenChat: (ride: Ride) => void;
  onNavigateToProfile?: () => void;
}

export default function FreelanceRidersSection({
  currentUser,
  onOpenChat,
  onNavigateToProfile,
}: FreelanceRidersSectionProps) {
  const [freelancers, setFreelancers] = useState<FreelanceRider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ALL');

  // Rider's own availability & rate state
  const [isAvailableToday, setIsAvailableToday] = useState(false);
  const [myServiceZone, setMyServiceZone] = useState('Patia, Infocity, Bhubaneswar & Puri');
  const [serviceZoneLocation, setServiceZoneLocation] = useState<LocationSelection | null>({
    address: 'Patia, Infocity, Bhubaneswar & Puri',
    placeId: 'default_service_zone',
    latitude: 20.3552,
    longitude: 85.8181,
  });
  const [myVehicleType, setMyVehicleType] = useState<'EV Scooter' | 'Motorbike' | 'Car' | 'Auto / Loader'>('EV Scooter');
  const [myBaseRate, setMyBaseRate] = useState('150');
  const [myKmRate, setMyKmRate] = useState('15');
  const [myIsNegotiable, setMyIsNegotiable] = useState(true);
  const [myAvailableDate, setMyAvailableDate] = useState('Today');
  const [myTimeSlotFrom, setMyTimeSlotFrom] = useState('08:00 AM');
  const [myTimeSlotTo, setMyTimeSlotTo] = useState('08:00 PM');
  const [myBio, setMyBio] = useState('Available for express parcel delivery, document drops & local rides. No heavy furniture.');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isRiderSetupModalOpen, setIsRiderSetupModalOpen] = useState(false);
  const [setupSuccessMsg, setSetupSuccessMsg] = useState('');

  // Profile Detail Modal State
  const [viewProfileRider, setViewProfileRider] = useState<FreelanceRider | null>(null);

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
          (f: FreelanceRider) =>
            String(f.userId) === myUserId || f.name.toLowerCase() === (currentUser.name || '').toLowerCase()
        );
        if (myProfile) {
          setIsAvailableToday(myProfile.isAvailableToday);
          const zone = myProfile.serviceZone || myServiceZone;
          setMyServiceZone(zone);
          setServiceZoneLocation({
            address: zone,
            placeId: `zone_${Date.now()}`,
            latitude: 20.2961,
            longitude: 85.8245,
          });
          setMyVehicleType(myProfile.vehicleType || myVehicleType);
          setMyBaseRate(String(myProfile.baseRatePerTrip || myBaseRate));
          setMyKmRate(String(myProfile.perKmRate || myKmRate));
          if (myProfile.isNegotiable !== undefined) setMyIsNegotiable(myProfile.isNegotiable);
          if (myProfile.availableDate) setMyAvailableDate(myProfile.availableDate);
          if (myProfile.availableTimeSlot) {
            const parts = myProfile.availableTimeSlot.split(' - ');
            if (parts[0]) setMyTimeSlotFrom(parts[0]);
            if (parts[1]) setMyTimeSlotTo(parts[1]);
          }
          if (myProfile.bio) setMyBio(myProfile.bio);
        }
        setFreelancers(data);
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

  const handleToggleAvailability = async (targetStatus?: boolean) => {
    setIsSavingStatus(true);
    const nextStatus = targetStatus !== undefined ? targetStatus : !isAvailableToday;
    const finalZone = serviceZoneLocation?.address || myServiceZone;
    try {
      const res = await fetch('/api/freelancers/toggle-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isAvailableToday: nextStatus,
          serviceZone: finalZone,
          vehicleType: myVehicleType,
          baseRatePerTrip: Number(myBaseRate),
          perKmRate: Number(myKmRate),
          isNegotiable: myIsNegotiable,
          availableDate: myAvailableDate,
          timeSlotFrom: myTimeSlotFrom,
          timeSlotTo: myTimeSlotTo,
          availableTimeSlot: `${myTimeSlotFrom} - ${myTimeSlotTo}`,
          bio: myBio,
        }),
      });

      if (res.ok) {
        setIsAvailableToday(nextStatus);
        fetchFreelancers();
      }
    } catch (err) {
      console.error('Error updating availability:', err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveRiderSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStatus(true);
    try {
      await handleToggleAvailability(true);
      setSetupSuccessMsg('Your Freelance Rider Profile & Rates have been posted!');
      setTimeout(() => {
        setIsRiderSetupModalOpen(false);
        setSetupSuccessMsg('');
      }, 1200);
    } catch (err) {
      console.error('Error saving rider setup:', err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFreelancer || !taskTitle.trim() || !pickupAddr.trim() || !dropAddr.trim()) return;

    setIsHiring(true);
    try {
      const matchRide: Ride = {
        id: `freelance_task_${Date.now()}`,
        driverName: selectedFreelancer.name,
        driverAvatar: selectedFreelancer.avatarUrl,
        driverRating: selectedFreelancer.rating || 4.9,
        leavingFrom: pickupAddr,
        goingTo: dropAddr,
        date: 'Today',
        time: 'Asap',
        price: Number(agreedPrice) || selectedFreelancer.baseRatePerTrip || 150,
        seatsAvailable: 1,
        totalSeats: 1,
        carModel: `${selectedFreelancer.vehicleType} Carry`,
        interests: ['Freelance Rider Task', taskTitle],
        musicTaste: [],
        carbonSaved: 2.5,
        verifiedDriver: selectedFreelancer.verifiedRider,
      };

      setHireSuccess('Rider hired successfully! Opening direct chat panel...');
      setTimeout(() => {
        setSelectedFreelancer(null);
        setHireSuccess('');
        onOpenChat(matchRide);
      }, 1200);
    } catch (err) {
      console.error('Error hiring freelancer:', err);
    } finally {
      setIsHiring(false);
    }
  };

  const filteredFreelancers = freelancers.filter((f) => {
    if (selectedCity !== 'ALL' && !f.city?.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (selectedVehicle !== 'ALL' && f.vehicleType !== selectedVehicle) return false;
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Freelance Rider Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white md:text-4xl">Hire Local Riders</h1>
          <p className="max-w-xl text-xs sm:text-sm font-semibold text-slate-300">
            Connect directly with verified EV and bike riders for instant errands, parcel delivery, or personal transport.
          </p>
        </div>

        {/* Self Availability & Setup Box */}
        <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              My Rider Status
            </span>
            <button
              onClick={() => handleToggleAvailability()}
              disabled={isSavingStatus}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-xs ${
                isAvailableToday
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {isSavingStatus ? 'Saving...' : isAvailableToday ? '● Available Today' : '○ Offline'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {isAvailableToday
              ? 'You are listed as active on the rider marketplace.'
              : 'Click "Available Today" or edit rates below to post yourself.'}
          </p>
          <button
            onClick={() => setIsRiderSetupModalOpen(true)}
            className="w-full h-9 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-extrabold transition-all flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Post / Edit My Rates & Service Zone</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Cities</option>
            <option value="Bhubaneswar">Bhubaneswar</option>
            <option value="Puri">Puri</option>
            <option value="Cuttack">Cuttack</option>
          </select>

          {/* Vehicle Filter */}
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Vehicles</option>
            <option value="EV Scooter">EV Scooter ⚡</option>
            <option value="Motorbike">Motorbike 🏍️</option>
            <option value="Car">Car 🚗</option>
            <option value="Auto / Loader">Auto / Loader 🛺</option>
          </select>
        </div>
      </div>

      {/* Riders Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl shimmer-bg border border-slate-200" />
          ))}
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚡
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No riders match these filters</h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 max-w-md mx-auto">
              Try switching filters back to "All Cities" or "All Vehicles".
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFreelancers.map((rider) => (
            <div
              key={rider.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rider Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.avatarUrl}
                      alt={rider.name}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-black text-slate-900">{rider.name}</h3>
                        {rider.verifiedDriver && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500" title="Verified Rider" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500">{rider.vehicleType}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      rider.isAvailableToday
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {rider.isAvailableToday ? 'Available' : 'Offline'}
                  </span>
                </div>

                {/* Rates & Stats Grid */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs font-bold mb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Base Rate</p>
                    <p className="text-sm font-black text-slate-900">₹{rider.baseRatePerTrip}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Per Km</p>
                    <p className="text-sm font-black text-slate-900">₹{rider.perKmRate}/km</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Rating</p>
                    <p className="text-xs font-black text-amber-600 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                      {(rider.rating || 5).toFixed(1)} ({rider.completedTasks || rider.totalCompletedJobs || 1} tasks)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Negotiable</p>
                    <p className="text-xs font-bold text-emerald-600">
                      {rider.isNegotiable ? 'Yes ✓' : 'Fixed Rate'}
                    </p>
                  </div>
                </div>

                {/* Service Zone & Schedule */}
                <div className="space-y-1.5 mb-3 text-xs">
                  <p className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{rider.serviceZone}</span>
                  </p>

                  <p className="font-semibold text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{rider.availableDate || 'Today'} • {rider.timeSlotFrom || rider.availableTimeSlot || '08:00 AM - 08:00 PM'}</span>
                  </p>
                </div>

                {/* Rider Bio / Guidelines */}
                {rider.bio && (
                  <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100/80 text-[11px] font-medium text-slate-600 line-clamp-2 italic">
                    "{rider.bio}"
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewProfileRider(rider)}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-700 transition-all cursor-pointer"
                >
                  View Details
                </button>

                <button
                  onClick={() => {
                    setSelectedFreelancer(rider);
                    setAgreedPrice(String(rider.baseRatePerTrip || 150));
                  }}
                  className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1 cursor-pointer active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Hire Rider</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Post / Edit My Rider Profile & Rates with Google Places Autocomplete */}
      {isRiderSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative my-auto max-h-[90vh] flex flex-col">
            <button
              onClick={() => setIsRiderSetupModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5 flex-shrink-0">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Post Yourself as Freelance Rider</h3>
                <p className="text-xs font-semibold text-slate-500">Configure your vehicle type, rates, schedule & guidelines</p>
              </div>
            </div>

            {setupSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{setupSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRiderSetup} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <select
                  value={myVehicleType}
                  onChange={(e) => setMyVehicleType(e.target.value as any)}
                  className="block w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="EV Scooter">EV Scooter ⚡</option>
                  <option value="Motorbike">Motorbike 🏍️</option>
                  <option value="Car">Car 🚗</option>
                  <option value="Auto / Loader">Auto / Loader 🛺</option>
                </select>
              </div>

              {/* Available Date & Time Slot Input Group */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    Available Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Today, Tomorrow, or 2026-09-15"
                    value={myAvailableDate}
                    onChange={(e) => setMyAvailableDate(e.target.value)}
                    className="block w-full h-11 px-3.5 bg-white border border-emerald-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      Time From
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 08:00 AM"
                      value={myTimeSlotFrom}
                      onChange={(e) => setMyTimeSlotFrom(e.target.value)}
                      className="block w-full h-11 px-3 bg-white border border-emerald-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      Time To
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 08:00 PM"
                      value={myTimeSlotTo}
                      onChange={(e) => setMyTimeSlotTo(e.target.value)}
                      className="block w-full h-11 px-3 bg-white border border-emerald-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Base Rate per Trip (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={myBaseRate}
                    onChange={(e) => setMyBaseRate(e.target.value)}
                    className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Per Km Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={myKmRate}
                    onChange={(e) => setMyKmRate(e.target.value)}
                    className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Google Places Autocomplete Input for Operating Service Zone */}
              <GooglePlacesInput
                label="Operating Service Zone / Areas"
                placeholder="Type landmark, street or city (e.g. Vani Vihar, Patia)"
                value={serviceZoneLocation}
                onChange={(loc) => {
                  setServiceZoneLocation(loc);
                  if (loc) {
                    setMyServiceZone(loc.address);
                  }
                }}
                icon={MapPin}
                compact={true}
                required={true}
              />

              {/* Rider Bio & Instructions (Do's & Don'ts) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                  Rider Bio & Services (What you accept & decline)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention what tasks you accept and don't accept (e.g. ✅ Urgent document drops, parcel delivery, grocery run. ❌ No heavy furniture, illegal items, or pets)."
                  value={myBio}
                  onChange={(e) => setMyBio(e.target.value)}
                  className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
                />
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                  Mention your accepted tasks and any items you decline.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-extrabold text-slate-700">Are rates negotiable?</span>
                <button
                  type="button"
                  onClick={() => setMyIsNegotiable(!myIsNegotiable)}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    myIsNegotiable ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {myIsNegotiable ? 'Yes ✓' : 'Fixed'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingStatus}
                className="w-full h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:bg-slate-400 active:scale-95"
              >
                {isSavingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save & Post Myself as Available Rider</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hire Modal */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative my-auto">
            <button
              onClick={() => setSelectedFreelancer(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <img
                src={selectedFreelancer.avatarUrl}
                alt={selectedFreelancer.name}
                className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900">Hire {selectedFreelancer.name}</h3>
                <p className="text-xs font-semibold text-slate-500">{selectedFreelancer.vehicleType} Rider</p>
              </div>
            </div>

            {hireSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>{hireSuccess}</span>
              </div>
            )}

            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Task Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Express document delivery or personal pickup"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patia Square, Bhubaneswar"
                  value={pickupAddr}
                  onChange={(e) => setPickupAddr(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Destination / Drop Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Canteen, Bhubaneswar"
                  value={dropAddr}
                  onChange={(e) => setDropAddr(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Agreed Rate (₹)
                </label>
                <input
                  type="number"
                  required
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isHiring}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:bg-slate-400 active:scale-95"
              >
                {isHiring ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Confirm Hire & Start Direct Chat</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {viewProfileRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative my-auto">
            <button
              onClick={() => setViewProfileRider(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src={viewProfileRider.avatarUrl}
                alt={viewProfileRider.name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500"
              />
              <div>
                <h3 className="text-xl font-black text-slate-900">{viewProfileRider.name}</h3>
                <p className="text-xs font-semibold text-slate-500">{viewProfileRider.vehicleType} Rider</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                    {(viewProfileRider.rating || 5).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {viewProfileRider.completedTasks || viewProfileRider.totalCompletedJobs || 1} Tasks
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs font-bold text-slate-700 mb-4">
              <p><span className="text-slate-400">Service Zone:</span> {viewProfileRider.serviceZone}</p>
              <p><span className="text-slate-400">Base Rate:</span> ₹{viewProfileRider.baseRatePerTrip}/trip</p>
              <p><span className="text-slate-400">Per Km Rate:</span> ₹{viewProfileRider.perKmRate}/km</p>
              <p><span className="text-slate-400">Available Date:</span> {viewProfileRider.availableDate || 'Today'}</p>
              <p><span className="text-slate-400">Time Slot:</span> {viewProfileRider.availableTimeSlot || `${viewProfileRider.timeSlotFrom || '08:00 AM'} - ${viewProfileRider.timeSlotTo || '08:00 PM'}`}</p>
              {viewProfileRider.bio && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Rider Guidelines (Do's & Don'ts):</p>
                  <p className="text-xs font-normal text-slate-800 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed italic">
                    "{viewProfileRider.bio}"
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const targetRider = viewProfileRider;
                setViewProfileRider(null);
                setSelectedFreelancer(targetRider);
                setAgreedPrice(String(targetRider.baseRatePerTrip || 150));
              }}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Proceed to Hire Rider</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
