import { Search, ShieldCheck, Car, ArrowRight } from 'lucide-react';
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
    <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Designed for the Modern Commuter
        </h2>
        <p className="mt-4 text-base md:text-lg text-gray-600">
          Everything you need to make your journey seamless, safe, and cost-effective.
        </p>
      </div>

      {/* Grid Layout conforming to screenshot layout */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Card 1: Find a Ride (with phone mockup stacked layers) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-8 pb-4">
            <div className="inline-flex p-3 bg-indigo-50 text-brand-blue rounded-2xl mb-6">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Find a Ride</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Enter your destination and see who's driving. Use our smart matching algorithm to find drivers with similar interests or music tastes.
            </p>
            <button 
              onClick={onFindRideClick}
              className="inline-flex items-center space-x-1 text-brand-blue font-bold text-sm hover:underline cursor-pointer"
            >
              <span>Browse routes</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {/* Card image asset */}
          <div className="p-6 pt-0 mt-4 flex justify-center">
            <div className="relative w-full max-w-[280px] h-[280px] rounded-2xl overflow-hidden shadow-md">
              <img 
                src={mockupImg} 
                alt="Lift Matching Screens Stacked" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Card 2: 100% Free Campaign Card (Solid brand background) */}
        <div className="bg-brand-blue rounded-3xl text-white p-8 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[400px]">
          {/* Subtle background circles for depth */}
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute -left-16 -top-16 w-36 h-36 bg-white/5 rounded-full"></div>

          <div className="space-y-4">
            <p className="text-base font-normal leading-relaxed text-brand-blue-container max-w-sm">
              No charges, no fees. Just neighbors helping neighbors get where they need to go.
            </p>
          </div>

          <div className="mt-8 space-y-1">
            <div className="flex items-center space-x-3 text-brand-blue-container">
              <Car className="h-8 w-8 text-[#5cfd80]" />
              <span className="text-4xl sm:text-5xl font-black text-white">100% Free</span>
            </div>
            <p className="text-sm font-semibold text-brand-blue-container uppercase tracking-widest pl-1">
              Free Forever
            </p>
          </div>
        </div>

        {/* Card 3: Secure & Easy (Golden overlay) */}
        <div className="bg-[#fef3c7]/45 border border-[#fde68a] rounded-3xl p-8 flex flex-col justify-between shadow-sm min-h-[400px]">
          <div>
            <div className="inline-flex p-3 bg-amber-100 text-[#d97706] rounded-2xl mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Easy</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Chat with your co-travelers and handle payments in-app with end-to-end encryption.
            </p>
          </div>

          {/* Secure padlock visual box */}
          <div className="bg-[#fef3c7] rounded-2xl p-8 border border-[#fde68a]/60 flex items-center justify-center">
            <div className="relative p-6 bg-white rounded-full shadow-md text-amber-500 animate-pulse">
              <ShieldCheck className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Card 4: Offer a Ride */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-8 pb-4">
            <div className="inline-flex p-3 bg-[#d1fae5] text-brand-green rounded-2xl mb-6">
              <Car className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Offer a Ride</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Going somewhere? List your trip in seconds and help your neighbors for free with verified members of the community.
            </p>
            <button 
              onClick={onListTripClick}
              className="bg-gray-950 hover:bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              List Now
            </button>
          </div>
          {/* Driver image asset */}
          <div className="p-6 pt-0 mt-4">
            <div className="relative w-full h-[210px] rounded-2xl overflow-hidden shadow-md">
              <img 
                src={driverImg} 
                alt="Commuter driving smiling" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
