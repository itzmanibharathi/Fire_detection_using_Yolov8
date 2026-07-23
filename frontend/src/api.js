import api from './utils/api';

export const fetchDetections = async () => {
  try {
    const response = await api.get('/api/detections');
    return response.data;
  } catch (err) {
    console.error('Error fetching detections:', err);
    return [];
  }
};
