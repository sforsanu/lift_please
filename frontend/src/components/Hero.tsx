import { ArrowRight, Leaf, ShieldCheck, Sparkles, MapPin, Zap, Star } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-14 pb-20 md:py-28">
      
      {/* Decorative animated background mesh & glowing orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950/60 to-slate-950"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-blue/30 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Subtle SVG Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Content Column */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            
            {/* Live Green Innovation Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-emerald-900/20 backdrop-blur-md"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Emissions Community Carpooling</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]"
            >
              Travel Together, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 drop-shadow-md">
                Save Costs & CO₂.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-300 max-w-xl font-medium leading-relaxed"
            >
              Join thousands of daily commuters sharing routes across your region. Verified drivers, encrypted instant messaging, and zero fare commissions.
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2"
            >
              <button
                onClick={onFindRideClick}
                className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-blue-600/30 w-full sm:w-auto transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
              >
                <span>Find My Ride</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onListTripClick}
                className="flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-8 py-4 rounded-2xl font-bold text-base w-full sm:w-auto transition-all cursor-pointer backdrop-blur-md shadow-lg"
              >
                <Zap className="h-4 w-4 text-amber-400 mr-2" />
                <span>Offer a Ride</span>
              </button>
            </motion.div>

            {/* Social Proof Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center space-x-4 pt-6 border-t border-slate-800/80 w-full max-w-md justify-center md:justify-start"
            >
              <div className="flex -space-x-3">
                {travelers.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Active traveler"
                    className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <div className="text-left text-xs font-semibold text-slate-300">
                <p className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" /> 4.9/5 Rating
                </p>
                <p className="text-slate-400">Over <strong className="text-white font-bold">50,000+</strong> active monthly rides</p>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Dynamic Route Interactive Hero Graphic */}
          <div className="md:col-span-5 hidden md:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-md"
            >
              {/* Floating Eco Badge */}
              <div className="absolute -top-7 -left-7 bg-slate-900/90 border border-emerald-500/40 p-4 rounded-2xl shadow-2xl flex items-center space-x-3.5 z-20 backdrop-blur-xl animate-float-slow">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Carbon Offset Today</p>
                  <p className="text-base font-black text-emerald-400">14.5 kg CO₂ Saved</p>
                </div>
              </div>

              {/* Dynamic Glow aura behind main card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse-glow"></div>
              
              {/* Main Visual Route Container */}
              <div className="relative bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-xl space-y-5">
                
                {/* Visual Route Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" 
                      alt="Driver" 
                      className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Nishikanta Nayak</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Tesla Model Y (EV)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-full">
                    Active Match
                  </span>
                </div>

                {/* SVG Route Connector */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3 text-xs font-extrabold">
                    <span className="text-slate-300 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-400" /> Bhubaneswar
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">53.7 km</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Puri
                    </span>
                  </div>

                  <svg className="w-full h-10" viewBox="0 0 200 30" fill="none">
                    <path d="M 10 15 Q 100 -5 190 15" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 4" />
                    <circle cx="10" cy="15" r="5" fill="#3b82f6" />
                    <circle cx="190" cy="15" r="5" fill="#10b981" />
                  </svg>
                </div>

                {/* Info Footer Pill */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 font-medium">Seats: <strong className="text-white">4 of 5 open</strong></span>
                  <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Free Community Ride
                  </span>
                </div>

                <button 
                  onClick={onFindRideClick}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer border border-blue-400/20"
                >
                  Join Matching Pool
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

