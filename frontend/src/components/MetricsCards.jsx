// src/components/MetricsCards.jsx
import React from 'react';

const MetricsCards = ({ events }) => {
  const total = events.length;
  const fires = events.filter(e => e.label === 'fire').length;
  const smokes = events.filter(e => e.label === 'smoke').length;
  const highConfidence = events.filter(e => Math.max(...e.detections.map(d => d.confidence)) > 0.7).length;

  return (
    <div className="row mb-4">
      <div className="col-md-3 mb-2">
        <div className="card shadow-sm transition-all p-3" style={{borderLeft: '5px solid var(--primary)'}}>
          <h5>Total Events</h5>
          <h3>{total}</h3>
        </div>
      </div>
      <div className="col-md-3 mb-2">
        <div className="card shadow-sm transition-all p-3" style={{borderLeft: '5px solid var(--danger)'}}>
          <h5>Fires</h5>
          <h3>{fires}</h3>
        </div>
      </div>
      <div className="col-md-3 mb-2">
        <div className="card shadow-sm transition-all p-3" style={{borderLeft: '5px solid var(--warning)'}}>
          <h5>Smoke</h5>
          <h3>{smokes}</h3>
        </div>
      </div>
      <div className="col-md-3 mb-2">
        <div className="card shadow-sm transition-all p-3" style={{borderLeft: '5px solid var(--success)'}}>
          <h5>High Confidence Events</h5>
          <h3>{highConfidence}</h3>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;