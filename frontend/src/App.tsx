/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthUser, LocationSelection, Ride } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SearchForm from './components/SearchForm';
import RidesList from './components/RidesList';
import OfferRideModal from './components/OfferRideModal';
import ChatDrawer from './components/ChatDrawer';
import CarbonDashboard from './components/CarbonDashboard';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';
import AuthenticatedDashboard from './components/AuthenticatedDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Play, X, Leaf } from 'lucide-react';

export default function App() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'stats'>('home');
  const [joinedRideIds, setJoinedRideIds] = useState<string[]>([]);
  const [userRequests, setUserRequests] = useState<Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'>>({});
  const [selectedChatRide, setSelectedChatRide] = useState<Ride | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isWatchStoryOpen, setIsWatchStoryOpen] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');
  const [isExactMatchFound, setIsExactMatchFound] = useState<boolean>(true);
  const [searchQueryInfo, setSearchQueryInfo] = useState<{ pickupAddress?: string; destinationAddress?: string; date?: string } | null>(null);
  
  // App Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fetch all rides from backend on load
  const fetchRides = async (filters?: {
    pickupLocation?: LocationSelection | null;
    destinationLocation?: LocationSelection | null;
    date?: string;
    seatsAvailable?: number;
    radiusKm?: number;
  }) => {
    try {
      let url = '/api/rides';
      const hasFilters = Boolean(filters && (filters.pickupLocation || filters.destinationLocation || filters.date));
      if (filters && hasFilters) {
        const params = new URLSearchParams();
        if (filters.pickupLocation) {
          params.append('pickupLatitude', String(filters.pickupLocation.latitude));
          params.append('pickupLongitude', String(filters.pickupLocation.longitude));
        }
        if (filters.destinationLocation) {
          params.append('destinationLatitude', String(filters.destinationLocation.latitude));
          params.append('destinationLongitude', String(filters.destinationLocation.longitude));
        }
        if (filters.date) params.append('date', filters.date);
        if (filters.seatsAvailable) params.append('seatsAvailable', String(filters.seatsAvailable));
        if (filters.radiusKm) params.append('radiusKm', String(filters.radiusKm));
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (filters && hasFilters) {
          setSearchQueryInfo({
            pickupAddress: filters.pickupLocation?.address,
            destinationAddress: filters.destinationLocation?.address,
            date: filters.date,
          });

          if (Array.isArray(data) && data.length > 0) {
            setIsExactMatchFound(true);
            setRides(data);
          } else {
            // No exact matches found for specific date/coords!
            setIsExactMatchFound(false);
            // Fetch all active rides as fallback suggestions so UI is never empty
            const fallbackRes = await fetch('/api/rides', { credentials: 'include' });
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setRides(fallbackData);
            }
          }
        } else {
          setIsExactMatchFound(true);
          setSearchQueryInfo(null);
          setRides(data);
        }
      }
    } catch (err) {
      console.error('Error fetching rides from Express backend:', err);
    }
  };

  const fetchUserRequests = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/rides/user-requests', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'> = {};
        const acceptedIds: string[] = [];
        data.forEach((req: { rideId: string; status: 'PENDING' | 'ACCEPTED' | 'REJECTED' }) => {
          map[req.rideId] = req.status;
          if (req.status === 'ACCEPTED') {
            acceptedIds.push(req.rideId);
          }
        });
        setUserRequests(map);
        setJoinedRideIds(acceptedIds);
      }
    } catch (err) {
      console.error('Error fetching user requests:', err);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserRequests();
      const interval = setInterval(fetchUserRequests, 3000);
      return () => clearInterval(interval);
    } else {
      setUserRequests({});
      setJoinedRideIds([]);
    }
  }, [currentUser]);

  // Search Submit handler
  const handleSearch = async (filters: { pickupLocation: LocationSelection | null; destinationLocation: LocationSelection | null; date: string }) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    await fetchRides(filters);
    setActiveTab('search');

    if (filters.pickupLocation || filters.destinationLocation) {
      setSearchFeedback(`Search results for "${filters.pickupLocation?.address || 'Anywhere'}" to "${filters.destinationLocation?.address || 'Anywhere'}"`);
    } else {
      setSearchFeedback('');
    }

    // Smooth scroll down to search results
    setTimeout(() => {
      const resultsEl = document.getElementById('search-results-anchor');
      resultsEl?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };


  // Join Ride / Send Request handler
  const handleJoinRide = async (ride: Ride) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/rides/${ride.id}/request`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUserRequests((prev) => ({ ...prev, [ride.id]: data.status }));
        if (data.status === 'ACCEPTED') {
          setJoinedRideIds((prev) => Array.from(new Set([...prev, ride.id])));
        }
        setSelectedChatRide(ride);
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.message || 'Failed to send ride request');
      }
    } catch (err) {
      console.error('Error sending request:', err);
    }
  };

  // Offer/List Ride Submit handler (Calls post backend route)
  const handleOfferRide = async (rideData: {
    driverName: string;
    pickupLocation: LocationSelection;
    destinationLocation: LocationSelection;
    date: string;
    time: string;
    price: number;
    seatsAvailable: number;
    totalSeats: number;
    carModel: string;
    interests: string[];
    musicTaste: string[];
  }) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideData),
      });

      if (res.ok) {
        await fetchRides(); // Reload rides to include the new one
        alert('🚀 Ride published successfully to the community registry!');
      } else {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || 'Failed to post ride to server');
      }
    } catch (err: any) {
      alert(`Error listing your ride: ${err.message}`);
    }
  };

  const handleScrollToSearch = () => {
    const searchEl = document.getElementById('search-section');
    searchEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleListTripClick = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
    } else {
      setIsOfferModalOpen(true);
    }
  };

  const handleShowStatsClick = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
    } else {
      setActiveTab(activeTab === 'stats' ? 'home' : 'stats');
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    setCurrentUser(null);
    setActiveTab('home');
    setJoinedRideIds([]);
    setUserRequests({});
    setSelectedChatRide(null);
  };

  if (currentUser) {
    return (
      <div id="app-viewport" className="min-h-screen bg-surface-base">
        <AuthenticatedDashboard
          user={currentUser}
          rides={rides}
          joinedRideIds={joinedRideIds}
          userRequests={userRequests}
          onSearch={handleSearch}
          onJoinRide={handleJoinRide}
          onOpenChat={(ride) => setSelectedChatRide(ride)}
          onOfferRideClick={() => setIsOfferModalOpen(true)}
          onSignOut={handleSignOut}
          isExactMatchFound={isExactMatchFound}
          searchQueryInfo={searchQueryInfo}
          onClearFilter={() => {
            fetchRides();
            setIsExactMatchFound(true);
            setSearchQueryInfo(null);
            setSearchFeedback('');
          }}
        />

        {isOfferModalOpen && (
          <OfferRideModal
            onClose={() => setIsOfferModalOpen(false)}
            onSubmit={handleOfferRide}
          />
        )}

        {selectedChatRide && (
          <ChatDrawer
            ride={selectedChatRide}
            onClose={() => setSelectedChatRide(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div id="app-viewport" className="min-h-screen bg-surface-base flex flex-col justify-between">
      
      {/* Top Banner Notice for Separation instructions */}
      <div className="bg-brand-blue text-white px-4 py-3 text-center text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-2 border-b border-white/10 shadow-sm relative z-50">
        <div className="flex items-center space-x-1">
          <Info className="h-4.5 w-4.5" />
          <span><strong>Dual Repo Architecture Ready!</strong> This workspace is pre-split into frontend/backend code.</span>
        </div>
        <span className="opacity-75 hidden sm:inline">|</span>
        <span>Move <code>/backend</code> & <code>server.ts</code> to your backend repo, and <code>/src</code> to your frontend repo!</span>
      </div>

      {/* Navigation */}
      <Navbar
        onFindRideClick={handleScrollToSearch}
        onListTripClick={handleListTripClick}
        onShowStatsClick={handleShowStatsClick}
        activeTab={activeTab}
        currentUser={currentUser}
        onSignInClick={() => setIsLoginModalOpen(true)}
        onSignOut={async () => {
          await handleSignOut();
        }}
      />

      {/* Main Content Areas */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && currentUser ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CarbonDashboard onBackClick={() => setActiveTab('home')} />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero */}
              <Hero
                onFindRideClick={handleScrollToSearch}
                onListTripClick={handleListTripClick}
              />

              {/* Features */}
              <Features
                onFindRideClick={handleScrollToSearch}
                onListTripClick={handleListTripClick}
              />

              {/* Search Widget */}
              <SearchForm 
                onSearch={handleSearch} 
                isGuest={!currentUser}
                onPromptLogin={() => setIsLoginModalOpen(true)}
              />

              {/* Search Results / Matching Pools anchor */}
              <div id="search-results-anchor" className="scroll-mt-20">
                {searchFeedback && (
                  <div className="max-w-4xl mx-auto px-6 py-2.5 bg-brand-blue/5 text-brand-blue border border-brand-blue/10 rounded-2xl text-xs font-bold flex items-center justify-between mb-4">
                    <span>{searchFeedback}</span>
                    <button 
                      onClick={() => {
                        fetchRides();
                        setIsExactMatchFound(true);
                        setSearchQueryInfo(null);
                        setSearchFeedback('');
                      }} 
                      className="text-gray-400 hover:text-gray-600 font-extrabold cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
                
                <RidesList
                  rides={rides}
                  onJoinRide={handleJoinRide}
                  onOpenChat={(ride) => setSelectedChatRide(ride)}
                  joinedRideIds={joinedRideIds}
                  userRequests={userRequests}
                  currentUserId={currentUser?.id}
                  isGuest={!currentUser}
                  onPromptLogin={() => setIsLoginModalOpen(true)}
                  isExactMatchFound={isExactMatchFound}
                  searchQueryInfo={searchQueryInfo}
                  onOfferRideClick={() => setIsOfferModalOpen(true)}
                  onClearFilter={() => {
                    fetchRides();
                    setIsExactMatchFound(true);
                    setSearchQueryInfo(null);
                    setSearchFeedback('');
                  }}
                />
              </div>

              {/* Ready to Change CTA (Curved bottom visual box from screenshot) */}
              <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-brand-blue-container/40 border border-brand-blue-container rounded-[40px] p-8 md:p-14 text-center space-y-6 relative overflow-hidden shadow-sm">
                  {/* Decorative background shapes */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-blue/5 rounded-full"></div>
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-blue/5 rounded-full"></div>

                  <h3 className="text-3xl md:text-4xl font-extrabold text-[#001452] tracking-tight leading-tight">
                    Ready to change <br className="sm:hidden" /> how you move?
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto font-medium leading-relaxed">
                    Join 2 million users saving time and money every day. Your first shared ride is waiting for you.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <button
                      onClick={handleScrollToSearch}
                      className="bg-brand-blue hover:bg-brand-blue-hover text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-md shadow-brand-blue/10 transition-transform active:scale-95 cursor-pointer w-full sm:w-auto"
                    >
                      Get Started for Free
                    </button>
                    <button
                      onClick={() => setIsWatchStoryOpen(true)}
                      className="bg-white border border-gray-200 text-gray-700 hover:text-brand-blue hover:border-brand-blue px-8 py-3.5 rounded-full font-bold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto"
                    >
                      <Play className="h-4 w-4 fill-current text-brand-blue" />
                      <span>Watch the Story</span>
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* 1. Modal: List a Trip form */}
      {isOfferModalOpen && (
        <OfferRideModal
          onClose={() => setIsOfferModalOpen(false)}
          onSubmit={handleOfferRide}
        />
      )}

      {/* 2. Chat Drawer: Sliding secure chat panel */}
      {selectedChatRide && (
        <ChatDrawer
          ride={selectedChatRide}
          onClose={() => setSelectedChatRide(null)}
        />
      )}

      {/* 3. Modal Dialog: Watch the Story */}
      {isWatchStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 flex flex-col relative space-y-4">
            <button 
              onClick={() => setIsWatchStoryOpen(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2 text-brand-green">
              <Leaf className="h-5 w-5" />
              <h4 className="font-extrabold text-lg text-gray-900">How Lift Commuting Works</h4>
            </div>

            <div className="aspect-video rounded-2xl bg-gray-950 overflow-hidden relative flex items-center justify-center">
              {/* Simulation representing a premium explainer video */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/30 to-brand-green/30 opacity-40"></div>
              <div className="relative text-center p-6 space-y-3 z-10">
                <span className="text-4xl">🎬</span>
                <p className="text-sm font-bold text-white tracking-wide">Lift: Community Zero Emissions Initiative</p>
                <p className="text-[11px] text-gray-300 max-w-sm mx-auto">
                  Watch neighbors matching routes, reducing highway congestion, saving money, and receiving real-time carbon offsets automatically.
                </p>
                <button 
                  onClick={() => setIsWatchStoryOpen(false)}
                  className="bg-white/90 text-brand-blue px-6 py-2 rounded-full font-bold text-xs shadow-md"
                >
                  Close Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoginModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
