import React, { useState } from 'react';
import { Car, Menu, X, Leaf, LogOut, User } from 'lucide-react';

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
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2 bg-brand-blue rounded-lg text-white">
              <Car className="h-6 w-6" />
            </div>
            <span className="font-sans font-extrabold text-2xl tracking-tight text-brand-blue">Lift</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={onFindRideClick}
              className={`font-sans font-semibold text-sm transition-colors ${
                activeTab === 'search' ? 'text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
              }`}
            >
              Find a Ride
            </button>
            <button 
              onClick={onListTripClick}
              className="font-sans font-semibold text-sm text-gray-600 hover:text-brand-blue transition-colors"
            >
              Offer a Ride
            </button>
            <button 
              onClick={onShowStatsClick}
              className={`flex items-center space-x-1.5 font-sans font-semibold text-sm transition-colors ${
                activeTab === 'stats' ? 'text-brand-green' : 'text-gray-600 hover:text-brand-green'
              }`}
            >
              <Leaf className="h-4 w-4 text-brand-green" />
              <span>Carbon Dashboard</span>
            </button>
          </div>

          {/* CTA & User Profile Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full">
                <div className="p-1.5 bg-brand-blue/10 text-brand-blue rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-700 leading-tight">Logged In</p>
                  <p className="text-[10px] text-gray-400 font-medium leading-none max-w-[120px] truncate" title={currentUser.email}>
                    {currentUser.email}
                  </p>
                </div>
                <button 
                  onClick={onSignOut}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-all cursor-pointer ml-1"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onSignInClick}
                className="bg-brand-blue hover:bg-brand-blue-hover text-white px-6 py-2.5 rounded-full font-sans font-semibold text-sm shadow-md shadow-brand-blue/10 active:scale-95 transition-transform cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-brand-blue hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-3 transition-all duration-200">
          <button
            onClick={() => {
              onFindRideClick();
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-brand-blue hover:bg-gray-50"
          >
            Find a Ride
          </button>
          <button
            onClick={() => {
              onListTripClick();
              setIsOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-brand-blue hover:bg-gray-50"
          >
            Offer a Ride
          </button>
          <button
            onClick={() => {
              onShowStatsClick();
              setIsOpen(false);
            }}
            className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-brand-green hover:bg-gray-50"
          >
            <Leaf className="h-5 w-5 text-brand-green" />
            <span>Carbon Dashboard</span>
          </button>
          <div className="pt-2 border-t border-gray-100">
            {currentUser ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <User className="h-4.5 w-4.5 text-brand-blue" />
                  <span className="text-xs font-semibold text-gray-600 truncate max-w-[150px]">{currentUser.email}</span>
                </div>
                <button 
                  onClick={() => {
                    if (onSignOut) onSignOut();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-red-500"
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
                className="block w-full text-center bg-brand-blue hover:bg-brand-blue-hover text-white px-4 py-2.5 rounded-full font-sans font-semibold text-sm"
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
