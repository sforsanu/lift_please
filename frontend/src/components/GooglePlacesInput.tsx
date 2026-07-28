import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MapPin, Check, Sparkles, Loader2 } from 'lucide-react';
import type { LocationSelection } from '../types';
import {
  createCustomLocation,
  fetchCombinedLocationSuggestions,
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
      <label className={`block text-xs font-bold text-gray-500 uppercase tracking-wider ${compact ? 'mb-1.5' : 'mb-2 pl-1'}`}>
        {label}
      </label>

      <div className="relative flex items-center">
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
            if (inputValue.trim()) {
              setShowDropdown(true);
            }
          }}
          onKeyDown={handleKeyDown}
          onClick={onClick}
          readOnly={disabled}
          autoComplete="off"
          spellCheck={false}
          className={
            compact
              ? 'block w-full h-11 pl-10 pr-24 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition-all shadow-xs focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
              : 'block w-full h-14 pl-12 pr-24 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none transition-all shadow-inner focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
          }
        />

        <div className="absolute right-0 flex items-center pr-3 space-x-1 pointer-events-none">
          {isLoading && <Loader2 className="h-4 w-4 text-brand-blue animate-spin" />}
          {value && (
            <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-xs">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Auto-suggest interactive dropdown */}
      {showDropdown && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {/* Header indicator */}
          <div className="px-3.5 py-1.5 bg-gray-50 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
            <span>Location Suggestions</span>
            {isGoogleReady && (
              <span className="text-brand-blue flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Live Maps
              </span>
            )}
          </div>

          {/* Predefined / Fallback Matches */}
          {suggestions.map((item) => (
            <button
              key={item.placeId || item.address}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-brand-blue/5 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <MapPin className="h-4 w-4 text-brand-blue flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-800 truncate">{item.address}</span>
              </div>
              {value?.address.toLowerCase() === item.address.toLowerCase() && (
                <Check className="h-3.5 w-3.5 text-brand-green flex-shrink-0 ml-2" />
              )}
            </button>
          ))}

          {/* Dynamic Typed Location option */}
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => {
                const customLoc = createCustomLocation(inputValue);
                handleSelectSuggestion(customLoc);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 transition-colors flex items-center space-x-2.5 group cursor-pointer border-t border-gray-100"
            >
              <span className="text-base flex-shrink-0">📍</span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-brand-blue block truncate">
                  Use "{inputValue.trim()}"
                </span>
                <span className="text-[10px] font-semibold text-gray-400">
                  Set as pickup/destination location
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


