import { Search, ShieldCheck, Car, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface FeaturesProps {
  onFindRideClick: () => void;
  onListTripClick: () => void;
}

export default function Features({ onFindRideClick, onListTripClick }: FeaturesProps) {
  // Let's grab the generated image paths. We use the generated images with absolute/relative path
  const mockupImg = "/src/assets/images/lift_app_mockup_1782533865343.jpg";
  const driverImg = "/src/assets/images/commuter_driving_1782533877815.jpg";

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/95 text-white overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center mb-16 space-y-3 relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Mobility</span>
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Designed for the Modern Commuter
        </h2>
        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Everything you need to make daily travel seamless, verified, eco-friendly, and cost-effective.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
        
        {/* Card 1: Find a Ride */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="bg-slate-900/80 rounded-3xl border border-slate-800 p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl group relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Find a Ride</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Enter your destination and see who's driving. Use our smart matching algorithm to find verified neighbors with matching schedules and music tastes.
            </p>
            <button 
              onClick={onFindRideClick}
              className="inline-flex items-center space-x-2 text-blue-400 font-extrabold text-xs hover:text-blue-300 transition-colors cursor-pointer group-hover:translate-x-1"
            >
              <span>Browse matching routes</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-[290px] h-[220px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <img 
                src={mockupImg} 
                alt="Lift Matching Screens Stacked" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: 100% Free Campaign Card */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl text-white p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[400px] border border-blue-400/30"
        >
          {/* Subtle background circles for depth */}
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -left-16 -top-16 w-44 h-44 bg-white/10 rounded-full blur-lg"></div>

          <div className="space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold">
              <Heart className="h-3.5 w-3.5 text-rose-300 fill-current" /> Zero Commission
            </span>
            <p className="text-lg font-medium leading-relaxed text-blue-100 max-w-sm">
              No charges, no hidden fees. Just neighbors helping neighbors commute cleaner and smarter.
            </p>
          </div>

          <div className="mt-8 space-y-2 relative z-10">
            <div className="flex items-center space-x-3 text-emerald-300">
              <Car className="h-9 w-9 text-emerald-300" />
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">100% Free</span>
            </div>
            <p className="text-xs font-extrabold text-blue-200 uppercase tracking-widest pl-1">
              Community Ride Initiative
            </p>
          </div>
        </motion.div>

        {/* Card 3: Secure & Easy */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="bg-slate-900/80 rounded-3xl border border-amber-500/20 p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Secure & Encrypted</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Chat directly with your co-travelers using end-to-end encrypted messaging channels once the driver accepts your chat request.
            </p>
          </div>

          {/* Secure padlock visual box */}
          <div className="mt-8 bg-slate-950/80 rounded-2xl p-8 border border-slate-800 flex items-center justify-center relative">
            <div className="relative p-6 bg-gradient-to-tr from-amber-500/20 to-amber-400/10 rounded-2xl text-amber-400 border border-amber-500/30 shadow-xl group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-10 w-10" />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Offer a Ride */}
        <motion.div 
          whileHover={{ y: -6 }}
          className="bg-slate-900/80 rounded-3xl border border-slate-800 p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl group"
        >
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Car className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Offer a Ride</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Going somewhere? List your trip in seconds and share your empty car seats with verified members of your local community.
            </p>
            <button 
              onClick={onListTripClick}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer border border-emerald-400/20"
            >
              List Ride Now
            </button>
          </div>

          {/* Driver image asset */}
          <div className="mt-8">
            <div className="relative w-full h-[180px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <img 
                src={driverImg} 
                alt="Commuter driving smiling" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

