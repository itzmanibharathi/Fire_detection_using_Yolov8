const express = require('express');
const router = express.Router();
const Detection = require('../models/Detection');

// GET /api/detections
router.get('/', async (req, res) => {
  try {
    const detections = await Detection.find().sort({ timestamp: -1 });
    res.json(detections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;