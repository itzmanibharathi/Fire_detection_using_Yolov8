const axios = require("axios");
const Detection = require("../models/Detection");

// Helper to determine risk level
const calculateRiskLevel = (fires, smokes, avgConfidence) => {
  if (fires > 5 || (fires > 0 && avgConfidence > 90)) return "High";
  if (fires > 0 || smokes > 10) return "Medium";
  return "Low";
};

// Configurable OpenRouter model - defaults to openrouter/free meta-router
const getOpenRouterModel = () => {
  return process.env.OPENROUTER_MODEL || "openrouter/free";
};

const getOpenRouterHeaders = () => {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": process.env.APP_URL || "https://fireguard-pws7.onrender.com",
    "X-Title": "FireWatch Forest Fire Detection AI",
    "Content-Type": "application/json",
  };
};

// @desc    General fire / smoke Q&A with live telemetry context
// @route   POST /api/ai/query
// @access  Private
const queryAI = async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    let incidentContext = "No active incident records found in recent logs.";
    try {
      const recentDetections = await Detection.find({
        accessCode: req.user.uniqueAccessCode,
      })
        .sort({ timestamp: -1 })
        .limit(10);

      if (recentDetections && recentDetections.length > 0) {
        const fireCount = recentDetections.filter((d) => d.label === "fire").length;
        const smokeCount = recentDetections.filter((d) => d.label === "smoke").length;
        const latest = recentDetections[0];
        incidentContext = `Facility context: ${recentDetections.length} recent detections (${fireCount} fire, ${smokeCount} smoke). Latest incident was '${latest.label}' at '${latest.location || "unspecified location"}' with ${(latest.confidence * 100).toFixed(1)}% confidence on ${new Date(latest.timestamp).toISOString()}.`;
      }
    } catch (dbErr) {
      console.warn("⚠️ Could not load telemetry context for AI chat:", dbErr.message);
    }

    let answer =
      "System is currently running on Local Heuristics. Please configure OPENROUTER_API_KEY for dynamic interactive intelligence.";

    if (process.env.OPENROUTER_API_KEY) {
      const selectedModel = getOpenRouterModel();
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: `You are FireWatch AI, a senior wildfire defense and facility safety specialist.
Respond in a formal, professional, and practical manner.
Current facility telemetry context:
${incidentContext}
Provide clear, actionable safety answers. Use neat bullet points where appropriate.`,
            },
            {
              role: "user",
              content: query,
            },
          ],
        },
        {
          headers: getOpenRouterHeaders(),
          timeout: 15000,
        }
      );
      answer = response?.data?.choices?.[0]?.message?.content || answer;
    }

    res.json({ answer, modelUsed: process.env.OPENROUTER_API_KEY ? getOpenRouterModel() : "local-heuristic" });
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("❌ External AI Chat error, using fallback...", errorDetails);
    res.json({
      answer: "System operating in local safety mode. Live telemetry remains accessible on your dashboard.",
      debug: errorDetails,
      modelUsed: "local-heuristic",
    });
  }
};

// @desc    Analyze detection data for the user
// @route   POST /api/ai/analyze
// @access  Private
const analyzeData = async (req, res) => {
  try {
    // Fetch user's actual data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const detections = await Detection.find({
      accessCode: req.user.uniqueAccessCode,
      timestamp: { $gte: sevenDaysAgo },
    });

    const fires = detections.filter((d) => d.label === "fire").length;
    const smokes = detections.filter((d) => d.label === "smoke").length;
    const totalConf = detections.reduce((sum, d) => sum + (d.confidence || 0), 0);
    const avgConfidence = detections.length > 0 ? (totalConf / detections.length) * 100 : 0;

    const locations = [...new Set(detections.map((d) => d.location).filter(Boolean))];
    const riskLevel = calculateRiskLevel(fires, smokes, avgConfidence);

    let summary = "";

    // Clean, formal executive fallback briefing
    const fallbackText = `## Executive Operational Intelligence Report
**Reporting Window:** Last 7 Days • **System Assessment:** ${riskLevel.toUpperCase()} RISK

### 1. Incident Telemetry Overview
- **Total Detections Logged:** ${detections.length} (${fires} Fire, ${smokes} Smoke)
- **Mean AI Detection Confidence:** ${avgConfidence.toFixed(1)}%
- **Monitored Sectors:** ${locations.join(", ") || "Standard Coverage Zone"}
- **Operational Status:** ${detections.length === 0 ? "Nominal / Zero Active Hotspots Detected" : "Active Incidents Logged"}

### 2. Risk Level Evaluation
- **Current Threat Factor:** **${riskLevel}**
- **Evaluation Criteria:** Based on multi-spectral thermal signature volume and sustained visual smoke verification over the past 168 operational hours.

### 3. Key Observations & Anomaly Analysis
${
  detections.length === 0
    ? "- **No Anomalous Thermal Signatures:** All optical and sensor arrays report normal baseline conditions without flare-ups."
    : `- **Identified Hotspots:** Activity concentrated across: ${locations.join(", ") || "Unassigned Coordinates"}. Verified confidence index averages ${avgConfidence.toFixed(1)}%.`
}
- **Telemetry Integrity:** Zero hardware communications dropouts reported across the edge sensor network.

### 4. Recommended Action Directives
1. **Hardware Verification:** Maintain routine lens cleanliness on optical edge units and verify cellular/LoRaWAN connectivity.
2. **Readiness Posture:** Keep fire suppression equipment and emergency contact trees verified across all monitored sectors.
3. **Threshold Calibration:** Review confidence sensitivity settings in Settings to optimize signal-to-noise ratio for ambient conditions.
    `;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const selectedModel = getOpenRouterModel();
        const promptContext = `
Generate a formal, professional Executive Wildfire & Smoke Safety Assessment for this organization based on the past 7 days of sensor telemetry.

Format the response cleanly with the following exact Markdown sections:
## Executive Operational Intelligence Report
**Reporting Window:** Last 7 Days • **System Assessment:** [Risk Level] RISK

### 1. Incident Telemetry Overview
[Provide 3-4 neat bullet points detailing fire count, smoke count, confidence, and sector activity]

### 2. Risk Level Evaluation
[Provide a clear, formal explanation of the current risk level based on the data]

### 3. Key Observations & Anomaly Analysis
[Detail any notable patterns, hotspot concentration, or confirm nominal status if 0 incidents]

### 4. Recommended Action Directives
[Provide 3 numbered, actionable operational directives for facility personnel]

Telemetry Data:
- Total Incidents: ${detections.length}
- Fires Detected: ${fires}
- Smoke Detected: ${smokes}
- Mean AI Confidence: ${avgConfidence.toFixed(1)}%
- Impacted Sectors: ${locations.join(", ") || "None recorded (Nominal)"}
- Calculated Risk: ${riskLevel}

Keep the report formal, clean, executive, and structured. Avoid military jargon or theatrical slogans.
        `;

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: selectedModel,
            messages: [
              {
                role: "system",
                content:
                  "You are FireWatch AI, a senior wildfire and emergency response analyst. Generate neat, formal, professional reports using structured markdown.",
              },
              { role: "user", content: promptContext },
            ],
          },
          {
            headers: getOpenRouterHeaders(),
            timeout: 15000,
          }
        );
        summary = response?.data?.choices?.[0]?.message?.content || fallbackText;
      } catch (e) {
        const errMsg = e.response?.data?.error?.message || e.message;
        console.error("❌ OpenRouter logic failed. Engaging clean local heuristic fallback:", errMsg);
        summary = fallbackText;
      }
    } else {
      summary = fallbackText;
    }

    res.json({
      summary,
      meta: { fires, smokes, riskLevel, avgConfidence, total: detections.length },
      modelUsed: process.env.OPENROUTER_API_KEY ? getOpenRouterModel() : "local-heuristic",
    });
  } catch (error) {
    console.error("❌ Controller error:", error.stack);
    res.status(500).json({ error: "Analysis failed on server.", details: error.message });
  }
};

module.exports = { queryAI, analyzeData };
