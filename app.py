import os
import cv2
import threading
import requests
from datetime import datetime
import geocoder
from ultralytics import YOLO

MODEL_PATH = "best.pt"
TELEGRAM_TOKEN = "7963928332:AAEWcA8kHcFCkEv9tNoAj7l_sBh5rordzYI"
TELEGRAM_CHAT_ID = "-1002813571108"
CONFIDENCE_THRESHOLD = 0.7
ALERT_CLASSES = ["fire", "smoke"]
SAVE_FOLDER = "alerts"
ALERT_COOLDOWN = 10
os.makedirs(SAVE_FOLDER, exist_ok=True)
model = YOLO(MODEL_PATH)

def send_telegram_alert(image_path, label, confidence):
    try:
        location = "Location unknown"
        try:
            g = geocoder.ip('me')
            if g.latlng:
                lat, lng = g.latlng
                location = f"📍 {g.city or 'Unknown location'}\n🌍 https://maps.google.com?q={lat},{lng}"
        except Exception as e:
            print(f"⚠️ Location error: {str(e)}")

        message = (
            f"🚨 *{label.upper()} DETECTED!*\n"
            f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"{location}\n"
            f"🔍 Confidence: {confidence:.1%}"
        )

        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto"
        with open(image_path, 'rb') as photo:
            files = {'photo': photo}
            data = {'chat_id': TELEGRAM_CHAT_ID, 'caption': message, 'parse_mode': 'Markdown'}
            response = requests.post(url, files=files, data=data)
        
        if response.status_code == 200:
            print(f"✅ Alert sent: {label} ({confidence:.1%})")
        else:
            print(f"❌ Telegram error: {response.text}")

    except Exception as e:
        print(f"⚠️ Alert failed: {str(e)}")

def main():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open video capture")
        return

    last_alert = {label: datetime.min for label in ALERT_CLASSES}
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Frame capture error")
                break

            results = model(frame)
            for result in results:
                for box in result.boxes:
                    conf = box.conf.item()
                    cls_id = int(box.cls.item())
                    label = model.names[cls_id].lower()  # F

                    if label in ALERT_CLASSES and conf >= CONFIDENCE_THRESHOLD:
                        now = datetime.now()
                        
                        if (now - last_alert[label]).total_seconds() > ALERT_COOLDOWN:
                            x1, y1, x2, y2 = map(int, box.xyxy[0])
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                            cv2.putText(
                                frame, 
                                f"{label.upper()} {conf:.1%}", 
                                (x1, y1 - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 
                                0.7, (0, 0, 255), 2
                            )
                            timestamp = now.strftime("%Y%m%d_%H%M%S")
                            image_path = os.path.join(SAVE_FOLDER, f"{label}_{timestamp}.jpg")
                            cv2.imwrite(image_path, frame)
                            threading.Thread(
                                target=send_telegram_alert,
                                args=(image_path, label, conf),
                                daemon=True
                            ).start()

                            last_alert[label] = now
                            print(f"🔥 ALERT: {label} ({conf:.1%})")
            cv2.imshow('Fire/Smoke Detection (Press Q to quit)', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\n🛑 Detection stopped by user")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("✅ Resources released")

if __name__ == "__main__":
    main()