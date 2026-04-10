// src/components/DetectionTable.jsx (updated to show events)
import React, { useState } from 'react';

const DetectionTable = ({ events }) => { // Pass events
  const [search, setSearch] = useState('');

  const filtered = events.filter(e =>
    e.label.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-4">
      <h5>Event Table</h5>
      <input type="text" className="form-control mb-2" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search events" />
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Label</th>
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Lat / Lng</th>
              <th>Confidence</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.start + e.location}>
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

export default DetectionTable;