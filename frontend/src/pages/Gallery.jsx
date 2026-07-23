// src/pages/Gallery.jsx
import React, { useEffect, useState } from 'react';
import { fetchDetections } from '../api';
import { groupDetections } from '../utils/groupDetections';
import { Accordion } from 'react-bootstrap';

const Gallery = () => {
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

  return (
    <div>
      <h2>Gallery</h2>
      <Accordion>
        {events.map((e, index) => (
          <Accordion.Item key={index} eventKey={index.toString()}>
            <Accordion.Header>
              <strong>{e.label.toUpperCase()} Detected – {new Date(e.eventStartTime).toLocaleTimeString()}</strong>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row g-3">
                {e.images.map((img, idx) => (
                  <div key={idx} className="col-md-3">
                    <img src={img} className="img-fluid rounded shadow-sm" alt="event" />
                  </div>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default Gallery;