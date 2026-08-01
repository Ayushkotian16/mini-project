import React, { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// Kateel Durgaparameshwari Temple coordinates
const KATEEL_LAT = 13.0067;
const KATEEL_LNG = 74.9948;
const KATEEL_LABEL = 'Kateel Durgaparameshwari Temple';

// Haversine formula — straight-line distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Road distance is typically 1.3x straight-line in this region
  return Math.round(straight * 1.3);
}

// Load Google Maps script once
let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks = [];

function loadGoogleMaps(apiKey) {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(true); return; }
    mapsCallbacks.push(resolve);
    if (mapsLoading) return;
    mapsLoading = true;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      mapsLoaded = false;
      mapsCallbacks.forEach((cb) => cb(false));
      mapsCallbacks.length = 0;
      return;
    }

    window.__googleMapsReady = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach((cb) => cb(true));
      mapsCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googleMapsReady`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      mapsCallbacks.forEach((cb) => cb(false));
      mapsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

/**
 * LocationPicker
 * Props:
 *   value        — { address, lat, lng, distance }
 *   onChange     — called with updated value
 */
export default function LocationPicker({ value, onChange }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [mapsAvailable, setMapsAvailable] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [manualAddress, setManualAddress] = useState(value?.address || '');

  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  useEffect(() => {
    loadGoogleMaps(MAPS_KEY).then((ok) => {
      setMapsAvailable(ok);
    });
  }, [MAPS_KEY]);

  // Init autocomplete when maps loaded
  useEffect(() => {
    if (!mapsAvailable || !inputRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'in' },
    });
    autocompleteRef.current = ac;
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || place.name;
      const distance = Math.round(haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG));
      onChange({ address, lat, lng, distance, placeId: place.place_id || '' });
      updateMap(lat, lng);
    });
  }, [mapsAvailable]);

  // Init map
  useEffect(() => {
    if (!mapsAvailable || !showMap || !mapRef.current || mapInstanceRef.current) return;
    const center = value?.lat
      ? { lat: value.lat, lng: value.lng }
      : { lat: KATEEL_LAT, lng: KATEEL_LNG };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;

    // Kateel temple marker
    new window.google.maps.Marker({
      position: { lat: KATEEL_LAT, lng: KATEEL_LNG },
      map,
      title: KATEEL_LABEL,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });

    // Venue marker (draggable)
    if (value?.lat) {
      const marker = new window.google.maps.Marker({
        position: { lat: value.lat, lng: value.lng },
        map,
        draggable: true,
        title: 'Your Venue',
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      });
      markerRef.current = marker;
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        const lat = pos.lat();
        const lng = pos.lng();
        const distance = Math.round(haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG));
        onChange({ ...value, lat, lng, distance });
      });
    }

    // Click on map to set venue
    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const distance = Math.round(haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG));

      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      } else {
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          draggable: true,
          title: 'Your Venue',
          icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
        });
        markerRef.current = marker;
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          const d = Math.round(haversineKm(pos.lat(), pos.lng(), KATEEL_LAT, KATEEL_LNG));
          onChange({ ...value, lat: pos.lat(), lng: pos.lng(), distance: d });
        });
      }
      onChange({ ...value, lat, lng, distance });
    });
  }, [mapsAvailable, showMap]);

  const updateMap = useCallback((lat, lng) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        title: 'Your Venue',
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      });
      markerRef.current = marker;
    }
  }, []);

  // Get current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const distance = Math.round(haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG));

        // Reverse geocode if Maps available
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (mapsAvailable) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const result = await new Promise((res, rej) =>
              geocoder.geocode({ location: { lat, lng } }, (r, s) =>
                s === 'OK' ? res(r[0]) : rej(s)
              )
            );
            address = result.formatted_address;
            if (inputRef.current) inputRef.current.value = address;
          } catch {}
        }

        onChange({ address, lat, lng, distance, placeId: '' });
        updateMap(lat, lng);
        setLocating(false);
        toast.success(`Location detected! ${distance} km from Kateel Temple.`);
      },
      (err) => {
        setLocating(false);
        toast.error('Could not get location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Manual distance calculation (no Maps API)
  const handleManualSubmit = () => {
    if (!manualAddress.trim()) {
      toast.error('Please enter venue address.');
      return;
    }
    onChange({ address: manualAddress, lat: null, lng: null, distance: value?.distance || 0, placeId: '' });
    toast.success('Address saved.');
  };

  return (
    <div className="space-y-3">
      <label className="text-label-lg text-primary block">Venue Location *</label>

      {/* Input row */}
      <div className="flex gap-2 items-end">
        {mapsAvailable ? (
          <input
            ref={inputRef}
            className="input-field flex-1"
            placeholder="Search venue address or landmark..."
            defaultValue={value?.address || ''}
          />
        ) : (
          <input
            className="input-field flex-1"
            placeholder="Enter venue address..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            onBlur={handleManualSubmit}
          />
        )}

        {/* Current location button */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locating}
          title="Use my current location"
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-secondary-container text-primary rounded-lg text-label-lg hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          )}
          <span className="hidden sm:inline">{locating ? 'Locating...' : 'My Location'}</span>
        </button>

        {/* Toggle map */}
        {mapsAvailable && (
          <button
            type="button"
            onClick={() => setShowMap((s) => !s)}
            title="Toggle map"
            className="flex-shrink-0 px-3 py-2 bg-surface-container text-on-surface-variant rounded-lg hover:bg-secondary-container hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
          </button>
        )}
      </div>

      {/* Distance result */}
      {value?.distance > 0 && (
        <div className="flex items-center gap-3 p-3 bg-secondary-container rounded-xl">
          <span className="material-symbols-outlined text-primary">route</span>
          <div className="flex-1">
            <p className="text-label-lg font-semibold text-on-surface">
              {value.distance} km from {KATEEL_LABEL}
            </p>
            {value.address && (
              <p className="text-label-md text-on-surface-variant truncate">{value.address}</p>
            )}
          </div>
          <span className="text-label-md text-primary font-bold bg-primary-fixed px-3 py-1 rounded-full">
            Auto-calculated
          </span>
        </div>
      )}

      {/* Map */}
      {mapsAvailable && showMap && (
        <div className="rounded-xl overflow-hidden border border-outline-variant shadow-luminous-md">
          <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
          <div className="p-3 bg-surface-container-low text-label-md text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">info</span>
            Click on the map to set venue location. Drag the blue marker to adjust.
            <span className="ml-auto flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Kateel Temple
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block ml-2" /> Your Venue
            </span>
          </div>
        </div>
      )}

      {/* No Maps API fallback message */}
      {!mapsAvailable && (
        <p className="text-label-md text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-outline">info</span>
          Add Google Maps API key in <code className="bg-surface-container px-1 rounded">frontend/.env</code> for map search & auto-distance.
        </p>
      )}
    </div>
  );
}
