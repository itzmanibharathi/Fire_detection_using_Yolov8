# Fire_detection_using_Yolov8

# 🔥 Fire Detection and Alert System – Documentation

This project is a real-time fire detection and alert system that uses artificial intelligence and computer vision to identify fire in live camera footage. When fire is detected, the system instantly sends an alert to a Telegram chat, including the exact time, an image of the fire, and a clickable Google Maps link of the current location. The purpose of this project is to enhance early fire warning capabilities using automation and AI, making it ideal for homes, offices, and public safety systems.

At the heart of the system lies a pre-trained YOLOv8 model, which specializes in detecting fire from images or video frames. YOLO (You Only Look Once) is a deep learning model known for its real-time object detection capabilities. The model is loaded into a Python script (`app.py`) and runs continuously, analyzing every frame captured from the webcam or a video source. When it spots a fire with a confidence level above 80%, it marks the detected area with a red rectangle and displays the confidence score.

Upon fire detection, the system saves a snapshot of the fire incident. It then retrieves the current geographic location using IP-based geolocation through the `geocoder` library. This method determines the user's latitude and longitude coordinates, as well as their city, state, and country. A clickable Google Maps link is automatically generated, allowing the alert recipient to view the incident's location on the map.

The system then sends a Telegram message using the Telegram Bot API. This message includes the time of detection, the fire detection confidence, the geographical location, and the image captured. This immediate alerting mechanism makes it useful in both residential and industrial settings where a fast response is critical.

From a technical perspective, the project is built entirely in Python and uses several libraries to perform its tasks. The `ultralytics` library provides YOLOv8 support, `opencv-python` handles camera input and image processing, `geocoder` fetches the IP-based location, and `python-telegram-bot` is used to send Telegram messages and media. The system operates in real-time, continuously monitoring for fire and cleaning up temporary image files after sending alerts.

The overall file structure of the project is simple. The `app.py` file contains the core logic. A `best.pt` file holds the trained YOLOv8 model. A `requirements.txt` file lists the dependencies needed to run the project. Optionally, a `.env` file can be used to securely store Telegram credentials. There may also be a `utils` folder for reusable functions and an `images` folder for storing fire snapshots temporarily.

To run the system, users must first install the required Python packages using the provided `requirements.txt` file. Next, they need to add their Telegram bot token and chat ID either directly into the script or in an environment variable file. Once set up, running `python app.py` will activate the system and begin monitoring for fire.

The Telegram alert sent includes all critical details formatted in a user-friendly way. It typically reads something like:
“🚨 FIRE DETECTED!
🕒 Time: 2025-06-29 14:05:22
📍 Location: Chennai, Tamil Nadu, India
🌍 [View on Map](https://www.google.com/maps?q=13.0827,80.2707)
🔥 Confidence: 91.20%”
An image showing the detected fire is also sent alongside the message.

This system is designed to be lightweight and user-friendly. It respects privacy, as it uses only IP-based geolocation and does not store video recordings. It only captures images when fire is detected, and those are removed after the alert is sent.

In summary, this project combines the power of artificial intelligence, real-time video processing, and cloud communication to create a reliable fire detection system. It is suitable for students as a mini or final-year project, researchers working on fire datasets, or individuals looking to build a practical safety system for real-world applications.

