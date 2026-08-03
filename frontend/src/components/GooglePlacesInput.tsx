import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MapPin, Check, Sparkles, Loader2, Navigation, AlertCircle } from 'lucide-react';
import type { LocationSelection } from '../types';
import {
  createCustomLocation,
  fetchCombinedLocationSuggestions,
  getCurrentDeviceLocation,
  getGoogleMapsApiKey,
  loadGooglePlaces,
  searchFallbackLocations,
} from '../utils/googlePlaces';

interface GooglePlacesInputProps {
  label: string;
  placeholder: string;
  value: LocationSelection | null;
  onChange: (location: LocationSelection | null) => void;
  icon: LucideIcon;
  disabled?: boolean;
  compact?: boolean;
  required?: boolean;
  onClick?: () => void;
}

export default function GooglePlacesInput({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  disabled = false,
  compact = false,
  required = true,
  onClick,
}: GooglePlacesInputProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [inputValue, setInputValue] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<LocationSelection[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // Load Google Places script in background if API key is present
  useEffect(() => {
    if (getGoogleMapsApiKey()) {
      loadGooglePlaces()
        .then(() => setIsGoogleReady(true))
        .catch(() => setIsGoogleReady(false));
    }
  }, []);

  // Sync internal input value when external value changes
  useEffect(() => {
    if (value) {
      setInputValue(value.address);
    } else if (document.activeElement !== inputRef.current) {
      setInputValue('');
    }
  }, [value]);

  // Fetch combined suggestions dynamically when input value changes
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Set instant local matches immediately so dropdown is populated without delay
    const instantMatches = searchFallbackLocations(trimmed);
    setSuggestions(instantMatches);

    let isMounted = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await fetchCombinedLocationSuggestions(trimmed);
        if (isMounted) {
          setSuggestions(results);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [inputValue, disabled, isGoogleReady]);

  const handleDetectCurrentLocation = async () => {
    if (disabled || isLocating) return;
    setIsLocating(true);
    setGeoError(null);
    try {
      const loc = await getCurrentDeviceLocation();
      setInputValue(loc.address);
      onChange(loc);
      setShowDropdown(false);
    } catch (err: any) {
      setGeoError(err?.message || 'Unable to detect current GPS location');
    } finally {
      setIsLocating(false);
    }
  };

  const commitCurrentInput = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      if (value) onChange(null);
      return;
    }
    if (value && value.address.toLowerCase() === trimmed.toLowerCase()) {
      return;
    }
    const match = suggestions.find((s) => s.address.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      onChange(match);
    } else {
      const customLoc = createCustomLocation(trimmed);
      onChange(customLoc);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!val.trim()) {
      onChange(null);
      setSuggestions([]);
      setShowDropdown(false);
    } else {
      setShowDropdown(true);
    }
  };

  const handleSelectSuggestion = (loc: LocationSelection) => {
    setInputValue(loc.address);
    onChange(loc);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (inputValue.trim()) {
        commitCurrentInput();
        setShowDropdown(false);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (showDropdown) {
          setShowDropdown(false);
          commitCurrentInput();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, inputValue, value, suggestions]);

  return (
    <div ref={containerRef} className="min-w-0 relative">
      <div className="flex items-center justify-between gap-1 mb-1.5 pl-1 min-w-0">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider truncate">
          {label}
        </label>
        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={disabled || isLocating}
          className="text-[10px] sm:text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
        >
          {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3 text-blue-600" />}
          <span>{isLocating ? 'Locating...' : 'Use current location'}</span>
        </button>
      </div>

      <div className="relative flex items-center min-w-0">
        <span className={`pointer-events-none absolute left-0 flex items-center text-brand-blue z-10 ${compact ? 'pl-3.5' : 'pl-4'}`}>
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </span>

        <input
          ref={inputRef}
          type="text"
          required={required}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onClick={onClick}
          readOnly={disabled}
          autoComplete="off"
          spellCheck={false}
          className={
            compact
              ? 'block w-full h-11 pl-10 pr-36 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-xs focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 truncate'
              : 'block w-full h-14 pl-12 pr-36 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition-all shadow-inner focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 truncate'
          }
        />

        <div className="absolute right-2 flex items-center space-x-1 z-20 pointer-events-auto">
          {isLoading && <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin flex-shrink-0" />}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDetectCurrentLocation();
            }}
            disabled={isLocating || disabled}
            title="Detect My Current GPS Location"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[10px] font-black transition-all cursor-pointer border border-blue-200 active:scale-95 shadow-2xs group flex-shrink-0"
          >
            {isLocating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Navigation className="h-3 w-3 group-hover:rotate-45 transition-transform" />
            )}
            <span>GPS</span>
          </button>

          {value && (
            <span className="text-[9px] font-black uppercase tracking-wide text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs flex-shrink-0 whitespace-nowrap">
              Selected
            </span>
          )}
        </div>
      </div>

      {geoError && (
        <p className="mt-1.5 text-[11px] font-bold text-rose-600 flex items-center gap-1 pl-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{geoError}</span>
        </p>
      )}

      {/* Auto-suggest interactive dropdown */}
      {showDropdown && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
          
          {/* Prominent "Use My Current Location" button at top of dropdown */}
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isLocating}
            className="w-full text-left px-3.5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 hover:from-blue-100 hover:to-indigo-100 transition-colors flex items-center justify-between group cursor-pointer border-b border-blue-100"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-blue-700 block truncate">
                  {isLocating ? 'Detecting current GPS position...' : 'Use My Current Location'}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block truncate">
                  Automatically detect your street & area via device GPS
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs uppercase tracking-wider">
              Live GPS
            </span>
          </button>

          {/* Header indicator */}
          <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <span>Landmark & Street Suggestions</span>
            <span className="text-blue-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Maps POI
            </span>
          </div>

          {/* Predefined / Fallback Matches */}
          {suggestions.map((item) => {
            const parts = item.address.split(',');
            const primaryTitle = parts[0]?.trim() || item.address;
            const subTitle = parts.slice(1).join(',').trim();

            return (
              <button
                key={item.placeId || item.address}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-900 block truncate group-hover:text-blue-600 transition-colors">
                      {primaryTitle}
                    </span>
                    {subTitle && (
                      <span className="text-[11px] font-semibold text-slate-500 block truncate">
                        {subTitle}
                      </span>
                    )}
                  </div>
                </div>
                {value?.address.toLowerCase() === item.address.toLowerCase() && (
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}

          {/* Dynamic Typed Location option */}
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => {
                const customLoc = createCustomLocation(inputValue);
                handleSelectSuggestion(customLoc);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 transition-colors flex items-center space-x-3 group cursor-pointer border-t border-slate-100 bg-slate-50/50"
            >
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-emerald-700 block truncate">
                  Use custom location: "{inputValue.trim()}"
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Set exact landmark / street as pickup/destination
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


