import React, { useState } from 'react';
import { X, Car, Calendar, MapPin, Flag, User, Clock, Bike, Zap, Shield, Palette, Navigation } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !pickupLocation || !destinationLocation || !date || !time) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const interestsArray = interests.split(',').map(s => s.trim()).filter(Boolean);
      const musicArray = musicTaste.split(',').map(s => s.trim()).filter(Boolean);

      const finalModel = selectedModelPreset.startsWith('Other') || customModel
        ? (customModel.trim() || 'Custom Vehicle')
        : selectedModelPreset;

      await onSubmit({
        driverName,
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

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to list trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-brand-blue" />
            <h3 className="font-extrabold text-lg text-gray-900">List a Trip</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-red-50 border-l-4 border-brand-red p-3 rounded-r-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Driver Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Your Full Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Nishikanta Nayak"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GooglePlacesInput
              label="Leaving From *"
              placeholder="e.g. Bhubaneswar"
              value={pickupLocation}
              onChange={setPickupLocation}
              icon={MapPin}
              compact
            />

            <GooglePlacesInput
              label="Going To *"
              placeholder="e.g. Puri"
              value={destinationLocation}
              onChange={setDestinationLocation}
              icon={Flag}
              compact
            />
          </div>

          {/* Distance Preview Badge */}
          {pickupLocation && destinationLocation && (
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-brand-blue text-white rounded-xl">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Estimated Trip Distance</p>
                  <p className="text-sm font-extrabold text-brand-blue">
                    {calculateDistanceKm(pickupLocation, destinationLocation)} km total route
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-green bg-emerald-100/60 px-2.5 py-1 rounded-full border border-emerald-200">
                Direct Route
              </span>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Departure Date *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Departure Time *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Clock className="h-4 w-4" />
                </span>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Section */}
          <div className="border border-gray-100 bg-gray-50/70 p-4 rounded-2xl space-y-3">
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Car className="h-4 w-4 text-brand-blue" />
              <span>Vehicle Details</span>
            </label>

            {/* Vehicle Type Tabs / Selector */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Vehicle Category *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('car');
                    setSelectedModelPreset(VEHICLE_PRESETS.car[0]);
                  }}
                  className={`h-10 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    vehicleType === 'car'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Car className="h-3.5 w-3.5" />
                  <span>Car</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('bike');
                    setSelectedModelPreset(VEHICLE_PRESETS.bike[0]);
                    setSeatsAvailable('1');
                  }}
                  className={`h-10 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    vehicleType === 'bike'
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Bike className="h-3.5 w-3.5" />
                  <span>Bike</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVehicleType('ev');
                    setSelectedModelPreset(VEHICLE_PRESETS.ev[0]);
                  }}
                  className={`h-10 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    vehicleType === 'ev'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>Electric</span>
                </button>
              </div>
            </div>

            {/* Vehicle Model Dropdown + Custom Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  Vehicle Model *
                </label>
                <select
                  value={selectedModelPreset}
                  onChange={(e) => setSelectedModelPreset(e.target.value)}
                  className="block w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-blue"
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
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Custom Model Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Honda Civic"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="block w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Seats Available
                  </label>
                  <select
                    value={seatsAvailable}
                    onChange={(e) => setSeatsAvailable(e.target.value)}
                    className="block w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-blue"
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

            {/* Additional Vehicle Specs (Registration Plate & Color) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-gray-400" />
                  <span>License Plate No. (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. OD 02 AB 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="block w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 flex items-center space-x-1">
                  <Palette className="h-3 w-3 text-gray-400" />
                  <span>Vehicle Color (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metallic Black"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="block w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Tags (Music & Interests) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Interests (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Tech, Hiking, Coffee, Outdoors"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="block w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Music Tastes (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Indie Folk, Jazz, Synthwave"
              value={musicTaste}
              onChange={(e) => setMusicTaste(e.target.value)}
              className="block w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
            />
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl flex items-center space-x-2.5 border border-emerald-200">
            <span className="text-lg">🌱</span>
            <p className="text-[11px] text-[#00732c] font-semibold leading-relaxed">
              <strong>Lift Community Commitment:</strong> Trips listed here are 100% free to support zero-emissions carpooling. Co-travelers only share company and positive vibes!
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400 active:scale-95 cursor-pointer"
          >
            {loading ? 'Publishing...' : 'List Trip Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

