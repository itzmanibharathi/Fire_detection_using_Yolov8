// src/components/ImageGallery.jsx (updated to use events, show accordion like Gallery)
import React from 'react';
import { Accordion } from 'react-bootstrap';

const ImageGallery = ({ events }) => { // Pass events
  return (
    <div className="mb-4">
      <h5>Gallery</h5>
      <Accordion>
        {events.map((e, index) => (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header>
              <div>
                <strong>{e.label.toUpperCase()} at {e.location}</strong><br />
                <small>{new Date(e.start).toLocaleString()} - {new Date(e.end).toLocaleString()}</small><br />
                <small>Confidence: {(e.confidence * 100).toFixed(1)}% | Images: {e.images.length}</small>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row">
                {e.images.map((img, imgIndex) => (
                  <div key={imgIndex} className="col-md-3 mb-3">
                    <img src={img} className="img-fluid rounded" alt={`${e.label} image ${imgIndex + 1}`} />
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

export default ImageGallery;