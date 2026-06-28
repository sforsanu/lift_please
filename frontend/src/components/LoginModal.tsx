import React, { useState } from 'react';
import { Car, Mail, ArrowRight, Lock } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API request to Express auth system
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-[#f9f9fc] rounded-[32px] max-w-sm w-full p-8 shadow-2xl border border-gray-100 flex flex-col items-center relative animate-fade-in text-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Header Icon */}
        <div className="p-4 bg-gradient-to-tr from-brand-blue-light to-brand-blue text-white rounded-2xl shadow-lg shadow-brand-blue/10 mb-4 animate-pulse">
          <Car className="h-8 w-8" />
        </div>

        {/* Title */}
        <div className="mb-6 space-y-1">
          <h2 className="text-3xl font-black text-brand-blue tracking-tight">Lift</h2>
          <p className="text-lg font-bold text-gray-700">Welcome Back</p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">
                Email or Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-full font-bold text-sm shadow-md shadow-brand-blue/10 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer disabled:bg-gray-400"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center my-4">
            <div className="border-t border-gray-200 flex-grow"></div>
            <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white">Or</span>
            <div className="border-t border-gray-200 flex-grow"></div>
          </div>

          {/* Third Party OAuth Buttons */}
          <div className="space-y-2.5">
            <button 
              onClick={() => onLoginSuccess('google.user@gmail.com')}
              className="w-full h-12 border border-gray-200 hover:border-gray-300 rounded-full flex items-center justify-center space-x-3 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              {/* Google high fidelity favicon/vector logo container */}
              <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4.5 w-4.5" />
              <span>Continue with Google</span>
            </button>

            <button 
              onClick={() => onLoginSuccess('apple.user@icloud.com')}
              className="w-full h-12 border border-gray-200 hover:border-gray-300 rounded-full flex items-center justify-center space-x-3 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              {/* Apple elegant favicon vector */}
              <span className="text-sm">🍎</span>
              <span>Continue with Apple</span>
            </button>
          </div>
        </div>

        {/* Sign Up prompt */}
        <p className="mt-6 text-xs text-gray-400 font-semibold">
          New to Lift? <span onClick={() => onLoginSuccess('new.member@lift.org')} className="text-brand-blue font-bold hover:underline cursor-pointer">Sign Up</span>
        </p>

        {/* Secure connection lock */}
        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-bold">
          <Lock className="h-3 w-3" />
          <span>Secure, encrypted connection</span>
        </div>

      </div>
    </div>
  );
}
