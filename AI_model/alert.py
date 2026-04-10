import os
import cv2
import threading
import requests
from datetime import datetime
from ultralytics import YOLO
import pygame
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# === LOAD ENV VARIABLES ===
load_dotenv()

# === LOCATION FROM ENV ===
LOCATION_NAME = os.getenv("LOCATION_NAME", "Unknown Location")
LATITUDE = float(os.getenv("Latitude", os.getenv("LATITUDE", "11.5")))
LONGITUDE = float(os.getenv("Longitude", os.getenv("LONGITUDE", "77.2")))

# === USER ACCESS CODE ===
USER_ACCESS_CODE = os.getenv("USER_ACCESS_CODE", "DEFAULT_CODE")

# === Cloudinary ===
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

# === Telegram ===
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# === MongoDB ===
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "firewatch")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "detections")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# === Detection settings ===
MODEL_PATH = os.getenv("MODEL_PATH", "best.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.7))
ALERT_CLASSES = os.getenv("ALERT_CLASSES", "fire,smoke").split(",")
SAVE_FOLDER = os.getenv("SAVE_FOLDER", "alerts")
ALERT_COOLDOWN = int(os.getenv("ALERT_COOLDOWN", 10))
ALERT_SOUND_PATH = os.getenv("ALERT_SOUND_PATH", "alert.mp3")
VIDEO_PATH = os.getenv("VIDEO_PATH", "a.mp4")

# === INITIAL SETUP ===
os.makedirs(SAVE_FOLDER, exist_ok=True)
model = YOLO(MODEL_PATH)
model.fuse()

pygame.mixer.init()
is_sound_playing = False

# === ALERT FUNCTION ===
def alert_handler(image_path, label, confidence):
    try:
        # Upload to Cloudinary
        upload = cloudinary.uploader.upload(image_path, folder="fire_alerts")
        image_url = upload["secure_url"]

        # Store in MongoDB
        timestamp = datetime.now()

        doc = {
            "label": label,
            "timestamp": timestamp,
            "location": LOCATION_NAME,
            "lat": LATITUDE,
            "lng": LONGITUDE,
            "confidence": confidence,
            "image_url": image_url,
            "accessCode": USER_ACCESS_CODE
        }

        collection.insert_one(doc)
        print(f"✅ Stored in DB: {label}")

        # Telegram alert
        message = (
            f"🚨 {label.upper()} DETECTED!\n"
            f"⏰ {timestamp}\n"
            f"📍 {LOCATION_NAME}\n"
            f"🌍 {LATITUDE}, {LONGITUDE}\n"
            f"🔍 Confidence: {confidence:.1%}"
        )

        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto",
            files={'photo': requests.get(image_url).content},
            data={'chat_id': TELEGRAM_CHAT_ID, 'caption': message}
        )

    except Exception as e:
        print("⚠️ Alert error:", e)

# === MAIN LOOP ===
def main():
    global is_sound_playing

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        print("❌ Cannot open video")
        return

    last_alert = {label: datetime.min for label in ALERT_CLASSES}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)
        detected = False

        for result in results:
            for box in result.boxes:
                conf = float(box.conf.item())
                cls_id = int(box.cls.item())
                label = model.names[cls_id].lower()

                if label in ALERT_CLASSES and conf >= CONFIDENCE_THRESHOLD:
                    now = datetime.now()

                    if (now - last_alert[label]).total_seconds() > ALERT_COOLDOWN:
                        detected = True

                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(frame, f"{label} {conf:.2f}",
                                    (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX,
                                    0.7,
                                    (0, 0, 255),
                                    2)

                        # Save image
                        filename = f"{label}_{now.strftime('%Y%m%d_%H%M%S')}.jpg"
                        image_path = os.path.join(SAVE_FOLDER, filename)
                        cv2.imwrite(image_path, frame)

                        # Async alert
                        threading.Thread(
                            target=alert_handler,
                            args=(image_path, label, conf),
                            daemon=True
                        ).start()

                        last_alert[label] = now

        # Sound alert
        if detected and not is_sound_playing:
            pygame.mixer.music.load(ALERT_SOUND_PATH)
            pygame.mixer.music.play(-1)
            is_sound_playing = True
        elif not detected and is_sound_playing:
            pygame.mixer.music.stop()
            is_sound_playing = False

        cv2.imshow("Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    pygame.mixer.music.stop()

if __name__ == "__main__":
    main()