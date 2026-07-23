// src/pages/MapView.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { fetchDetections } from '../api';
import { groupDetections } from '../utils/groupDetections';

const MapView = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchDetections();
      setEvents(groupDetections(data));
    };
    getData();
    const interval = setInterval(getData, 5000);
    return () => clearInterval(interval);
  }, []);

  const validEvents = events.filter(e => e.eventLocation);

  return (
    <div>
      <h2>Map View</h2>
      <MapContainer center={[11.0055, 76.9661]} zoom={10} style={{ height: '600px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {validEvents.map((e, idx) => (
          <CircleMarker
            key={idx}
            center={[e.eventLocation.lat, e.eventLocation.lng]}
            radius={10}
            color={e.label === 'fire' ? 'var(--danger)' : 'var(--warning)'}
            fillOpacity={0.6}
          >
            <Tooltip>
              <strong>{e.label.toUpperCase()}</strong><br />
              {new Date(e.eventStartTime).toLocaleString()}<br />
              Conf: {(Math.max(...e.detections.map(d => d.confidence)) * 100).toFixed(1)}%
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;