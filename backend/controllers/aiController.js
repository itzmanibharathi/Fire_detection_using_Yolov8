const axios = require("axios");
const Detection = require("../models/Detection");

// Helper to determine risk level
const calculateRiskLevel = (fires, smokes, avgConfidence) => {
  if (fires > 5 || (fires > 0 && avgConfidence > 90)) return "High";
  if (fires > 0 || smokes > 10) return "Medium";
  return "Low";
};

// @desc    General fire / smoke Q&A
// @route   POST /api/ai/query
// @access  Private
const queryAI = async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    let answer = "System is currently running on Local Heuristics due to missing API configurations. Ask about generic parameters, check the dashboard, or connect a valid LLM API key for interactive intelligence.";
    
    if (process.env.OPENROUTER_API_KEY) {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a highly analytical fire safety AI assistant. Answer clearly, practically, and briefly."
            },
            {
              role: "user",
              content: query
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );
      answer = response?.data?.choices?.[0]?.message?.content || answer;
    }

    res.json({ answer });
  } catch (error) {
    console.error("❌ External AI Chat error, using fallback...", error.message);
    res.json({ answer: "System offline or API limits reached. Please check the local dashboard for incident details.", debug: error.message });
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
      timestamp: { $gte: sevenDaysAgo }
    });
    
    const fires = detections.filter(d => d.label === 'fire').length;
    const smokes = detections.filter(d => d.label === 'smoke').length;
    const totalConf = detections.reduce((sum, d) => sum + (d.confidence || 0), 0);
    const avgConfidence = detections.length > 0 ? (totalConf / detections.length) * 100 : 0;
    
    const locations = [...new Set(detections.map(d => d.location).filter(Boolean))];
    const riskLevel = calculateRiskLevel(fires, smokes, avgConfidence);

    let summary = '';
    
    // Fallback deterministic 'free' local text engine based on stats
    const fallbackText = `🔥 Local Heuristic Analysis (API Offline)
    
**1. Quick Summary of trends:**
Over the last 7 days, your sensors detected ${fires} fire instances and ${smokes} smoke instances. This represents a ${fires > smokes ? 'fire-dominant' : 'smoke-dominant'} structural pattern.

**2. Current Risk Level analysis (Calculated Base Risk: ${riskLevel}):**
Based on threshold detection volumes, your current environmental risk factor is strictly operating at a **${riskLevel}** level. Confidence aggregation holds stable at ${avgConfidence.toFixed(2)}%.

**3. Anomaly Detection:**
Impacted zones primarily revolve around: ${locations.join(", ") || "No specific active zones"}. 

**4. Preventive Recommendations:**
Ensure sprinkler systems in active sectors are validated. Verify hardware connection endpoints if camera streaming lags. For deeper natural language breakdowns, implement an OpenRouter/OpenAI key in your environment file.
    `;

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const promptContext = `
Analyze this user's latest Fire & Smoke detection data for the past 7 days and provide:
1. Quick Summary of trends.
2. Current Risk Level analysis (Calculated Base Risk: ${riskLevel}).
3. Anomaly Detection (Any unusual patterns?).
4. Preventive Recommendations.

Data points:
- Fires Detected: ${fires}
- Smoke Detected: ${smokes}
- Average AI Confidence: ${avgConfidence.toFixed(2)}%
- Impacted Locations: ${locations.join(", ") || "None recorded"}
        `;

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-4o",
            messages: [{ role: "user", content: promptContext }]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json"
            },
            timeout: 12000
          }
        );
        summary = response?.data?.choices?.[0]?.message?.content || fallbackText;
      } catch (e) {
        console.error("❌ OpenRouter logic failed. Engaging free local heuristic fallback.", e.message);
        summary = fallbackText;
      }
    } else {
      summary = fallbackText;
    }

    // ALWAYS return meta so PieCharts and Visuals render flawlessly on the Frontend GUI
    res.json({ summary, meta: { fires, smokes, riskLevel, avgConfidence } });
  } catch (error) {
    console.error("❌ Controller error:", error.stack);
    res.status(500).json({ error: "Analysis failed on server.", details: error.message, stack: error.stack });
  }
};

module.exports = { queryAI, analyzeData };
