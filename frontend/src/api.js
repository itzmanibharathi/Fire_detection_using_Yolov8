import axios from 'axios';

const API_URL = 'https://fire-detection-using-yolov8.onrender.com/api/detections';

export const fetchDetections = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (err) {
    console.error('Error fetching detections:', err);
    return [];
  }
};
