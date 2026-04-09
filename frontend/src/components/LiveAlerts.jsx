// src/components/LiveAlerts.jsx (updated to use events, highAlerts on max conf)
import React, { useState } from 'react';

const LiveAlerts = ({ events }) => { // Pass events
  const [sound, setSound] = useState(true);
  const highAlerts = events.filter(e => e.confidence >= 0.8);

  return (
    <div className="mb-4">
      <h5>Live Alerts <button className="btn btn-sm btn-outline-primary ms-2 transition-all" onClick={()=>setSound(!sound)}>
        {sound ? 'Sound On' : 'Sound Off'}
      </button></h5>
      <div className="list-group" style={{maxHeight:'200px', overflowY:'auto'}}>
        {highAlerts.map(e => (
          <div key={e.start + e.location} className={`list-group-item ${e.confidence > 0.85 ? 'list-group-item-danger' : 'list-group-item-warning'} mb-1`}>
            <strong>{e.label.toUpperCase()}</strong> - {e.location} <br/>
            Confidence: {(e.confidence*100).toFixed(1)}% <br/>
            {new Date(e.start).toLocaleString()} - {new Date(e.end).toLocaleString()}
          </div>
        ))}
        {highAlerts.length===0 && <div className="text-muted p-2">No high confidence alerts</div>}
      </div>
    </div>
  );
};

export default LiveAlerts;