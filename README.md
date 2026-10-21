# 🔥 FireWatch — Forest Fire Detection & Alert System

A real-time **Fire & Smoke Detection System** powered by **YOLOv8**, with a **React 19** dashboard for monitoring, analytics, AI-driven insights, and **Telegram** alerting.

**Live Application:** <https://fireguard-pws7.onrender.com/login>

---

## 🚨 Project Overview

FireWatch continuously monitors camera feeds using YOLOv8 computer vision to detect **fire** and **smoke** in real time.

When a detection occurs:

1. A snapshot is captured and uploaded to **Cloudinary**.
2. The incident (label, confidence, location, timestamp, image URL) is stored in **MongoDB**.
3. A **Telegram alert** is sent with the image, location, confidence, and a Google Maps link.
4. The **React dashboard** displays live metrics, history, an interactive map, and AI-powered risk analysis.

Each organization registers an account on the dashboard, receives a **unique access code**, and configures their edge detection scripts with that code so incidents route to the correct dashboard.

---

## 🧠 Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🔥 Real-time Fire/Smoke Detection | ✅ Implemented | YOLOv8 model analyzes video feed, draws bounding boxes, triggers alerts above a configurable confidence threshold. |
| 📩 Telegram Alerts | ✅ Implemented | Sends snapshot photo + location + timestamp + confidence to a Telegram chat via the Bot API. |
| 🗺️ Interactive Alert Map | ✅ Implemented | Leaflet map (CartoDB dark tiles) with pulsing markers for fire (red) and smoke (amber). |
| 🖼️ Live Detection Gallery | ✅ Implemented | Dashboard shows the 8 most recent detections with image, label, confidence badge, and location. |
| 📊 Analytics Dashboard | ✅ Implemented | Area chart (confidence trends), pie chart (fire vs. smoke ratio), stat cards (fire/smoke counts, average confidence). |
| 🔎 AI-Powered Insights | ✅ Implemented | Uses OpenRouter LLM API for risk assessment and Q&A. Falls back to a local heuristic engine when no API key is configured. |
| 📋 Detection History | ✅ Implemented | Filterable table with date range and label filter, CSV export. |
| 🔐 Authentication | ✅ Implemented | JWT-based registration + login. Passwords hashed with bcrypt. Each user gets a unique access code for hardware linking. |
| ⚙️ Settings | ✅ Implemented | Profile editing, password change, hardware access code display. |
| 🌓 Theme Support | ✅ Implemented | Dark theme with CSS custom properties. |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| AI Model | YOLOv8 (Ultralytics) + OpenCV |
| Backend API | Node.js, Express 5 |
| Frontend | React 19, Vite 7, Tailwind CSS 4 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Image Storage | Cloudinary |
| Map | Leaflet + React-Leaflet (CartoDB dark tiles via OpenStreetMap) |
| Charts | Recharts |
| Alerts | Telegram Bot API |
| AI Insights | OpenRouter API (configurable model, defaults to `openai/gpt-4o`) |
| Auth | JSON Web Tokens (jsonwebtoken) + bcryptjs |
| Deployment | Render (separate services for frontend and backend) |

---

## 📁 Directory Structure

```
Fire_detection_using_Yolov8-main/
├── AI_model/                    # Python edge detection script
│   ├── alert.py                 # Main detection loop + Telegram + MongoDB
│   ├── dummy.py                 # Script to insert a test detection record
│   ├── best.pt                  # Trained YOLOv8 weights
│   ├── a.mp4                    # Sample test video
│   ├── alert.mp3                # Audible alert sound
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment template
├── backend/                     # Node.js Express API
│   ├── server.js                # App entry point, MongoDB connection, route mounting
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile, password
│   │   ├── detectionController.js # CRUD for detections
│   │   └── aiController.js      # OpenRouter AI query + analysis
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification middleware
│   ├── models/
│   │   ├── User.js              # Mongoose user schema (bcrypt pre-save hook)
│   │   └── Detection.js         # Mongoose detection schema
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── detectionRoutes.js   # /api/detections (protected GET, open POST)
│   │   └── aiRoutes.js          # /api/ai/* (protected)
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example             # Environment template
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── pages/               # Register, Login, Dashboard, History, Map, Insights, Settings
│   │   ├── components/          # Sidebar, Layout, UI primitives (Card, Modal)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── utils/api.js         # Axios instance with base URL resolver
│   │   └── hooks/               # useAlertLoop
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example             # Environment template
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9 (for the AI model edge script)
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account (for image uploads from the AI model)
- **Telegram Bot** (optional — for alert notifications)
- **OpenRouter API key** (optional — for AI insights; free-tier models available)

---

## 🚀 Local Installation & Startup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/Fire_detection_using_Yolov8-main.git
cd Fire_detection_using_Yolov8-main
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in MONGO_URI, JWT_SECRET, and optionally OPENROUTER_API_KEY
npm install
npm run dev          # Starts on http://localhost:5000 (nodemon)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# For local dev, you can leave VITE_BACKEND_URL blank (defaults to http://localhost:5000)
npm install
npm run dev          # Starts on http://localhost:5173
```

Open <http://localhost:5173/register> to create an account.

### 4. AI Model (Edge Detection Script)

```bash
cd AI_model
pip install -r requirements.txt
cp .env.example .env
# Edit .env — fill in MONGO_URI, Cloudinary credentials, Telegram token/chat ID,
# USER_ACCESS_CODE (from your dashboard Settings page), and location coordinates
python alert.py
```

This opens a video window running YOLOv8 inference. Press `q` to quit.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `DB_NAME` | No | Database name (default: `firewatch`) |
| `COLLECTION_NAME` | No | Detections collection name (default: `detections`) |
| `PORT` | No | Server port (default: `5000`) |
| `JWT_SECRET` | ✅ | Secret for signing JWTs. Use a long random string. |
| `OPENROUTER_API_KEY` | No | Enables AI-powered insights. Get one at <https://openrouter.ai/keys> |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | No | Backend API URL. Omit for local dev (`http://localhost:5000` used automatically). Set for production. |

### AI Model (`AI_model/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string (same cluster as backend) |
| `CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUD_API_KEY` | ✅ | Cloudinary API key |
| `CLOUD_API_SECRET` | ✅ | Cloudinary API secret |
| `TELEGRAM_TOKEN` | No | Telegram bot token (from BotFather) |
| `TELEGRAM_CHAT_ID` | No | Telegram chat/group ID to receive alerts |
| `USER_ACCESS_CODE` | ✅ | Links detections to your dashboard account |
| `LOCATION_NAME` | No | Human-readable site name |
| `LATITUDE` | No | Latitude of the monitoring site |
| `LONGITUDE` | No | Longitude of the monitoring site |
| `CONFIDENCE_THRESHOLD` | No | Minimum confidence to trigger alert (default: `0.7`) |
| `ALERT_COOLDOWN` | No | Seconds between alerts for same label (default: `10`) |

---

## 🔐 Registration & Login Flow

1. **Register** at `/register` — provide full name, email, phone, organization, password, and confirm password.
2. The backend creates a user with a bcrypt-hashed password and a random 12-character `uniqueAccessCode`.
3. A JWT token is returned and stored in `localStorage`.
4. **Login** at `/login` — email + password → JWT token.
5. All protected API endpoints require `Authorization: Bearer <token>`.
6. Copy the access code from **Settings → Hardware Integration** and paste it into your AI model's `.env` file.

---

## 🗄️ Database Schema

### Users Collection

| Field | Type | Notes |
|-------|------|-------|
| `email` | String | Unique, lowercase, trimmed |
| `fullName` | String | Required |
| `phone` | String | Required |
| `organization` | String | Required |
| `password` | String | Bcrypt hash (never stored in plaintext) |
| `uniqueAccessCode` | String | Unique 12-char hex code, generated on registration |
| `createdAt` | Date | Auto-set |

### Detections Collection

| Field | Type | Notes |
|-------|------|-------|
| `accessCode` | String | Links detection to a user account (indexed) |
| `label` | String | `fire` or `smoke` |
| `timestamp` | Date | When the detection occurred (indexed) |
| `location` | String | Human-readable location name |
| `lat` | Number | Latitude |
| `lng` | Number | Longitude |
| `confidence` | Number | 0.0–1.0 |
| `image_url` | String | Cloudinary URL of the captured snapshot |

No migrations are needed — Mongoose creates collections on first write.

---

## 🔥 Fire/Smoke Detection Workflow

1. `alert.py` reads frames from a video source (webcam or file).
2. YOLOv8 (`best.pt`) runs inference on each frame.
3. If a detection's label is in `ALERT_CLASSES` and `confidence ≥ CONFIDENCE_THRESHOLD`:
   - A bounding box is drawn on the frame.
   - The annotated frame is saved locally.
   - An asynchronous thread uploads the image to Cloudinary, stores the record in MongoDB, and sends a Telegram alert.
   - A cooldown timer prevents duplicate alerts for the same label.
4. An audible alert plays through speakers while a detection is active.

### Confidence Score Interpretation

| Confidence | Interpretation |
|-----------|---------------|
| ≥ 90% | High certainty — fire/smoke clearly visible |
| 70–89% | Moderate — likely fire/smoke, may need verification |
| < 70% | Below default threshold — not reported by default |

---

## 📩 Telegram Bot Setup

### Official API Reference

<https://core.telegram.org/bots/api>

### Step-by-step

1. **Create a bot:** Open Telegram, search for [@BotFather](https://t.me/BotFather), send `/newbot`, follow prompts.
2. **Copy the bot token** — BotFather sends it after creation. Keep it private.
3. **Start a conversation** with your bot (search its username and press "Start"), or add it to a group.
4. **Get your chat ID:**
   - Send a message to the bot.
   - Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser.
   - Find `"chat": {"id": 123456789}` in the response — that number is your chat ID.
   - For groups, the chat ID is typically a negative number.
5. **Set environment variables** in `AI_model/.env`:
   ```
   TELEGRAM_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```
6. **Test:** Run `alert.py` with a video containing fire/smoke — you should receive a Telegram message.

### Alert Message Format

```
🚨 FIRE DETECTED!
⏰ 2026-10-21 14:05:22
📍 Forest Sector A
🌍 11.5, 77.2
🔍 Confidence: 91.2%
(Photo attached)
```

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `401 Unauthorized` | Token is invalid or expired — regenerate via BotFather. |
| `400 Bad Request: chat not found` | Start a conversation with the bot first, or verify the chat ID. |
| `403 Forbidden: bot was blocked` | The user blocked the bot — they must unblock and press "Start". |
| Photo upload fails | Verify the Cloudinary URL is accessible. Large files may timeout. |

---

## 🤖 OpenRouter AI Integration

The Insights page uses OpenRouter for AI-powered risk assessment and an interactive fire-safety Q&A chatbot with live facility telemetry context.

### Configuration

1. Get an API key at <https://openrouter.ai/keys>.
2. Set `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL` in `backend/.env`.
3. The system defaults to **`openrouter/free`**, OpenRouter's official zero-cost meta-router that dynamically selects available free models (such as Llama 3.2, Mistral, Gemma, or Qwen) with zero credit card required.

```dotenv
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
```

### Contextual Telemetry Intelligence

Unlike a generic chat, the FireWatch AI assistant automatically queries the database for the user's latest 10 detections and injects live facility context into the assistant's prompt. It can answer questions such as:
- *"What is our fire trend over the last 24 hours?"*
- *"Which sector has had the highest confidence alerts?"*
- *"What safety actions should our response team take right now?"*

### Fallback Behavior

When `OPENROUTER_API_KEY` is not set or the API is unreachable (network timeout / rate limit), the system generates a deterministic **local heuristic analysis** based on real detection statistics (fire count, smoke count, confidence average, impacted locations). The UI dynamically indicates whether the **OpenRouter LLM** or **local-heuristic** engine generated the assessment.

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `401` from OpenRouter | Invalid or expired API key | Regenerate at <https://openrouter.ai/keys> |
| `429 Too Many Requests` | Free-tier rate limit reached (typically 20 req/min, 50 req/day for free accounts) | Wait 60 seconds or use a dedicated model ID |
| `Model not available` | The model ID is incorrect or retired | Set `OPENROUTER_MODEL=openrouter/free` in `.env` |
| Timeout (> 15s) | OpenRouter network delay | The 15s timeout automatically engages the local heuristic fallback |

---

## 🗺️ Map Configuration & Features

The interactive map uses **Leaflet + React-Leaflet** with **CartoDB dark** tiles (served via OpenStreetMap infrastructure), with **zero paid Google Maps API keys required**.

### Features

- **No Paid Maps API Key:** Built on OpenStreetMap & CartoDB dark tiles under open-source attribution.
- **Incident Markers:** Animated pulsing radar dots (Red for Fire, Amber for Smoke).
- **Incident Type Filter:** Switch between *All Incidents*, *Fire Only*, and *Smoke Only*.
- **Confidence Slider:** Filter out low-confidence sensor noise dynamically (0% to 95%).
- **Interactive Popups with Snapshot:** Click any marker to view the captured incident photo, timestamp, exact coordinates, and confidence score.
- **One-Click Google Maps Navigation:** Each popup provides an external link (`https://www.google.com/maps?q=lat,lng`) for field personnel to navigate to coordinates.
- **Coordinate Sanitization:** Automatic validation of latitude (-90° to 90°) and longitude (-180° to 180°), gracefully ignoring null or uncalibrated (0, 0) sensor data.
- **Attribution:** Complies with OpenStreetMap and CartoDB attribution requirements.
- **Default center:** Sathyamangalam forest range, Erode (11.65°N, 77.10°E) — auto-centers on the latest incoming detection.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Login → JWT |
| `GET` | `/api/auth/profile` | Bearer | Get profile |
| `PUT` | `/api/auth/profile` | Bearer | Update profile |
| `PUT` | `/api/auth/password` | Bearer | Change password |

#### Register — Request

```json
{
  "fullName": "Jane Smith",
  "email": "jane@acme.org",
  "phone": "9876543210",
  "organization": "Acme Forest Services",
  "password": "SecurePass123!"
}
```

#### Register — Response (201)

```json
{
  "_id": "6ad872...",
  "email": "jane@acme.org",
  "fullName": "Jane Smith",
  "phone": "9876543210",
  "organization": "Acme Forest Services",
  "uniqueAccessCode": "A1B2C3D4E5F6",
  "token": "eyJhbGci..."
}
```

### Detections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/detections` | Bearer | Get detections for logged-in user (filtered by access code) |
| `POST` | `/api/detections` | No* | Create detection (requires `accessCode` in body — used by edge devices) |

*The POST endpoint is intentionally unprotected so hardware devices without JWT can submit detections using the access code.

### AI Insights

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/analyze` | Bearer | Generate risk assessment from last 7 days of detection data |
| `POST` | `/api/ai/query` | Bearer | Ask a fire-safety question to the AI chatbot |

---

## 🌐 Frontend & Backend URLs

### Local Development

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |

The frontend's `utils/api.js` automatically detects local development and targets `http://localhost:5000`.

### Production (Render)

| Service | URL |
|---------|-----|
| Frontend | `https://fireguard-pws7.onrender.com` |
| Backend | `https://fire-detection-using-yolov8.onrender.com` |

CORS is configured with `app.use(cors())` — all origins allowed.

---

## 🚢 Render Deployment

The project is deployed as **two separate Render services**.

### Backend (Web Service)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` (runs `node server.js`) |
| Environment Variables | `MONGO_URI`, `JWT_SECRET`, `OPENROUTER_API_KEY`, `PORT` |

### Frontend (Static Site)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment Variables | `VITE_BACKEND_URL=https://fire-detection-using-yolov8.onrender.com` |

### Deploying Updates

1. Push changes to the `main` branch.
2. Render auto-deploys on push (if configured), or manually trigger from the Render dashboard.
3. After frontend deploy, hard-refresh the browser (`Ctrl+Shift+R`) to clear cached bundles.

---

## 🧪 Testing

### Backend API Tests (executed against live backend)

| # | Test | Result |
|---|------|--------|
| 1 | Valid registration (all 5 fields) | ✅ PASS — HTTP 201, user created |
| 2 | Missing required field | ✅ PASS — `"Please provide all required fields"` |
| 3 | Invalid email format | ✅ PASS — `"Please provide a valid email address"` |
| 4 | Duplicate email | ✅ PASS — `"User already exists with this email address"` |
| 5 | Missing password | ✅ PASS — `"Please provide all required fields"` |
| 6 | Existing user login | ✅ PASS — JWT token returned |
| 7 | Empty request body | ✅ PASS — `"Please provide all required fields"` |
| 8 | Short password (< 8 chars) | ✅ PASS — `"Password must be at least 8 characters"` |

### Frontend

| Test | Result |
|------|--------|
| Production build (`npm run build`) | ✅ PASS — 1204 modules, 0 errors, built in ~94s |
| ESLint | ⚠️ 18 warnings (pre-existing unused imports across multiple files — not introduced by this change) |

### Not Executed (Requires Manual Verification)

- End-to-end registration on the live frontend (requires redeployment of the stale Render frontend)
- Telegram alert delivery (requires a configured bot + running AI model)
- OpenRouter AI responses (requires a valid API key with credits)
- Map rendering (requires browser with detection data in the database)

---

## ⚠️ Known Limitations

| Limitation | Notes |
|------------|-------|
| **Live frontend is stale** | The deployed Render frontend must be redeployed to include the registration fix. Push to git and trigger a rebuild. |
| **OpenRouter model hardcoded** | The `openai/gpt-4o` model is hardcoded in `aiController.js`. Switch to a free model if needed. Consider making this configurable via an env variable. |
| **No phone number validation** | Backend accepts any non-empty string for `phone`. |
| **No email verification** | Registration does not send a confirmation email. |
| **No rate limiting** | API endpoints have no rate limiting. Consider adding `express-rate-limit` for production. |
| **CORS wide open** | `cors()` allows all origins. Restrict to your frontend domain in production. |
| **JWT secret fallback** | `JWT_SECRET` defaults to `"default_secret"` if not set. Always set a strong secret in production. |
| **Large frontend bundle** | ~1 MB JS (306 KB gzipped). Consider code splitting with dynamic imports. |
| **Duplicate `pymongo` in requirements.txt** | Listed twice in `AI_model/requirements.txt`. |

---

## 🔮 Future Improvements

- Email verification on registration
- Password reset via email
- Configurable OpenRouter model via environment variable
- Rate limiting and CORS restriction for production
- WebSocket for real-time dashboard updates (replacing 10–15s polling)
- Multi-camera support with camera ID tagging
- Historical trend analysis with date-range charts
- Admin panel for user management
- Mobile-responsive Telegram webhook endpoint

---

## 📄 License

This project is provided as-is for educational and research purposes.
