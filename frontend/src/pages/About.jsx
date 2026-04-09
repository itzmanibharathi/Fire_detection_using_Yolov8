// src/pages/About.jsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const About = () => {
  return (
    <div className="about-page py-5">
      <Container>
        {/* Hero Section */}
        <Row className="justify-content-center text-center mb-5">
          <Col lg={8}>
            <h1 className="display-4 fw-bold mb-3 text-primary">FireWatch</h1>
            <p className="lead text-muted mb-4">
              Real-time Fire & Smoke Detection • Intelligent Monitoring • Instant Alerts
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <span className="badge bg-primary px-3 py-2 fs-6">YOLOv8 Powered</span>
              <span className="badge bg-info px-3 py-2 fs-6">Real-time Telegram Alerts</span>
              <span className="badge bg-success px-3 py-2 fs-6">Cloud + MongoDB</span>
            </div>
          </Col>
        </Row>

        {/* Mission / Description */}
        <Card className="border-0 shadow-lg mb-5 overflow-hidden">
          <Card.Body className="p-4 p-md-5">
            <h2 className="fw-bold text-primary mb-4">Our Mission</h2>
            <p className="fs-5 text-secondary mb-4">
              Fire incidents often remain undetected until it's too late — causing devastating losses of life, property, and nature.
            </p>
            <p className="fs-5 text-secondary">
              FireWatch exists to change that. We deliver <strong>fast, accurate, and intelligent real-time detection</strong> of fire and smoke using state-of-the-art AI — giving responders the critical extra minutes needed to act.
            </p>
          </Card.Body>
        </Card>

        {/* System Architecture */}
        <Row className="g-4 mb-5">
          <Col lg={6}>
            <Card className="h-100 border-0 shadow hover-lift">
              <Card.Body className="p-4">
                <h3 className="fw-bold text-primary mb-4">How It Works</h3>
                <ul className="list-unstyled fs-5 architecture-list">
                  <li><i className="fas fa-video me-3 text-primary"></i>Live camera / video feed</li>
                  <li><i className="fas fa-brain me-3 text-primary"></i>YOLOv8 real-time object detection</li>
                  <li><i className="fas fa-cloud-upload-alt me-3 text-primary"></i>Images & metadata → Cloudinary + MongoDB</li>
                  <li><i className="fab fa-telegram-plane me-3 text-primary"></i>Instant high-confidence alerts via Telegram</li>
                  <li><i className="fas fa-tachometer-alt me-3 text-primary"></i>Interactive dashboard with maps, charts & gallery</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="h-100 border-0 shadow hover-lift">
              <Card.Body className="p-4">
                <h3 className="fw-bold text-primary mb-4">Core Technologies</h3>
                <div className="row g-3 tech-badges">
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">React.js</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">Bootstrap 5</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">Recharts</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">Leaflet Maps</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">Node.js + Express</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">MongoDB</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">YOLOv8 (Ultralytics)</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">Cloudinary</span></div>
                  <div className="col-6 col-md-4"><span className="badge bg-primary-subtle text-primary w-100 py-2">Telegram API</span></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Contact & Developer */}
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow text-center p-4 p-md-5">
              <h3 className="fw-bold text-primary mb-4">Get in Touch</h3>
              
              <div className="mb-4">
                <p className="fs-5 mb-2">
                  <i className="fas fa-envelope me-2 text-primary"></i>
                  <a href="mailto:amanibharathi2006@gmail.com" className="text-dark text-decoration-none">
                    amanibharathi2006@gmail.com
                  </a>
                </p>
                <p className="fs-5">
                  <i className="fas fa-phone-alt me-2 text-primary"></i>
                  +91 88381 54112
                </p>
              </div>

              <hr className="my-4 w-50 mx-auto" />

              <h4 className="fw-bold text-primary mb-3">Developer</h4>
              <h5 className="mb-2">Manibharathi A</h5>
              <p className="text-muted mb-1">AI Model • Automation • Backend</p>
              <p className="text-muted">UI/UX Design • Frontend Development</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;