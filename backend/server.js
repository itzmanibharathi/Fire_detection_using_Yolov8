const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Route imports
const authRoutes = require("./routes/authRoutes");
const detectionRoutes = require("./routes/detectionRoutes");
const aiRoutes = require("./routes/aiRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fire_detection";

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log(`✅ MongoDB connected (${mongoUri})`))
  .catch((err) =>
    console.error("❌ MongoDB connection warning (will retry on requests if database is started):", err.message)
  );

/* =========================
   API Routes Mount
========================= */

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Fire Detection SaaS Backend Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/detections", detectionRoutes);
app.use("/api/ai", aiRoutes);

// Compatibility redirect for earlier tests
app.get('/api/test-openrouter', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o',
        messages: [{ role: 'user', content: 'Test connection. Respond with "OpenRouter connected".' }]
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' }
      }
    );
    const result = response?.data?.choices?.[0]?.message?.content || 'No response';
    res.json({ message: 'OpenRouter connected', result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to OpenRouter', details: err.message });
  }
});

/* =========================
   Server Start
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
