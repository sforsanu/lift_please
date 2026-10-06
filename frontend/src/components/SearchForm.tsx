import React, { useState } from 'react';
import { MapPin, Flag, Calendar, Search, Sparkles, ArrowUpDown, Navigation } from 'lucide-react';
import type { LocationSelection } from '../types';
import GooglePlacesInput from './GooglePlacesInput';

interface SearchFormProps {
  onSearch: (filters: { pickupLocation: LocationSelection | null; destinationLocation: LocationSelection | null; date: string }) => void;
  isGuest?: boolean;
  onPromptLogin?: () => void;
}

const QUICK_DESTINATIONS = [
  { name: 'Puri, Odisha', lat: 19.8135, lng: 85.8312 },
  { name: 'Bhubaneswar, Odisha', lat: 20.2961, lng: 85.8245 },
  { name: 'Cuttack, Odisha', lat: 20.4625, lng: 85.8828 },
  { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863 },
];

export default function SearchForm({ onSearch, isGuest = false, onPromptLogin }: SearchFormProps) {
  const [pickupLocation, setPickupLocation] = useState<LocationSelection | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationSelection | null>(null);
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest && onPromptLogin) {
      onPromptLogin();
      return;
    }
    onSearch({ pickupLocation, destinationLocation, date });
  };

  const handleInputClick = () => {
    if (isGuest && onPromptLogin) {
      onPromptLogin();
    }
  };

  const handleSwapLocations = () => {
    if (isGuest && onPromptLogin) {
      onPromptLogin();
      return;
    }
    const temp = pickupLocation;
    setPickupLocation(destinationLocation);
    setDestinationLocation(temp);
  };

  const handleQuickDestinationSelect = (dest: { name: string; lat: number; lng: number }) => {
    if (isGuest && onPromptLogin) {
      onPromptLogin();
      return;
    }
    setDestinationLocation({
      address: dest.name,
      latitude: dest.lat,
      longitude: dest.lng,
    });
  };

  return (
    <section id="search-section" className="relative py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-3xl blur-xl opacity-20 animate-pulse-glow"></div>

        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {isGuest && (
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px] rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 cursor-pointer"
              onClick={handleInputClick}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl mb-2 flex items-center space-x-1.5 border border-blue-400/30">
                <span>🔒 Member Access</span>
              </div>
              <p className="text-sm font-extrabold text-white drop-shadow-md">Sign in to search real-time available carpool pools</p>
              <p className="text-xs text-slate-200 mt-1 font-medium">Unlock over 50,000 neighborhood journeys now</p>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-center">
              Where are you heading?
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative space-y-3">
              <GooglePlacesInput
                label="Leaving from"
                placeholder="Choose pickup from Google"
                value={pickupLocation}
                onChange={setPickupLocation}
                icon={MapPin}
                disabled={isGuest}
                required={false}
                onClick={handleInputClick}
              />

              {/* Swap Button */}
              <div className="flex justify-end pr-2 -my-2 relative z-10">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="h-8 px-3 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-600 hover:text-blue-600 transition-all flex items-center space-x-1 shadow-xs cursor-pointer active:scale-95"
                  title="Swap pickup and destination"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Swap</span>
                </button>
              </div>

              <GooglePlacesInput
                label="Going to"
                placeholder="Choose destination from Google"
                value={destinationLocation}
                onChange={setDestinationLocation}
                icon={Flag}
                disabled={isGuest}
                required={false}
                onClick={handleInputClick}
              />
            </div>

            {/* Departure Date Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                Departure Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => !isGuest && setDate(e.target.value)}
                  onClick={handleInputClick}
                  readOnly={isGuest}
                  className="block w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Destination Chips */}
            <div className="pt-1">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Navigation className="h-3 w-3 text-blue-500" />
                <span>Popular Destinations</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => handleQuickDestinationSelect(dest)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      destinationLocation?.address === dest.name
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200'
                    }`}
                  >
                    {dest.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Action Button */}
            <button
              type="submit"
              className="w-full h-13 mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer border border-blue-400/20"
            >
              <Search className="h-4.5 w-4.5" />
              <span>Search Matching Pools</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
