import axios from 'axios';

// ✅ FIXED: Use environment variable for API URL (supports different domains)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

export default api;
