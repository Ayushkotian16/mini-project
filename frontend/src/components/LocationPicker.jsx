import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Kateel Durgaparameshwari Temple coordinates
const KATEEL_LAT = 13.0067;
const KATEEL_LNG = 74.9948;
const KATEEL_LABEL = 'Kateel Durgaparameshwari Temple';

// Haversine — road-adjusted distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3);
}

// Nominatim search — free OpenStreetMap geocoding
async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

// Nominatim reverse geocode
async function nominatimReverse(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Reverse geocode failed');
  return res.json();
}

export default function LocationPicker({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const venueMarkerRef = useRef(null);
  const kateelMarkerRef = useRef(null);

  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Load Leaflet map once showMap becomes true
  useEffect(() => {
    if (!showMap) return;
    // Wait for DOM to render the container, then init map
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = window.L || require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center = value?.lat ? [value.lat, value.lng] : [KATEEL_LAT, KATEEL_LNG];
      const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(center, 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Force size recalc after render
      setTimeout(() => { map.invalidateSize(true); }, 200);

      // Kateel temple — red pin 🔴
      const redIcon = L.divIcon({
        className: '',
        html: '<div style="width:20px;height:20px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
        iconSize: [20, 20], iconAnchor: [10, 20],
      });
      L.marker([KATEEL_LAT, KATEEL_LNG], { icon: redIcon }).addTo(map).bindPopup(`<b>${KATEEL_LABEL}</b>`).openPopup();

      // Venue marker if already set
      if (value?.lat) {
        const blueIcon = L.divIcon({
          className: '',
          html: '<div style="width:20px;height:20px;background:#2563eb;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
          iconSize: [20, 20], iconAnchor: [10, 20],
        });
        venueMarkerRef.current = L.marker([value.lat, value.lng], { icon: blueIcon, draggable: true })
          .addTo(map).bindPopup('Your Venue');
        venueMarkerRef.current.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
          nominatimReverse(lat, lng).then((r) => {
            const addr = r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setQuery(addr);
            onChange({ address: addr, lat, lng, distance: dist });
          }).catch(() => onChange({ ...value, lat, lng, distance: dist }));
        });
      }

      // Click map to place venue
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
        placeVenueMarker(map, lat, lng);
        nominatimReverse(lat, lng)
          .then((r) => {
            const addr = r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setQuery(addr);
            onChange({ address: addr, lat, lng, distance: dist });
            toast.success(`📍 Venue set: ${addr.split(',').slice(0,2).join(',')}`);
          })
          .catch(() => onChange({ ...value, lat, lng, distance: dist }));
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        venueMarkerRef.current = null;
      }
    };
  }, [showMap]);

  const placeVenueMarker = (map, lat, lng) => {
    const L = window.L || require('leaflet');
    const blueIcon = L.divIcon({
      className: '',
      html: '<div style="width:20px;height:20px;background:#2563eb;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
      iconSize: [20, 20], iconAnchor: [10, 20],
    });
    if (venueMarkerRef.current) {
      venueMarkerRef.current.setLatLng([lat, lng]);
    } else {
      venueMarkerRef.current = L.marker([lat, lng], { icon: blueIcon, draggable: true })
        .addTo(map)
        .bindPopup('Your Venue');
      venueMarkerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const dist = haversineKm(pos.lat, pos.lng, KATEEL_LAT, KATEEL_LNG);
        onChange({ ...value, lat: pos.lat, lng: pos.lng, distance: dist });
      });
    }
    map.panTo([lat, lng]);
  };

  // Debounced Nominatim search as user types
  const handleQueryChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 3) return;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await nominatimSearch(v);
        setSuggestions(results);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 500);
  };

  const selectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.display_name;
    const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
    setQuery(address);
    setSuggestions([]);
    onChange({ address, lat, lng, distance: dist });
    if (mapRef.current) placeVenueMarker(mapRef.current, lat, lng);
  };

  // GPS current location — fills search box but user can still change
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
        try {
          const r = await nominatimReverse(lat, lng);
          const address = r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          // Fill the search box so user can see and edit it
          setQuery(address);
          // Open map so user can verify/move the pin
          setShowMap(true);
          // Update parent — user can still change by searching or clicking map
          onChange({ address, lat, lng, distance: dist });
          if (mapRef.current) placeVenueMarker(mapRef.current, lat, lng);
          toast.success(`📍 Your location detected (${dist} km from Kateel). You can search a different venue above or click the map to change.`);
        } catch {
          setQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          onChange({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng, distance: dist });
        }
        setLocating(false);
      },
      () => { setLocating(false); toast.error('Could not get location. Allow location access.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-label-lg text-primary block">Venue Location *</label>

      {/* Search row */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            className="input-field w-full"
            placeholder="Search venue address or landmark..."
            value={query}
            onChange={handleQueryChange}
            autoComplete="off"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 text-label-md text-on-surface hover:bg-secondary-container transition-colors border-b border-outline-variant/50 last:border-0"
                    onClick={() => selectSuggestion(s)}
                  >
                    <span className="material-symbols-outlined text-primary text-sm align-middle mr-1">location_on</span>
                    {s.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* GPS button */}
        <button type="button" onClick={handleCurrentLocation} disabled={locating}
          title="Use my current location"
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-secondary-container text-primary rounded-lg text-label-lg hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
          {locating
            ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            : <span className="material-symbols-outlined text-[18px]">my_location</span>}
          <span className="hidden sm:inline">{locating ? 'Locating...' : 'My Location'}</span>
        </button>

        {/* Toggle map */}
        <button type="button" onClick={() => setShowMap((s) => !s)} title="Toggle map"
          className={`flex-shrink-0 px-3 py-2 rounded-lg border transition-all ${showMap ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-secondary-container hover:text-primary'}`}>
          <span className="material-symbols-outlined text-[18px]">map</span>
        </button>
      </div>

      {/* Distance chip */}
      {value?.distance > 0 && (
        <div className="flex items-center gap-3 p-3 bg-secondary-container rounded-xl">
          <span className="material-symbols-outlined text-primary">route</span>
          <div className="flex-1">
            <p className="text-label-lg font-semibold text-on-surface">{value.distance} km from {KATEEL_LABEL}</p>
            {value.address && <p className="text-label-md text-on-surface-variant truncate">{value.address}</p>}
          </div>
          <span className="text-label-md text-primary font-bold bg-primary-fixed px-3 py-1 rounded-full">Auto-calculated</span>
        </div>
      )}

      {/* Leaflet Map */}
      {showMap && (
        <div className="rounded-xl overflow-hidden border border-outline-variant shadow-md">
          <div ref={mapContainerRef} style={{ height: '300px', width: '100%' }} />
          <div className="p-3 bg-surface-container-low text-label-md text-on-surface-variant flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">info</span>
            Click anywhere on map to set your <strong>event venue</strong>. Address + coordinates auto-filled.
            <span className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Kateel Temple</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Your Venue</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
