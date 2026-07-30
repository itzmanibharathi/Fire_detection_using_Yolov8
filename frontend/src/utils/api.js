import axios from 'axios';

const getBaseUrl = () => {
  // Pointing to the BACKEND service, not the frontend
  return 'https://fire-detection-using-yolov8.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
