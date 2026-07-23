import os
from datetime import datetime
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# === CONFIG ===
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "firewatch")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "detections")

USER_ACCESS_CODE = os.getenv("USER_ACCESS_CODE", "TEST_CODE")

LOCATION = os.getenv("LOCATION_NAME", "Test Location")
LAT = float(os.getenv("LATITUDE", "0"))
LNG = float(os.getenv("LONGITUDE", "0"))

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

# MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# === TEST IMAGE ===
IMAGE_PATH = "images (1).jpg"  # put image here

if not os.path.exists(IMAGE_PATH):
    print("❌ test_fire.jpg not found")
    exit()

# Upload image
upload = cloudinary.uploader.upload(IMAGE_PATH)
image_url = upload["secure_url"]

# Save document
doc = {
    "label": "fire",
    "timestamp": datetime.now(),
    "location": LOCATION,
    "latitude": LAT,
    "longitude": LNG,
    "confidence": 0.95,
    "image_url": image_url,
    "accessCode": USER_ACCESS_CODE
}

collection.insert_one(doc)

print("✅ Dummy detection inserted")
print("📸", image_url)