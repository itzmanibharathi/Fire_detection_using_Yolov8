import axios from 'axios';

// Resolve backend URL dynamically based on environment or window location
const getBaseUrl = () => {
  // FORCED NEW URL - Removing all fallback logic to ensure correct connection
  return 'https://fireguard-pws7.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
