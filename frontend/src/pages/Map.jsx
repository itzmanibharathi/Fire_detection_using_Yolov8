import { useState, useEffect, useMemo, useRef } from "react";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiMapPin, FiFilter, FiExternalLink, FiLayers, FiEye, FiCompass, FiAlertTriangle } from "react-icons/fi";

// Animated pulse icons for Fire and Smoke
const fireIcon = new L.divIcon({
  className: "custom-fire-marker",
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="position:absolute;width:24px;height:24px;background:rgba(239,68,68,0.4);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;background:#EF4444;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 12px rgba(239,68,68,0.9);"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const smokeIcon = new L.divIcon({
  className: "custom-smoke-marker",
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="position:absolute;width:24px;height:24px;background:rgba(245,158,11,0.4);border-radius:50%;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;background:#F59E0B;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 12px rgba(245,158,11,0.9);"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Demo coordinates for demonstration if real hardware hasn't broadcasted yet
const SAMPLE_DEMO_INCIDENTS = [
  {
    _id: "demo-1",
    label: "fire",
    confidence: 0.94,
    location: "Sathyamangalam Ridge Sector 4",
    lat: 11.662,
    lng: 77.125,
    timestamp: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1542385151-efd9000785a0?w=600&auto=format&fit=crop&q=80",
    isDemo: true,
  },
  {
    _id: "demo-2",
    label: "smoke",
    confidence: 0.82,
    location: "Western Ghats Buffer Zone B",
    lat: 11.641,
    lng: 77.085,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?w=600&auto=format&fit=crop&q=80",
    isDemo: true,
  },
];

const DEFAULT_CENTER = [11.65, 77.1];

// Internal map controller to guarantee correct resizing & smooth recentering
function MapController({ center, detections }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  // Fix Leaflet container size after layout mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  // Center/Fit to detections on load
  useEffect(() => {
    if (detections && detections.length > 0) {
      if (detections.length === 1) {
        map.flyTo([detections[0].lat, detections[0].lng], 13, { duration: 1.2 });
      } else {
        const bounds = L.latLngBounds(detections.map((d) => [d.lat, d.lng]));
        if (bounds.isValid() && !hasCenteredRef.current) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
          hasCenteredRef.current = true;
        }
      }
    } else if (center) {
      map.setView(center, 12);
    }
  }, [detections, center, map]);

  return null;
}

const TILE_LAYERS = {
  dark: {
    name: "Dark Theme (CartoDB)",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    name: "Standard OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "ESRI Satellite Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "abc",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
};

const MapView = () => {
  const [realDetections, setRealDetections] = useState([]);
  const [showDemoIfEmpty, setShowDemoIfEmpty] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const [activeTileKey, setActiveTileKey] = useState("dark");
  const [loading, setLoading] = useState(true);

  const fetchDetections = async () => {
    try {
      const res = await api.get("/api/detections");
      const normalized = (res.data || [])
        .map((d) => {
          const lat = Number(d.lat !== undefined ? d.lat : d.latitude);
          const lng = Number(d.lng !== undefined ? d.lng : d.longitude);
          return { ...d, lat, lng };
        })
        .filter(
          (d) =>
            !isNaN(d.lat) &&
            !isNaN(d.lng) &&
            d.lat >= -90 &&
            d.lat <= 90 &&
            d.lng >= -180 &&
            d.lng <= 180 &&
            !(d.lat === 0 && d.lng === 0)
        );

      setRealDetections(normalized);
    } catch (err) {
      console.error("Failed to fetch map detections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 15000);
    return () => clearInterval(interval);
  }, []);

  // Determine effective dataset: use real database detections if available, otherwise demo sample if enabled
  const effectiveDetections = useMemo(() => {
    if (realDetections.length > 0) return realDetections;
    if (showDemoIfEmpty) return SAMPLE_DEMO_INCIDENTS;
    return [];
  }, [realDetections, showDemoIfEmpty]);

  // Apply UI filters
  const filteredDetections = useMemo(() => {
    return effectiveDetections.filter((d) => {
      const matchesType = filterType === "all" ? true : d.label === filterType;
      const matchesConfidence = (d.confidence || 0) * 100 >= minConfidence;
      return matchesType && matchesConfidence;
    });
  }, [effectiveDetections, filterType, minConfidence]);

  const mapCenter = useMemo(() => {
    if (filteredDetections.length > 0) {
      return [filteredDetections[0].lat, filteredDetections[0].lng];
    }
    return DEFAULT_CENTER;
  }, [filteredDetections]);

  const isShowingDemo = realDetections.length === 0 && showDemoIfEmpty;
  const currentTile = TILE_LAYERS[activeTileKey];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-3">
      {/* Top Banner if showing demo telemetry */}
      {isShowingDemo && (
        <div className="bg-primary/10 border border-primary/30 text-text-main px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <FiCompass className="text-primary w-4 h-4 flex-shrink-0 animate-spin" style={{ animationDuration: "8s" }} />
            <span>
              <strong>Hardware Standby:</strong> Showing <strong>preview simulation pins</strong> because no live hardware telemetry has broadcasted under this access code yet.
            </span>
          </div>
          <button
            onClick={() => setShowDemoIfEmpty(!showDemoIfEmpty)}
            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary font-bold px-3 py-1 rounded-lg transition-colors ml-2"
          >
            {showDemoIfEmpty ? "Hide Preview Pins" : "Show Preview Pins"}
          </button>
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center">
          <div className="p-3 bg-surface rounded-2xl mr-3 border border-border-subtle shadow-sm">
            <FiMapPin className="text-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">Live Alert Map</h1>
            <p className="text-xs text-text-muted">
              Spatial telemetry distribution • <span className="text-primary font-bold">{filteredDetections.length}</span> active marker(s) displayed
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5 bg-surface/90 border border-border-subtle p-2 rounded-2xl shadow-sm backdrop-blur">
          {/* Layer Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <FiLayers className="text-text-muted ml-1" />
            <select
              value={activeTileKey}
              onChange={(e) => setActiveTileKey(e.target.value)}
              className="bg-transparent text-text-main text-xs font-semibold focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="osm">OpenStreetMap</option>
              <option value="satellite">Satellite View</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Incident Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <FiFilter className="text-text-muted" />
            <select
              value={activeTileKey}
              onChange={(e) => setActiveTileKey(e.target.value)}
              className="bg-transparent text-text-main text-xs font-semibold focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="dark">Dark Basemap</option>
              <option value="osm">OpenStreetMap</option>
              <option value="satellite">Satellite View</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border-subtle" />

          {/* Incident Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <FiFilter className="text-text-muted" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-text-main text-xs font-semibold focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="all">All Incidents</option>
              <option value="fire">Fire Only</option>
              <option value="smoke">Smoke Only</option>
            </select>
          </div>

          <div className="h-4 w-px bg-border-subtle hidden sm:block" />

          {/* Confidence Slider */}
          <div className="flex items-center gap-2 text-xs text-text-muted px-1.5">
            <span className="hidden sm:inline">Min Conf:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-16 sm:w-20 accent-primary cursor-pointer"
            />
            <span className="font-mono text-text-main font-bold w-7 text-right">{minConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 w-full bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl relative z-0 min-h-[480px]">
        <MapContainer
          center={mapCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", minHeight: "480px", backgroundColor: "#0b0f19" }}
        >
          <MapController center={mapCenter} detections={filteredDetections} />

          <TileLayer
            key={activeTileKey}
            url={currentTile.url}
            subdomains={currentTile.subdomains}
            attribution={currentTile.attribution}
            maxZoom={19}
          />

          {filteredDetections.map((d) => (
            <Marker key={d._id} position={[d.lat, d.lng]} icon={d.label === "fire" ? fireIcon : smokeIcon}>
              <Popup maxWidth={300} minWidth={240} className="custom-firewatch-popup">
                <div className="p-1 text-left text-gray-900 font-sans">
                  {/* Photo snapshot if present */}
                  {d.image_url ? (
                    <div className="mb-2 rounded-xl overflow-hidden bg-black/80 max-h-36 flex items-center justify-center border border-gray-300">
                      <img
                        src={d.image_url}
                        alt="Incident Snapshot"
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                  {/* Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md text-white ${
                        d.label === "fire" ? "bg-red-600 shadow-sm shadow-red-500/40" : "bg-amber-600 shadow-sm shadow-amber-500/40"
                      }`}
                    >
                      {d.label} DETECTED
                    </span>
                    <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                      {((d.confidence || 0) * 100).toFixed(1)}% Match
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 my-2 text-xs">
                    <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                      <FiMapPin className="text-red-500 flex-shrink-0" />
                      <span className="truncate">{d.location || "Sector Coordinate"}</span>
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      🕒 {d.timestamp ? new Date(d.timestamp).toLocaleString() : "Real-time telemetry"}
                    </p>
                  </div>

                  {/* Footer with Google Maps Navigation */}
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-gray-500">
                      {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${d.lat},${d.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      Google Maps <FiExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend Overlay */}
        <div className="absolute bottom-6 right-6 bg-background/95 backdrop-blur-md border border-border-subtle p-3.5 rounded-2xl z-[400] shadow-2xl">
          <h4 className="text-text-main text-[11px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiEye className="text-primary w-3.5 h-3.5" /> Sensor Overlay
          </h4>
          <div className="space-y-1.5 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-text-main font-semibold">Active Fire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span className="text-text-main font-semibold">Smoke Plume</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;

