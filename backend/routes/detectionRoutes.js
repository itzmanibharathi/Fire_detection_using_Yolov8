const express = require("express");
const { getDetections, createDetection } = require("../controllers/detectionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDetections);
router.post("/", createDetection); // Kept unprotected if devices without JWT need to post (they provide accessCode in body)

module.exports = router;
