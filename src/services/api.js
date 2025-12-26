import axios from 'axios';

// ✅ FIXED: Use environment variable for API URL (supports different domains)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mentormateback-end.onrender.com',
  withCredentials: true
});

export default api;
