import React, { useState } from 'react';
import { Car, Menu, X, Leaf, LogOut, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  onFindRideClick: () => void;
  onListTripClick: () => void;
  onShowStatsClick: () => void;
  activeTab: 'home' | 'search' | 'stats';
  currentUser?: { email: string } | null;
  onSignInClick?: () => void;
  onSignOut?: () => void;
}

export default function Navbar({ 
  onFindRideClick, 
  onListTripClick, 
  onShowStatsClick, 
  activeTab,
  currentUser,
  onSignInClick,
  onSignOut
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo with Glow */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Lift <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-blue-400/80">Green Commute</span>
            </div>
          </div>

          {/* Desktop Navigation Pills */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-full border border-slate-800/80 shadow-inner">
            <button 
              onClick={onFindRideClick}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'search' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Find a Ride
            </button>
            <button 
              onClick={onListTripClick}
              className="px-4 py-2 rounded-full font-bold text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              Offer a Ride
            </button>
            <button 
              onClick={onShowStatsClick}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'stats' 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                  : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60'
              }`}
            >
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span>Carbon Dashboard</span>
            </button>
          </div>

          {/* CTA & User Profile Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 leading-tight">Member</p>
                  <p className="text-[11px] text-slate-300 font-semibold leading-none max-w-[130px] truncate" title={currentUser.email}>
                    {currentUser.email}
                  </p>
                </div>
                <button 
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800 transition-all cursor-pointer ml-1"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onSignInClick}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2 rounded-full font-extrabold text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer border border-blue-400/30"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 py-4 px-4 space-y-3">
          <button
            onClick={() => {
              onFindRideClick();
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900"
          >
            Find a Ride
          </button>
          <button
            onClick={() => {
              onListTripClick();
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900"
          >
            Offer a Ride
          </button>
          <button
            onClick={() => {
              onShowStatsClick();
              setIsOpen(false);
            }}
            className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-200 hover:text-emerald-400 hover:bg-slate-900"
          >
            <Leaf className="h-4 w-4 text-emerald-400" />
            <span>Carbon Dashboard</span>
          </button>
          <div className="pt-2 border-t border-slate-800">
            {currentUser ? (
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">{currentUser.email}</span>
                </div>
                <button 
                  onClick={() => {
                    if (onSignOut) onSignOut();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onSignInClick) onSignInClick();
                  setIsOpen(false);
                }}
                className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-full font-bold text-xs shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

