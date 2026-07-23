# 🔥 Fire Detection & Alert System (YOLOv8 + React Dashboard)

A real-time **Fire & Smoke Detection System** powered by **YOLOv8**, integrated with a modern **React Dashboard (React 19 + Bootstrap)** for monitoring, analytics, and alert visualization.

---

## 🚨 Project Overview

This system continuously monitors live camera footage using AI and computer vision to detect **fire or smoke** in real time.  
Whenever fire/smoke is detected:

- A snapshot of the incident is captured
- The location (latitude, longitude, city, country) is fetched automatically
- An alert message is sent to **Telegram**, containing:
  - Time of incident
  - Location + clickable Google Maps link
  - Image of the detected fire/smoke
  - Confidence percentage

Detected incidents are stored in a database and visualized in the frontend dashboard.

---

## 🧠 Features

| Feature | Description |
|--------|-------------|
| 🔥 Real-time Fire/Smoke Detection | YOLOv8 model analyzes webcam or CCTV feed with live bounding boxes. |
| 📩 Telegram Alerts | Sends image + location + timestamp + confidence score. |
| 🗺 Location Tagging | Shows Google Maps link of the incident location. |
| 🖼 Alert Gallery | View saved detection images with timestamp and details. |
| 📊 Analytics Dashboard | Daily/Monthly analysis + charts using React. |
| 🔎 Smart Analysis via LLM | Uses OpenAI or any LLM to generate incident summary report. |
| 💾 Database Storage | Stores detection logs + captured images for future reference. |
| 👨‍💻 Modern UI | Built using **React 19 + Bootstrap**, responsive and clean UI. |

---

## 🛠 Tech Stack

| Component | Technology |
|----------|------------|
| Model | YOLOv8 (Ultralytics) |
| Backend | Python (FastAPI / Flask) |
| Frontend | React 19 + Bootstrap |
| Alerts | Telegram Bot API |
| AI Analysis | OpenAI / LLM |
| DB Storage | SQLite or PostgreSQL |

---

## ⚙️ Installation & Running the Project

### ✅ Step 1: Install Python dependencies

```sh
pip install -r requirements.txt
````

Also set your Telegram bot credentials:

Create **.env** file:

```
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
OPENAI_API_KEY=your_api_key
```

Run the fire detection system:

```sh
python app.py
```

That’s it — YOLOv8 starts detecting fire/smoke.

---

### ✅ Step 2: Install frontend (Dashboard UI)

```sh
cd frontend
npm install
npm run dev
```

Opens in browser → `http://localhost:3000`

---

### ✅ Step 3: Install backend API (Database + analytics + gallery)

```sh
cd backend
npm install
npm run dev
```

Backend will:

* Save detections to database
* Serve JSON API to dashboard
* Provide endpoints like `/alerts`, `/analytics`, `/gallery`

---

## 📸 Telegram Alert Example

> **🚨 FIRE DETECTED!**
> 🕒 Time: `2025-06-29 14:05:22`
> 📍 Location: Chennai, Tamil Nadu, India
> 🌍 View on Maps
> 🔥 Confidence: *91.20%*
> *(Image attached)*

---

## 📊 Dashboard Pages (React UI)

| Page                        | Description                              |
| --------------------------- | ---------------------------------------- |
| **Dashboard**               | Daily/Monthly charts + count stats       |
| **Gallery**                 | Shows all captured alert images          |
| **Alerts**                  | Tabular list of all detection logs       |
| **Analysis (AI-generated)** | LLM generates a detection summary report |

---

## ✅ What makes this project unique?

* Fully automated fire detection + instant alerting
* Uses AI both for detection **and** report generation
* Modern frontend with analytics & gallery
* Can be deployed on Raspberry Pi, Railway.app, or cloud VM

---

## 📦 Run Everything Together

```
python app.py       <-- starts detection
npm run dev         <-- frontend dashboard
npm run dev         <-- backend api
```

You now have:

* Real-time fire detection
* Alerts sent to Telegram
* Dashboard showing stored incidents

--
