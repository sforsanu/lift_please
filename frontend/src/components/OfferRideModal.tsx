import React, { useState } from 'react';
import { X, Car, Calendar, MapPin, Flag, User, Clock, Bike, Zap, Shield, Palette, Navigation, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { LocationSelection } from '../types';
import GooglePlacesInput from './GooglePlacesInput';
import { calculateDistanceKm } from '../utils/googlePlaces';

interface OfferRideModalProps {
  onClose: () => void;
  onSubmit: (rideData: {
    driverName: string;
    pickupLocation: LocationSelection;
    destinationLocation: LocationSelection;
    date: string;
    time: string;
    price: number;
    seatsAvailable: number;
    totalSeats: number;
    carModel: string;
    vehicleType?: 'car' | 'bike' | 'ev';
    vehicleModel?: string;
    vehicleNumber?: string;
    vehicleColor?: string;
    interests: string[];
    musicTaste: string[];
  }) => Promise<void>;
}

const VEHICLE_PRESETS = {
  car: ['Toyota Prius', 'Tesla Model 3', 'Hyundai Creta', 'Honda City', 'Maruti Swift', 'Other Car Model...'],
  bike: ['Royal Enfield Classic 350', 'Honda Shine', 'Yamaha FZ', 'TVS Apache', 'Hero Splendor', 'Other Bike Model...'],
  ev: ['Tesla Model Y', 'Tata Nexon EV', 'MG ZS EV', 'Ather 450X', 'Ola S1 Pro', 'Other EV Model...'],
};

export default function OfferRideModal({ onClose, onSubmit }: OfferRideModalProps) {
  const [driverName, setDriverName] = useState('');
  const [pickupLocation, setPickupLocation] = useState<LocationSelection | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationSelection | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Vehicle Details state
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'ev'>('car');
  const [selectedModelPreset, setSelectedModelPreset] = useState<string>('Toyota Prius');
  const [customModel, setCustomModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  const [seatsAvailable, setSeatsAvailable] = useState('3');
  const [musicTaste, setMusicTaste] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invalidField, setInvalidField] = useState<'driverName' | 'pickupLocation' | 'destinationLocation' | 'date' | 'time' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInvalidField(null);

    if (!driverName.trim()) {
      setInvalidField('driverName');
      setError('Please enter your Full Name.');
      return;
    }

    if (!pickupLocation || !pickupLocation.address) {
      setInvalidField('pickupLocation');
      setError('Please select a valid "Leaving From" pickup location from suggestions or GPS.');
      return;
    }

    if (!destinationLocation || !destinationLocation.address) {
      setInvalidField('destinationLocation');
      setError('Please select a valid "Going To" destination location from suggestions or GPS.');
      return;
    }

    if (!date) {
      setInvalidField('date');
      setError('Please select a valid Departure Date.');
      return;
    }

    if (!time) {
      setInvalidField('time');
      setError('Please select a valid Departure Time.');
      return;
    }

    setLoading(true);

    try {
      const interestsArray = interests.split(',').map(s => s.trim()).filter(Boolean);
      const musicArray = musicTaste.split(',').map(s => s.trim()).filter(Boolean);

      const finalModel = selectedModelPreset.startsWith('Other') || customModel
        ? (customModel.trim() || 'Custom Vehicle')
        : selectedModelPreset;

      await onSubmit({
        driverName: driverName.trim(),
        pickupLocation,
        destinationLocation,
        date,
        time,
        price: 0, // Lift campaign is 100% Free Forever
        seatsAvailable: Number(seatsAvailable),
        totalSeats: Number(seatsAvailable) + 1,
        carModel: finalModel,
        vehicleType,
        vehicleModel: finalModel,
        vehicleNumber: vehicleNumber.trim() || undefined,
        vehicleColor: vehicleColor.trim() || undefined,
        interests: interestsArray.length > 0 ? interestsArray : ['Commuting'],
        musicTaste: musicArray.length > 0 ? musicArray : ['Pop']
      });

      onClose(); // Only close on Clean Success!
    } catch (err: any) {
      console.error('Error in OfferRideModal submit:', err);
      setError(err.message || 'Failed to list trip. Please check field inputs.');
      if (err.message && err.message.toLowerCase().includes('destination')) {
        setInvalidField('destinationLocation');
      } else if (err.message && err.message.toLowerCase().includes('pickup')) {
        setInvalidField('pickupLocation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-400">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">List a Trip</h3>
              <p className="text-xs font-semibold text-slate-300">Share your journey with community co-travelers</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Detailed Error Banner */}
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-2xl text-xs font-bold text-rose-800 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-black text-rose-950">Action Required to Post Trip</p>
                <p className="text-[11px] leading-relaxed text-rose-800">{error}</p>
                <p className="text-[10px] text-rose-600 font-extrabold italic">Your filled form data is preserved below. Update the highlighted field and click "List Trip Now".</p>
              </div>
            </div>
          )}

          {/* Driver Name */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Your Full Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Nishikanta Nayak"
                value={driverName}
                onChange={(e) => {
                  setDriverName(e.target.value);
                  if (invalidField === 'driverName') setInvalidField(null);
                }}
                className={`block w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all ${
                  invalidField === 'driverName' 
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' 
                    : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                }`}
              />
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={invalidField === 'pickupLocation' ? 'p-1 border border-rose-400 bg-rose-50/30 rounded-2xl' : ''}>
              <GooglePlacesInput
                label="Leaving From *"
                placeholder="e.g. Bhubaneswar"
                value={pickupLocation}
                onChange={(loc) => {
                  setPickupLocation(loc);
                  if (invalidField === 'pickupLocation') setInvalidField(null);
                }}
                icon={MapPin}
                compact
              />
            </div>

            <div className={invalidField === 'destinationLocation' ? 'p-1 border border-rose-400 bg-rose-50/30 rounded-2xl' : ''}>
              <GooglePlacesInput
                label="Going To *"
                placeholder="e.g. Puri"
                value={destinationLocation}
                onChange={(loc) => {
                  setDestinationLocation(loc);
                  if (invalidField === 'destinationLocation') setInvalidField(null);
                }}
                icon={Flag}
                compact
              />
            </div>
          </div>

          {/* Distance Preview Badge */}
          {pickupLocation && destinationLocation && (
            <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Estimated Route Distance</p>
                  <p className="text-sm font-black text-blue-900">
                    {calculateDistanceKm(pickupLocation, destinationLocation)} km direct corridor
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
                Direct Route
              </span>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Departure Date *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (invalidField === 'date') setInvalidField(null);
                  }}
                  className={`block w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none transition-all ${
                    invalidField === 'date'
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Departure Time *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Clock className="h-4 w-4" />
                </span>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (invalidField === 'time') setInvalidField(null);
                  }}
                  className={`block w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 outline-none transition-all ${
                    invalidField === 'time'
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="border border-slate-200 bg-slate-50/80 p-4.5 rounded-2xl space-y-3.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Car className="h-4 w-4 text-blue-600" />
              <span>Vehicle Details</span>
            </label>

            {/* Vehicle Category Selectors */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
                Vehicle Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('car');
                    setSelectedModelPreset(VEHICLE_PRESETS.car[0]);
                  }}
                  className={`h-11 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    vehicleType === 'car'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Car className="h-4 w-4" />
                  <span>Car</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('bike');
                    setSelectedModelPreset(VEHICLE_PRESETS.bike[0]);
                    setSeatsAvailable('1');
                  }}
                  className={`h-11 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    vehicleType === 'bike'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Bike className="h-4 w-4" />
                  <span>Bike</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('ev');
                    setSelectedModelPreset(VEHICLE_PRESETS.ev[0]);
                  }}
                  className={`h-11 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    vehicleType === 'ev'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  <span>Electric</span>
                </button>
              </div>
            </div>

            {/* Vehicle Model Dropdown + Custom Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
                  Vehicle Model *
                </label>
                <select
                  value={selectedModelPreset}
                  onChange={(e) => setSelectedModelPreset(e.target.value)}
                  className="block w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {VEHICLE_PRESETS[vehicleType].map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedModelPreset.startsWith('Other') || customModel) ? (
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
                    Custom Model Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Honda Civic"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="block w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1">
                    Seats Available
                  </label>
                  <select
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(e.target.value)}
                    className="block w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="1">1 Seat</option>
                    {vehicleType !== 'bike' && (
                      <>
                        <option value="2">2 Seats</option>
                        <option value="3">3 Seats</option>
                        <option value="4">4 Seats</option>
                        <option value="5">5 Seats</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Additional Vehicle Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1 flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-slate-400" />
                  <span>License Plate No. (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. OD 02 AB 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="block w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 mb-1 flex items-center space-x-1">
                  <Palette className="h-3 w-3 text-slate-400" />
                  <span>Vehicle Color (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metallic Black"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="block w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Tech, Hiking, Coffee, Outdoors"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="block w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Music Tastes (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Indie Folk, Jazz, Synthwave"
                value={musicTaste}
                onChange={(e) => setMusicTaste(e.target.value)}
                className="block w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-2xl flex items-center space-x-3 border border-emerald-200">
            <span className="text-xl">🌱</span>
            <p className="text-[11px] text-emerald-800 font-extrabold leading-relaxed">
              <strong>Lift Zero-Cost Community:</strong> Trips listed here are 100% free to support zero-emissions carpooling. Co-travelers share company and positive vibes!
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 active:scale-95 cursor-pointer border border-blue-400/30"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Publishing Ride to Registry...</span>
              </>
            ) : (
              <span>Publish Trip to Community Registry ⚡</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
