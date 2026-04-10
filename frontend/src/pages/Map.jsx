import { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiMapPin } from "react-icons/fi";

// Custom icons to fix Leaflet issue with React
const fireIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const smokeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultCenter = [51.505, -0.09]; // Fallback center

const MapView = () => {
  const [detections, setDetections] = useState([]);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const res = await axios.get("https://fire-detection-using-yolov8.onrender.com/api/detections");
        const data = res.data.filter(d => d.lat && d.lng); // Only map items with coordinates
        setDetections(data);
        
        if (data.length > 0) {
          // Center map on latest detection
          setCenter([data[0].lat, data[0].lng]);
        }
      } catch (err) {
        console.error("Map data fetch error:", err);
      }
    };
    fetchDetections();
    const interval = setInterval(fetchDetections, 15000); // 15s refresh for map
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      <div className="flex items-center">
        <div className="p-3 bg-surface rounded-xl mr-4 border border-border-subtle">
          <FiMapPin className="text-accent w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Live Alert Map</h1>
          <p className="text-text-muted">Spatial distribution of real-time fire and smoke detections.</p>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl relative z-0">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", backgroundColor: "#1f2937" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {detections.map(d => (
            <Marker 
              key={d._id} 
              position={[d.lat, d.lng]} 
              icon={d.label === "fire" ? fireIcon : smokeIcon}
            >
              <Popup className="custom-popup">
                <div className="text-center p-1">
                  <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded ${
                    d.label === "fire" ? "bg-accent text-white" : "bg-warning text-white"
                  } mb-2`}>
                    {d.label}
                  </span>
                  <p className="font-semibold text-gray-800 mt-1">{(d.confidence * 100).toFixed(1)}% Confidence</p>
                  <p className="text-xs text-text-muted mt-1">{new Date(d.timestamp).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Map overlay legend */}
        <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur border border-border-subtle p-4 rounded-2xl z-[400] shadow-xl">
          <h4 className="text-text-main text-sm font-bold mb-3 uppercase tracking-wider">Legend</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-accent mr-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <span className="text-text-muted text-sm font-semibold">Fire Detected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-warning mr-2 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              <span className="text-text-muted text-sm font-semibold">Smoke Detected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
