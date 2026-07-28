import React, { useState } from 'react';
import { MapPin, Flag, Calendar, Search, Sparkles } from 'lucide-react';
import type { LocationSelection } from '../types';
import GooglePlacesInput from './GooglePlacesInput';

interface SearchFormProps {
  onSearch: (filters: { pickupLocation: LocationSelection | null; destinationLocation: LocationSelection | null; date: string }) => void;
  isGuest?: boolean;
  onPromptLogin?: () => void;
}

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

  return (
    <section id="search-section" className="relative py-14 px-4 sm:px-6 lg:px-8">
      {/* Container with ambient glow background */}
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-3xl blur-xl opacity-20 animate-pulse-glow"></div>
        
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-7 md:p-9 shadow-2xl border border-slate-200/80">
          
          {isGuest && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px] rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20 cursor-pointer" onClick={handleInputClick}>
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

            {/* Date Picker Input */}
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

            {/* Search Action Button */}
            <button
              type="submit"
              className="w-full h-13 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer border border-blue-400/20"
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

