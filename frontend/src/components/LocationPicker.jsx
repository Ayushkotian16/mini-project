import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KATEEL_LAT = 13.0067;
const KATEEL_LNG = 74.9948;
const KATEEL_LABEL = 'Kateel Durgaparameshwari Temple';

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3);
}

async function nominatimSearch(query) {
  // Add India context for better results, use viewbox around Karnataka/Kerala
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=7&countrycodes=in&addressdetails=1&accept-language=en&viewbox=74.0,12.0,76.5,14.5&bounded=0`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return res.json();
}

async function nominatimReverse(lat, lng) {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
  return res.json();
}

const redIcon = () => L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;background:#dc2626;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>',
  iconSize: [22, 22], iconAnchor: [11, 22],
});

const blueIcon = () => L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;background:#2563eb;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>',
  iconSize: [22, 22], iconAnchor: [11, 22],
});

export default function LocationPicker({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const venueMarkerRef = useRef(null);

  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!showMap) return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const center = value?.lat ? [value.lat, value.lng] : [KATEEL_LAT, KATEEL_LNG];
      const map = L.map(mapContainerRef.current).setView(center, 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 300);

      // Kateel marker
      L.marker([KATEEL_LAT, KATEEL_LNG], { icon: redIcon() }).addTo(map).bindPopup(`<b>${KATEEL_LABEL}</b>`);

      // Venue marker if coords exist
      if (value?.lat) {
        venueMarkerRef.current = L.marker([value.lat, value.lng], { icon: blueIcon(), draggable: true })
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

      // Click to place venue
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
        placeMarker(map, lat, lng);
        nominatimReverse(lat, lng).then((r) => {
          const addr = r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setQuery(addr);
          onChange({ address: addr, lat, lng, distance: dist });
          toast.success(`📍 ${addr.split(',').slice(0, 2).join(',')}`);
        }).catch(() => onChange({ ...value, lat, lng, distance: dist }));
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; venueMarkerRef.current = null; }
    };
  }, [showMap]);

  const placeMarker = (map, lat, lng) => {
    if (venueMarkerRef.current) {
      venueMarkerRef.current.setLatLng([lat, lng]);
    } else {
      venueMarkerRef.current = L.marker([lat, lng], { icon: blueIcon(), draggable: true })
        .addTo(map).bindPopup('Your Venue');
      venueMarkerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const dist = haversineKm(pos.lat, pos.lng, KATEEL_LAT, KATEEL_LNG);
        nominatimReverse(pos.lat, pos.lng).then((r) => {
          const addr = r.display_name || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
          setQuery(addr);
          onChange({ address: addr, lat: pos.lat, lng: pos.lng, distance: dist });
        }).catch(() => onChange({ ...value, lat: pos.lat, lng: pos.lng, distance: dist }));
      });
    }
    map.panTo([lat, lng]);
  };

  const handleQueryChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 3) return;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try { setSuggestions(await nominatimSearch(v)); } catch { }
      finally { setSearching(false); }
    }, 500);
  };

  const selectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
    setQuery(item.display_name);
    setSuggestions([]);
    onChange({ address: item.display_name, lat, lng, distance: dist });
    if (mapRef.current) placeMarker(mapRef.current, lat, lng);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await nominatimSearch(query);
      if (results.length > 0) {
        selectSuggestion(results[0]);
        setShowMap(true);
      } else {
        toast.error('No location found. Try a different search.');
      }
    } catch { toast.error('Search failed. Try again.'); }
    finally { setSearching(false); }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const dist = haversineKm(lat, lng, KATEEL_LAT, KATEEL_LNG);
      try {
        const r = await nominatimReverse(lat, lng);
        const address = r.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setQuery(address);
        setShowMap(true);
        onChange({ address, lat, lng, distance: dist });
        if (mapRef.current) placeMarker(mapRef.current, lat, lng);
        toast.success(`📍 ${dist} km from Kateel. Change venue by clicking map or searching above.`);
      } catch {
        onChange({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng, distance: dist });
      }
      setLocating(false);
    }, () => { setLocating(false); toast.error('Could not get location.'); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  return (
    <div className="space-y-3">
      <label className="text-label-lg text-primary block">Venue Location *</label>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input className="input-field w-full" placeholder="Search venue address or landmark..." value={query} onChange={handleQueryChange} autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          />
          {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
          {suggestions.length > 0 && (
            <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button type="button" className="w-full text-left px-4 py-3 text-label-md text-on-surface hover:bg-secondary-container transition-colors border-b border-outline-variant/50 last:border-0" onClick={() => selectSuggestion(s)}>
                    <span className="material-symbols-outlined text-primary text-sm align-middle mr-1">location_on</span>
                    <span className="font-semibold">{s.name || s.display_name.split(',')[0]}</span>
                    <span className="text-on-surface-variant ml-1">{s.display_name.split(',').slice(1, 3).join(',')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Search button */}
        <button type="button" onClick={handleSearch} disabled={searching || !query.trim()}
          title="Search location"
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-lg hover:bg-on-primary-fixed-variant transition-all disabled:opacity-50">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span className="hidden sm:inline">Search</span>
        </button>
        <button type="button" onClick={handleCurrentLocation} disabled={locating} title="Use my current location"
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-secondary-container text-primary rounded-lg text-label-lg hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50">
          {locating ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[18px]">my_location</span>}
          <span className="hidden sm:inline">{locating ? 'Locating...' : 'My Location'}</span>
        </button>
        <button type="button" onClick={() => setShowMap(s => !s)} title="Open map to select venue"
          className={`flex-shrink-0 px-3 py-2 rounded-lg border transition-all ${showMap ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-secondary-container hover:text-primary'}`}>
          <span className="material-symbols-outlined text-[18px]">map</span>
        </button>
      </div>

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

      {showMap && (
        <div className="rounded-xl overflow-hidden border border-outline-variant shadow-md">
          <div ref={mapContainerRef} style={{ height: '320px', width: '100%' }} />
          <div className="p-3 bg-surface-container-low text-label-md text-on-surface-variant flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">info</span>
            Click map to set your <strong>event venue</strong>. Drag blue pin to adjust.
            <span className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1"><span style={{display:'inline-block',width:10,height:10,background:'#dc2626',borderRadius:'50%'}} /> Kateel</span>
              <span className="flex items-center gap-1"><span style={{display:'inline-block',width:10,height:10,background:'#2563eb',borderRadius:'50%'}} /> Venue</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
