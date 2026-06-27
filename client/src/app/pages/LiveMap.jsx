import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/RecordsContext";
import Map from "../components/Map";
import { PlusCircle, X, Search, Locate } from "lucide-react";
import L from "leaflet";

export default function LiveMap() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [pinMode, setPinMode] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const showToast = (message, type = "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  // Wait for map instance to be ready
  useEffect(() => {
    if (mapRef.current) {
      setMap(mapRef.current);
    }
  }, [mapRef.current]);

  // Search incidents by title/description
  const filtered = records.filter((i) => {
    const term = search.toLowerCase();
    return (
      i.title?.toLowerCase().includes(term) ||
      i.description?.toLowerCase().includes(term)
    );
  });

  const isWithinKenya = (lat, lng) => {
    const minLat = -4.7;
    const maxLat = 5.2;
    const minLng = 33.9;
    const maxLng = 41.9;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  };

  const handleLocationPin = (coords) => {
    if (!pinMode) return;
    const [lat, lng] = coords;
    if (!isWithinKenya(lat, lng)) {
      showToast("Location must be within Kenya. Please click inside Kenya.", "warning");
      return;
    }
    setPinnedLocation(coords);
  };

  const handleReportHere = () => {
    navigate("/home/report", { state: { location: pinnedLocation } });
  };

  // Place search (geocoding)
  const [placeQuery, setPlaceQuery] = useState("");
  const handlePlaceSearch = async () => {
    if (!placeQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeQuery)}&limit=1&countrycodes=ke`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        if (map) {
          map.flyTo([parseFloat(lat), parseFloat(lon)], 14);
        } else {
          console.warn("Map not ready");
        }
      } else {
        showToast("Location not found in Kenya. Please try a place within Kenya.", "warning");
      }
    } catch (err) {
      console.error(err);
      showToast("Search failed. Please try again.", "error");
    }
  };

  // Locate user
  const handleLocate = () => {
    if (!map) return;
    map.locate({ setView: true, maxZoom: 15 })
      .on("locationfound", (e) => {
        L.marker(e.latlng)
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();
      })
      .on("locationerror", () => {
        showToast("Location access denied or unavailable.", "error");
      });
  };

  return (
    <div className="h-full w-full flex flex-col">
      
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search incidents by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search location (e.g., Kisumu)"
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch()}
            className="w-48 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <button
            onClick={handlePlaceSearch}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all"
          >
            Go
          </button>
        </div>

        <button
          onClick={handleLocate}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-all"
          title="Locate me"
        >
          <Locate size={18} />
        </button>

        <button
          onClick={() => { setPinMode(!pinMode); setPinnedLocation(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            pinMode
              ? "bg-blue-600 text-white shadow-blue-500/30"
              : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500"
          }`}
        >
          <PlusCircle size={16} />
          {pinMode ? "Click map to pin" : "Pin Incident"}
        </button>
      </div>

      
      <div className="flex-1 relative z-0">
        <Map
          ref={mapRef}
          incidents={filtered}
          onSelect={setSelected}
          onLocationSelect={handleLocationPin}
          selectedLocation={pinnedLocation}
        />

        
        {toast.visible && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[2000] transition-all duration-300 ease-in-out">
            <div className={`px-6 py-3 rounded-xl shadow-lg text-sm font-bold ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }`}>
              {toast.message}
            </div>
          </div>
        )}

        
        {pinnedLocation && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl shadow-2xl w-64 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-black text-sm uppercase tracking-widest">Location Pinned</p>
              <button onClick={() => setPinnedLocation(null)}>
                <X size={16} className="text-slate-400 hover:text-slate-900 dark:hover:text-white" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pinnedLocation[0].toFixed(5)}, {pinnedLocation[1].toFixed(5)}
            </p>
            <button
              onClick={handleReportHere}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle size={16} /> Report Here
            </button>
          </div>
        )}

        
        {selected && !pinnedLocation && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl shadow-2xl w-64 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm">{selected.title}</h3>
              <button onClick={() => setSelected(null)}>
                <X size={16} className="text-slate-400 hover:text-slate-900 dark:hover:text-white" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                selected.type === "red flag"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-blue-500/10 text-blue-500"
              }`}>
                {selected.type}
              </span>
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                selected.status === "pending"
                  ? "bg-orange-500/10 text-orange-500"
                  : selected.status === "under investigation"
                  ? "bg-purple-500/10 text-purple-500"
                  : selected.status === "rejected"
                  ? "bg-red-600/10 text-red-600"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}>
                {selected.status}
              </span>
            </div>
            <button
              onClick={() => navigate(`/home/incident/${selected.id}`)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all"
            >
              View Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}