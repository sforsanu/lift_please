import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, ArrowRight, Car, Lock, Mail, Phone, User } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const authenticate = async (url: string, body: Record<string, string>) => {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }

    onLoginSuccess(data.user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && (!name.trim() || !phone.trim()))) return;

    setLoading(true);
    setError('');

    try {
      await authenticate(mode === 'signup' ? '/api/auth/signup' : '/api/auth/login', {
        ...(mode === 'signup' ? { name, phone } : {}),
        email,
        password,
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError('Google did not return a credential');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authenticate('/api/auth/google', { credential });
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-[#f9f9fc] rounded-[32px] max-w-sm w-full p-8 shadow-2xl border border-gray-100 flex flex-col items-center relative animate-fade-in text-center max-h-[94vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close sign in dialog"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 bg-gradient-to-tr from-brand-blue-light to-brand-blue text-white rounded-2xl shadow-lg shadow-brand-blue/10 mb-4">
          <Car className="h-8 w-8" />
        </div>

        <div className="mb-6 space-y-1">
          <h2 className="text-3xl font-black text-brand-blue tracking-tight">Lift</h2>
          <p className="text-lg font-bold text-gray-700">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</p>
        </div>

        <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1 text-xs font-black text-gray-500">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`h-10 rounded-xl transition-all ${mode === 'login' ? 'bg-white text-brand-blue shadow-sm' : 'hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`h-10 rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-brand-blue shadow-sm' : 'hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-full font-bold text-sm shadow-md shadow-brand-blue/10 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer disabled:bg-gray-400"
            >
              <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center justify-center my-4">
            <div className="border-t border-gray-200 flex-grow"></div>
            <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white">Or</span>
            <div className="border-t border-gray-200 flex-grow"></div>
          </div>

          <div className="space-y-2.5">
            {googleConfigured ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(response) => handleGoogleSuccess(response.credential)}
                  onError={() => setError('Google Sign-In failed')}
                  useOneTap={false}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
                Add VITE_GOOGLE_CLIENT_ID to enable Google Sign-In.
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 font-semibold">
          {mode === 'login' ? 'Need a new account?' : 'Already registered?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-brand-blue font-bold hover:underline cursor-pointer"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-bold">
          <Lock className="h-3 w-3" />
          <span>Secure, encrypted connection</span>
        </div>
      </div>
    </div>
  );
}
