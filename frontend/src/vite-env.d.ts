/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: typeof google;
  }

  namespace google.maps.places {
    class Autocomplete {
      constructor(input: HTMLInputElement, options?: AutocompleteOptions);
      addListener(eventName: 'place_changed', handler: () => void): MapsEventListener;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      fields?: string[];
      types?: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      name?: string;
      place_id?: string;
      geometry?: {
        location?: {
          lat: () => number;
          lng: () => number;
        };
      };
    }
  }

  namespace google.maps {
    interface MapsEventListener {
      remove: () => void;
    }
  }
}

export {};
