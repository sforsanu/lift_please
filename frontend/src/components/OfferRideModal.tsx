import React, { useState } from 'react';
import { X, Car, Calendar, MapPin, Flag, User, Clock } from 'lucide-react';

interface OfferRideModalProps {
  onClose: () => void;
  onSubmit: (rideData: {
    driverName: string;
    leavingFrom: string;
    goingTo: string;
    date: string;
    time: string;
    price: number;
    seatsAvailable: number;
    totalSeats: number;
    carModel: string;
    interests: string[];
    musicTaste: string[];
  }) => Promise<void>;
}

export default function OfferRideModal({ onClose, onSubmit }: OfferRideModalProps) {
  const [driverName, setDriverName] = useState('');
  const [leavingFrom, setLeavingFrom] = useState('');
  const [goingTo, setGoingTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [carModel, setCarModel] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('3');
  const [musicTaste, setMusicTaste] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !leavingFrom || !goingTo || !date || !time) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const interestsArray = interests.split(',').map(s => s.trim()).filter(Boolean);
      const musicArray = musicTaste.split(',').map(s => s.trim()).filter(Boolean);

      await onSubmit({
        driverName,
        leavingFrom,
        goingTo,
        date,
        time,
        price: 0, // Lift campaign is 100% Free Forever
        seatsAvailable: Number(seatsAvailable),
        totalSeats: Number(seatsAvailable) + 1,
        carModel: carModel || "Standard Hybrid",
        interests: interestsArray.length > 0 ? interestsArray : ["Commuting"],
        musicTaste: musicArray.length > 0 ? musicArray : ["Pop"]
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
                placeholder="Alex Mercer"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Leaving From *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="San Francisco, CA"
                  value={leavingFrom}
                  onChange={(e) => setLeavingFrom(e.target.value)}
                  className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Going To *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Flag className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="San Jose, CA"
                  value={goingTo}
                  onChange={(e) => setGoingTo(e.target.value)}
                  className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

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
                  placeholder="08:30"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Car & Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Car Model
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Car className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tesla Model 3 (EV)"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="block w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Seats Available
              </label>
              <select
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(e.target.value)}
                className="block w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
              </select>
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
