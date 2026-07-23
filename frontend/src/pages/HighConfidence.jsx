// src/pages/HighConfidence.jsx (updated to use events)
import React, { useEffect, useState } from 'react';
import { fetchDetections } from '../api';

function groupDetections(detections) {
  // Same as above
  const events = [];
  const sorted = [...detections].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let currentEvent = null;

  for (let d of sorted) {
    const dTime = new Date(d.timestamp);
    if (!currentEvent ||
        dTime - new Date(currentEvent.start) > 60000 ||
        d.location !== currentEvent.location ||
        d.label !== currentEvent.label) {
      if (currentEvent) events.push(currentEvent);
      currentEvent = {
        start: d.timestamp,
        end: d.timestamp,
        label: d.label,
        location: d.location,
        latitude: d.latitude,
        longitude: d.longitude,
        confidence: d.confidence,
        images: [d.image_url],
        detections: [d]
      };
    } else {
      currentEvent.end = d.timestamp;
      currentEvent.confidence = Math.max(currentEvent.confidence, d.confidence);
      currentEvent.images.push(d.image_url);
      currentEvent.detections.push(d);
    }
  }
  if (currentEvent) events.push(currentEvent);
  return events;
}

const HighConfidence = () => {
  const [detections, setDetections] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchDetections();
      setDetections(data);
      setEvents(groupDetections(data));
    };
    getData();
    const interval = setInterval(getData, 5000);
    return () => clearInterval(interval);
  }, []);

  const highConf = events.filter(e => e.confidence > 0.7);

  return (
    <div>
      <h2>High Confidence Alerts (Events)</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Label</th>
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Lat/Lng</th>
              <th>Confidence</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            {highConf.map(e => (
              <tr key={e.start + e.location} className={e.confidence > 0.85 ? 'table-danger' : ''}>
                <td>{e.label}</td>
                <td>{new Date(e.start).toLocaleString()}</td>
                <td>{new Date(e.end).toLocaleString()}</td>
                <td>{e.location}</td>
                <td>{e.latitude}, {e.longitude}</td>
                <td>{(e.confidence*100).toFixed(1)}%</td>
                <td>{e.images.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HighConfidence;