import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, Ride } from '../types';
import { X, MapPin, Navigation, Compass, ShieldCheck, Phone, CheckCircle2, Play, Pause, Zap, Award, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface LiveTrackingModalProps {
  ride: Ride;
  onClose: () => void;
  currentUser: AuthUser;
}

export default function LiveTrackingModal({ ride, onClose, currentUser }: LiveTrackingModalProps) {
  const [status, setStatus] = useState<string>(ride.status || 'ACTIVE');
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // Coordinates (Default to pickup location or Bhubaneswar coords)
  const pickupLat = ride.pickupLocation?.latitude || 20.2961;
  const pickupLng = ride.pickupLocation?.longitude || 85.8245;
  const dropLat = ride.destinationLocation?.latitude || 19.8135;
  const dropLng = ride.destinationLocation?.longitude || 85.8312;

  const [riderPos, setRiderPos] = useState<{ lat: number; lng: number }>({
    lat: pickupLat,
    lng: pickupLng,
  });
  
  const [progressPct, setProgressPct] = useState<number>(0);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [pickupPin, setPickupPin] = useState<string>('4819');
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinVerified, setPinVerified] = useState<boolean>(false);

  const fetchLiveLocation = async () => {
    try {
      const res = await fetch(`/api/rides/${ride.id}/live-location`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsDriver(data.isDriver);
        if (data.status) setStatus(data.status);
        if (data.pickupPin) setPickupPin(data.pickupPin);
        if (data.currentLocation?.latitude && data.currentLocation?.longitude) {
          setRiderPos({
            lat: data.currentLocation.latitude,
            lng: data.currentLocation.longitude,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching live location:', err);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${ride.id}/verify-pickup-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin: inputPin }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('client_picked_up');
        setPinVerified(true);
      } else {
        setPinError(data.message || 'Incorrect PIN');
      }
    } catch (err) {
      setPinError('Failed to verify PIN. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveLocation();
    const interval = setInterval(fetchLiveLocation, 2500);
    return () => clearInterval(interval);
  }, [ride.id]);

  // Clean up simulation timer
  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  const updateLocationOnServer = async (lat: number, lng: number, newStatus?: string) => {
    try {
      await fetch(`/api/rides/${ride.id}/live-location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          status: newStatus,
        }),
      });
      fetchLiveLocation();
    } catch (err) {
      console.error('Error updating live location:', err);
    }
  };

  const handleMarkPickedUp = async () => {
    setLoading(true);
    await updateLocationOnServer(riderPos.lat, riderPos.lng, 'client_picked_up');
    setStatus('client_picked_up');
    setLoading(false);
  };

  const handleCompleteTrip = async () => {
    setLoading(true);
    await updateLocationOnServer(dropLat, dropLng, 'completed');
    setStatus('completed');
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setIsSimulating(false);
    setProgressPct(100);
    setLoading(false);
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      let step = progressPct;
      simulationTimerRef.current = setInterval(() => {
        step += 4;
        if (step >= 100) {
          step = 100;
          if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
          setIsSimulating(false);
          updateLocationOnServer(dropLat, dropLng, 'completed');
        }
        const interpolatedLat = pickupLat + (dropLat - pickupLat) * (step / 100);
        const interpolatedLng = pickupLng + (dropLng - pickupLng) * (step / 100);
        setRiderPos({ lat: interpolatedLat, lng: interpolatedLng });
        setProgressPct(step);
        updateLocationOnServer(interpolatedLat, interpolatedLng, step >= 100 ? 'completed' : 'client_picked_up');
      }, 1500);
    }
  };

  // Calculate SVG map positions (normalized 0 to 100%)
  const svgPickupX = 80;
  const svgPickupY = 220;
  const svgDropX = 420;
  const svgDropY = 80;

  const currentSvgX = svgPickupX + (svgDropX - svgPickupX) * (progressPct / 100);
  const currentSvgY = svgPickupY + (svgDropY - svgPickupY) * (progressPct / 100);

  const getStatusBadge = () => {
    if (status === 'completed' || status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-extrabold shadow-md">
          <CheckCircle2 className="h-4 w-4 text-blue-400" />
          Trip Completed — Safe Arrival 🏁
        </span>
      );
    }
    if (status === 'client_picked_up') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold shadow-md animate-pulse">
          <Zap className="h-4 w-4 text-emerald-400" />
          Client Picked Up — Live GPS Tracking 🚕💨
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold shadow-md">
        <Navigation className="h-4 w-4 text-amber-400 animate-bounce" />
        Rider En Route to Pickup Location
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/90 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
              <Compass className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                Live Rider GPS Tracker
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {ride.leavingFrom} ➔ {ride.goingTo}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status & Rider Info Bar */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={ride.driverAvatar}
                alt={ride.driverName}
                className="h-12 w-12 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md"
              />
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  {ride.driverName}
                  {ride.verifiedDriver && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
                </h4>
                <p className="text-xs font-semibold text-slate-400">{ride.carModel}</p>
              </div>
            </div>

            <div>{getStatusBadge()}</div>
          </div>

          {/* Interactive SVG Live Map Canvas */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/95 overflow-hidden shadow-2xl p-4">
            {/* Map Decorative Grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

            <svg viewBox="0 0 500 300" className="w-full h-64 sm:h-72 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Route Line */}
              <path
                d="M 80 220 Q 250 240, 420 80"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="6"
                strokeDasharray="8 6"
                className="animate-pulse"
              />

              {/* Pickup Pin */}
              <g transform="translate(80, 220)">
                <circle r="16" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
                <circle r="10" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">A</text>
              </g>

              {/* Drop Pin */}
              <g transform="translate(420, 80)">
                <circle r="16" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
                <circle r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">B</text>
              </g>

              {/* Animated Rider Marker */}
              <g transform={`translate(${currentSvgX}, ${currentSvgY})`} className="transition-all duration-700 ease-out">
                <circle r="22" fill="#3b82f6" fillOpacity="0.25" className="animate-ping" />
                <circle r="15" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="3" shadow-lg="true" />
                <text y="4" textAnchor="middle" fontSize="12">🚗</text>
              </g>
            </svg>

            {/* Overlay Map Legend */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-extrabold bg-slate-950/90 border border-slate-800 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <span className="flex items-center gap-1.5 text-blue-400 truncate max-w-[140px]">
                <MapPin className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                Pickup: {ride.leavingFrom}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 truncate max-w-[140px]">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                Drop: {ride.goingTo}
              </span>
            </div>
          </div>

          {/* Location Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold block text-[11px]">Rider GPS Position</span>
              <strong className="text-white font-mono text-xs block mt-0.5">
                {riderPos.lat.toFixed(4)}, {riderPos.lng.toFixed(4)}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold block text-[11px]">Trip Progress</span>
              <strong className="text-emerald-400 font-extrabold text-sm block mt-0.5">
                {progressPct.toFixed(0)}% Completed
              </strong>
            </div>

            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs col-span-2 sm:col-span-1">
              <span className="text-slate-400 font-bold block text-[11px]">Est. Time of Arrival</span>
              <strong className="text-blue-400 font-extrabold text-sm block mt-0.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {status === 'completed' || status === 'COMPLETED' ? 'Arrived' : `${Math.max(1, Math.round(12 * (1 - progressPct / 100)))} mins`}
              </strong>
            </div>
          </div>

          {/* Pickup Verification PIN Box for Client & Rider */}
          {!isDriver ? (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">🔑 Pickup Verification PIN</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Share this 4-digit code with your rider when they arrive.</p>
              </div>
              <div className="bg-amber-500 text-slate-950 font-mono font-black text-2xl px-4 py-1.5 rounded-xl shadow-lg border border-amber-300 tracking-widest">
                {pickupPin}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-400">🔑 Verify Client Pickup PIN</p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Ask the client for their 4-digit Pickup PIN to start transit.</p>
                </div>
                {status === 'client_picked_up' && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Verified ✓
                  </span>
                )}
              </div>

              {status !== 'client_picked_up' && status !== 'completed' && (
                <form onSubmit={handleVerifyPin} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN (e.g. 4819)"
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    className="flex-1 h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || inputPin.length < 4}
                    className="h-11 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                  >
                    Verify & Start Trip
                  </button>
                </form>
              )}
              {pinError && <p className="text-xs font-bold text-red-400">{pinError}</p>}
            </div>
          )}

          {/* Rider Controls Section (If Logged-in User is the Rider/Driver) */}
          {isDriver && (
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" /> Rider Live GPS Controls
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={handleMarkPickedUp}
                  disabled={loading || status === 'client_picked_up'}
                  className={`h-11 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border ${
                    status === 'client_picked_up'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/30'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span>{status === 'client_picked_up' ? 'Client Picked Up' : 'Mark Client Picked Up'}</span>
                </button>

                <button
                  onClick={toggleSimulation}
                  className={`h-11 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border ${
                    isSimulating
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30'
                  }`}
                >
                  {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isSimulating ? 'Pause GPS Simulation' : 'Simulate GPS Drive'}</span>
                </button>

                <button
                  onClick={handleCompleteTrip}
                  disabled={loading || status === 'completed'}
                  className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-indigo-400/30"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complete Trip</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
