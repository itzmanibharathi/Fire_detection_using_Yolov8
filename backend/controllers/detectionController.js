const Detection = require("../models/Detection");
const mongoose = require("mongoose");

// @desc    Get all detections for logged in user
// @route   GET /api/detections
// @access  Private
const getDetections = async (req, res) => {
  try {
    const filters = { accessCode: req.user.uniqueAccessCode };
    
    // Add optional query filters
    if (req.query.label) {
      filters.label = req.query.label;
    }
    
    if (req.query.startDate && req.query.endDate) {
      filters.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const detections = await Detection.find(filters).sort({ timestamp: -1 });
    res.json(detections);
  } catch (err) {
    console.error("Fetch detections error:", err);
    res.status(500).json({ error: "Failed to fetch detections" });
  }
};

// @desc    Create a detection (usually done by Python script directly to MongoDB, but keeping API for completeness)
// @route   POST /api/detections
// @access  Public (Requires checking access code in body if used by script)
const createDetection = async (req, res) => {
  try {
    const { label, location, lat, lng, confidence, accessCode, image_url } = req.body;
    
    if (!accessCode) {
      return res.status(400).json({ error: "Access code is required" });
    }

    const detection = new Detection({
      label,
      location,
      lat,
      lng,
      confidence,
      accessCode,
      image_url,
      timestamp: new Date()
    });
    
    await detection.save();
    res.status(201).json({ message: "Detection saved" });
  } catch (err) {
    console.error("Save detection error:", err);
    res.status(500).json({ error: "Failed to save detection" });
  }
};

module.exports = { getDetections, createDetection };
