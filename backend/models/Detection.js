const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  accessCode: {
    type: String,
    required: true,
    index: true,
  },
  label: { type: String, required: true }, // fire / smoke
  timestamp: { type: Date, default: Date.now, index: true },
  location: String,
  lat: Number,
  lng: Number,
  confidence: Number,
  image_url: String, // from Cloudinary
});

const Detection = mongoose.model("Detection", detectionSchema, "detections");

module.exports = Detection;
