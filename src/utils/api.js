import axios from 'axios';

// Get base URL from environment variables, fallback for local dev if missing
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7278';

const api = axios.create({
  baseURL: baseURL,
});

// Request interceptor for API calls
// If you implement a token system later, you can attach the token here automatically
api.interceptors.request.use(
  (config) => {
    // Example: 
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle global errors here, e.g., redirect to login if 401 Unauthorized
    // if (error.response && error.response.status === 401) {
    //    window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
