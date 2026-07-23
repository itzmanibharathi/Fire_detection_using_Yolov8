// src/components/InteractiveMap.jsx (updated to use events)
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const InteractiveMap = ({ events }) => { // Pass events
  const position = [11.0055, 76.9661];
  return (
    <div className="mb-4">
      <h5>Map View</h5>
      <MapContainer center={position} zoom={12} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map(e => (
          <CircleMarker
            key={e.start + e.location}
            center={[e.latitude, e.longitude]}
            radius={10}
            pathOptions={{ color: e.label === 'fire' ? 'var(--danger)' : 'var(--warning)' }}
          >
            <Popup>
              <strong>{e.label.toUpperCase()}</strong><br/>
              {e.location}<br/>
              {new Date(e.start).toLocaleString()} - {new Date(e.end).toLocaleString()}<br/>
              Confidence: {(e.confidence*100).toFixed(1)}%<br/>
              <img src={e.images[0]} alt={`${e.label} event`} width="100"/>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;