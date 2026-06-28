import { Car, Globe, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        
        {/* Brand info */}
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="p-1.5 bg-brand-blue rounded-lg text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-sans font-extrabold text-xl tracking-tight text-brand-blue">Lift</span>
          </div>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            A 100% Free Community Project. Share the road, share the cost, and save the planet.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500">
          <a href="#" className="hover:text-brand-blue transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-blue transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-blue transition-colors">Safety Center</a>
          <a href="#" className="hover:text-brand-blue transition-colors">Help</a>
        </div>

        {/* Copyright & Social Icons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="text-[11px] text-gray-400 font-medium">
            © 2026 Lift Carpooling. All rights reserved.
          </p>
          <div className="flex items-center space-x-3 text-gray-400">
            <button className="p-1.5 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer" title="Language selection">
              <Globe className="h-4.5 w-4.5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer" title="Share with friends">
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
