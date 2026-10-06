import React, { useState } from 'react';
import {
  X,
  Car,
  Calendar,
  MapPin,
  Flag,
  User,
  Clock,
  Bike,
  Zap,
  Shield,
  Palette,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check,
  Sparkles,
  Users,
} from 'lucide-react';
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

const STEPS = [
  { step: 1, title: 'Route', desc: 'Pickup & Destination' },
  { step: 2, title: 'Schedule', desc: 'Date & Time' },
  { step: 3, title: 'Vehicle', desc: 'Type & Specs' },
  { step: 4, title: 'Seats', desc: 'Capacity & Vibe' },
  { step: 5, title: 'Review', desc: 'Confirm & Publish' },
];

export default function OfferRideModal({ onClose, onSubmit }: OfferRideModalProps) {
  const [step, setStep] = useState<number>(1);
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

  const calculatedDistance =
    pickupLocation && destinationLocation
      ? calculateDistanceKm(
          pickupLocation.latitude,
          pickupLocation.longitude,
          destinationLocation.latitude,
          destinationLocation.longitude
        )
      : null;

  const validateStep = (currentStep: number): boolean => {
    setError('');

    if (currentStep === 1) {
      if (!driverName.trim()) {
        setError('Please enter your Full Name.');
        return false;
      }
      if (!pickupLocation || !pickupLocation.address) {
        setError('Please select a valid "Leaving From" pickup location.');
        return false;
      }
      if (!destinationLocation || !destinationLocation.address) {
        setError('Please select a valid "Going To" destination location.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!date) {
        setError('Please select a Departure Date.');
        return false;
      }
      if (!time) {
        setError('Please select a Departure Time.');
        return false;
      }
    }

    if (currentStep === 3) {
      if (selectedModelPreset.startsWith('Other') && !customModel.trim()) {
        setError('Please enter your custom vehicle model name.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      const interestsArray = interests.split(',').map((s) => s.trim()).filter(Boolean);
      const musicArray = musicTaste.split(',').map((s) => s.trim()).filter(Boolean);

      const finalModel =
        selectedModelPreset.startsWith('Other') || customModel
          ? customModel.trim() || 'Custom Vehicle'
          : selectedModelPreset;

      await onSubmit({
        driverName: driverName.trim(),
        pickupLocation: pickupLocation!,
        destinationLocation: destinationLocation!,
        date,
        time,
        price: 0,
        seatsAvailable: Number(seatsAvailable),
        totalSeats: Number(seatsAvailable) + 1,
        carModel: finalModel,
        vehicleType,
        vehicleModel: finalModel,
        vehicleNumber: vehicleNumber.trim() || undefined,
        vehicleColor: vehicleColor.trim() || undefined,
        interests: interestsArray.length > 0 ? interestsArray : ['Commuting'],
        musicTaste: musicArray.length > 0 ? musicArray : ['Pop'],
      });

      onClose();
    } catch (err: any) {
      console.error('Error in OfferRideModal submit:', err);
      setError(err?.message || 'Server error occurred while creating ride.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Offer a Shared Ride</h3>
            <p className="text-xs font-semibold text-slate-500">Step {step} of 5 — {STEPS[step - 1].desc}</p>
          </div>
        </div>

        {/* Multi-step Progress Indicator Bar */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {STEPS.map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step < step) setStep(s.step);
                }}
                className={`h-2 rounded-full transition-all ${
                  s.step === step
                    ? 'bg-blue-600 shadow-xs'
                    : s.step < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-100'
                }`}
                title={s.title}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-0.5">
            <span>Route</span>
            <span>Time</span>
            <span>Vehicle</span>
            <span>Seats</span>
            <span>Review</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: ROUTE & DRIVER */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Driver Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name (e.g. Alex Mercer)"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
              </div>

              <GooglePlacesInput
                label="Leaving From (Pickup)"
                placeholder="Search pickup point from Google"
                value={pickupLocation}
                onChange={setPickupLocation}
                icon={MapPin}
                required={true}
              />

              <GooglePlacesInput
                label="Going To (Destination)"
                placeholder="Search destination point from Google"
                value={destinationLocation}
                onChange={setDestinationLocation}
                icon={Flag}
                required={true}
              />

              {calculatedDistance && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between text-xs font-extrabold text-blue-700">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    Estimated Route Distance:
                  </span>
                  <span className="text-sm font-black">{calculatedDistance.toFixed(1)} km</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Departure Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-blue-600 pointer-events-none">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Departure Time
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-blue-600 pointer-events-none">
                    <Clock className="h-4 w-4" />
                  </span>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VEHICLE SPECS */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'car', label: 'Car', icon: Car },
                    { id: 'ev', label: 'EV', icon: Zap },
                    { id: 'bike', label: 'Bike', icon: Bike },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = vehicleType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const type = item.id as 'car' | 'bike' | 'ev';
                          setVehicleType(type);
                          setSelectedModelPreset(VEHICLE_PRESETS[type][0]);
                        }}
                        className={`h-11 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold transition-all border cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Vehicle Model
                </label>
                <select
                  value={selectedModelPreset}
                  onChange={(e) => setSelectedModelPreset(e.target.value)}
                  className="block w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all cursor-pointer"
                >
                  {VEHICLE_PRESETS[vehicleType].map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </div>

              {selectedModelPreset.startsWith('Other') && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                    Custom Model Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BMW i4 or Mahindra XUV400"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                    License Number (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Shield className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="OD 02 EV 9999"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      className="block w-full h-12 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                    Vehicle Color (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <Palette className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Pearl White"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      className="block w-full h-12 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SEATS & VIBE */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Seats Available for Co-Travelers
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['1', '2', '3', '4', '5', '6'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSeatsAvailable(num)}
                      className={`h-11 rounded-xl text-sm font-extrabold border transition-all cursor-pointer ${
                        seatsAvailable === num
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Interests / Topics (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Tech, Sustainability, Hiking, Startups"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                  Music Taste (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Indie Rock, Synthwave, Lofi Beats"
                  value={musicTaste}
                  onChange={(e) => setMusicTaste(e.target.value)}
                  className="block w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">Trip Summary Review</p>
                <div className="text-xs font-bold text-slate-800 space-y-2">
                  <p className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Driver:</span>
                    <span>{driverName}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Leaving From:</span>
                    <span className="truncate max-w-[200px]">{pickupLocation?.address}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Going To:</span>
                    <span className="truncate max-w-[200px]">{destinationLocation?.address}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Departure:</span>
                    <span>{date} at {time}</span>
                  </p>
                  <p className="flex justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-slate-500">Vehicle:</span>
                    <span>{selectedModelPreset.startsWith('Other') ? customModel : selectedModelPreset} ({vehicleType.toUpperCase()})</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Available Seats:</span>
                    <span>{seatsAvailable} Seats (Free Community Ride)</span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Zero commission fee — 100% free community carpool initiative.</span>
              </div>
            </div>
          )}

          {/* Navigation Step Actions */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1 cursor-pointer active:scale-95 ml-auto"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:bg-slate-400 ml-auto active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Publish Ride Pool</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
