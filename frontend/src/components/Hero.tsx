import { ArrowRight, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onFindRideClick: () => void;
  onListTripClick: () => void;
}

export default function Hero({ onFindRideClick, onListTripClick }: HeroProps) {
  // Overlapping traveler avatars for social proof
  const travelers = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
  ];

  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-16 md:py-24">
      {/* Decorative background grid/gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
      <div className="absolute -top-40 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          {/* Hero text */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            
            {/* Green Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-1.5 bg-[#d1fae5] text-brand-green px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm"
            >
              <Leaf className="h-3.5 w-3.5 animate-pulse" />
              <span>New: Carbon Tracker Enabled</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
            >
              Travel Together, <br />
              <span className="text-brand-blue font-black drop-shadow-sm">Save More.</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-xl font-normal leading-relaxed"
            >
              Join the green mobility revolution. Lift connects you with trustworthy neighbors heading your way. Reduce emissions, build community, and travel completely free.
            </motion.p>

            {/* Interactive CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
            >
              <button
                onClick={onFindRideClick}
                className="flex items-center justify-center space-x-2 bg-brand-blue hover:bg-brand-blue-hover text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-brand-blue/20 w-full sm:w-auto hover:translate-x-1 transition-transform cursor-pointer"
              >
                <span>Find My Ride</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={onListTripClick}
                className="flex items-center justify-center border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 px-8 py-4 rounded-full font-bold text-base w-full sm:w-auto transition-colors cursor-pointer"
              >
                <span>List Your Trip</span>
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center space-x-3 pt-4"
            >
              <div className="flex -space-x-2.5">
                {travelers.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Active traveler"
                    className="h-9 w-9 rounded-full border-2 border-white object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-600">
                <span className="text-brand-blue font-bold">50k+</span> active travelers this week
              </p>
            </motion.div>

          </div>

          {/* Right graphics or mockup visualization */}
          <div className="md:col-span-5 hidden md:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-sm"
            >
              {/* Dynamic floating badge */}
              <div className="absolute -top-6 -left-6 bg-white border border-gray-100 p-3.5 rounded-2xl shadow-xl flex items-center space-x-3 z-10 animate-bounce">
                <div className="p-2 bg-[#d1fae5] rounded-full text-brand-green">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">CO2 Saved Today</p>
                  <p className="text-sm font-bold text-brand-green">14.5 kg CO₂</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0 bg-brand-blue/10 rounded-3xl transform rotate-3 scale-105"></div>
              
              {/* Main vector representation of city route or carpool */}
              <div className="relative bg-white border border-gray-100 p-6 rounded-3xl shadow-xl flex flex-col space-y-4">
                <div className="h-48 bg-brand-blue/5 rounded-2xl relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#004ced_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-15"></div>
                  {/* Visual routes */}
                  <svg className="w-full h-full p-4" viewBox="0 0 200 100" fill="none">
                    <path d="M20 80 C 80 20, 120 90, 180 30" stroke="#003ec7" strokeWidth="4" strokeLinecap="round" strokeDasharray="6,4" />
                    <circle cx="20" cy="80" r="6" fill="#003ec7" />
                    <circle cx="180" cy="30" r="6" fill="#006e2a" />
                  </svg>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-brand-blue flex items-center space-x-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>
                    <span>Route Matching...</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                    <span>Driver Alex Mercer</span>
                    <span className="text-brand-blue font-bold">100% Match</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900">San Francisco</p>
                      <p className="text-[11px] text-gray-400">08:30 AM</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">San Jose</p>
                      <p className="text-[11px] text-gray-400">Tesla Model 3</p>
                    </div>
                  </div>
                  <button 
                    onClick={onFindRideClick}
                    className="w-full py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    View Matching Pool
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
