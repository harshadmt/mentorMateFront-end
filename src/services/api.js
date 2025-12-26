import axios from 'axios';

// ✅ FIXED: Use environment variable for API URL (supports different domains)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://mentormateback-end.onrender.com',
  withCredentials: true
});

// Attach Authorization header from localStorage token (if present)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore (e.g., SSR or storage access issues)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 globally (clear token so UI can react)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      try {
        localStorage.removeItem('authToken');
      } catch (e) {}
    }
    return Promise.reject(err);
  }
);

export default api;
