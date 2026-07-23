const express = require("express");
const { queryAI, analyzeData } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/query", protect, queryAI);
router.post("/analyze", protect, analyzeData);

module.exports = router;
