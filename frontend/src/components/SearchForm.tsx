import React, { useState } from 'react';
import { MapPin, Flag, Calendar, Search } from 'lucide-react';

interface SearchFormProps {
  onSearch: (filters: { leavingFrom: string; goingTo: string; date: string }) => void;
  isGuest?: boolean;
  onPromptLogin?: () => void;
}

export default function SearchForm({ onSearch, isGuest = false, onPromptLogin }: SearchFormProps) {
  const [leavingFrom, setLeavingFrom] = useState('');
  const [goingTo, setGoingTo] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest && onPromptLogin) {
      onPromptLogin();
      return;
    }
    onSearch({ leavingFrom, goingTo, date });
  };

  const handleInputClick = () => {
    if (isGuest && onPromptLogin) {
      onPromptLogin();
    }
  };

  return (
    <section id="search-section" className="relative py-16 bg-white px-4 sm:px-6 lg:px-8">
      {/* Subtle bottom sheet or rounded stage container */}
      <div className="max-w-2xl mx-auto bg-gray-100 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200/50 relative">
        
        {isGuest && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10 cursor-pointer" onClick={handleInputClick}>
            <div className="bg-brand-blue text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg mb-2 flex items-center space-x-1">
              <span>🔒 Lock</span>
            </div>
            <p className="text-sm font-bold text-gray-800">Sign in to search real-time available carpool pools</p>
            <p className="text-xs text-gray-500 mt-1">Unlock over 50,000 neighborhood journeys now</p>
          </div>
        )}

        <h3 className="text-2xl font-black text-gray-900 mb-6 text-center tracking-tight">
          Where are you heading?
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Leaving From Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">
              Leaving from
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-blue">
                <MapPin className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Start location (e.g. San Francisco)"
                value={leavingFrom}
                onChange={(e) => !isGuest && setLeavingFrom(e.target.value)}
                onClick={handleInputClick}
                readOnly={isGuest}
                className="block w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Going To Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">
              Going to
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-blue">
                <Flag className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Destination (e.g. San Jose)"
                value={goingTo}
                onChange={(e) => !isGuest && setGoingTo(e.target.value)}
                onClick={handleInputClick}
                readOnly={isGuest}
                className="block w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Date Picker Input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pl-1">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-blue">
                <Calendar className="h-5 w-5" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => !isGuest && setDate(e.target.value)}
                onClick={handleInputClick}
                readOnly={isGuest}
                className="block w-full h-14 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Search Action Button */}
          <button
            type="submit"
            className="w-full h-14 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-base rounded-full shadow-md shadow-brand-blue/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </button>

        </form>
      </div>
    </section>
  );
}
