import axios from 'axios';

// Create an Axios instance using environment variables
// Fallback to localhost if not set
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://fire-detection-using-yolov8.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
