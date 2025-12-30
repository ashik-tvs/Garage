import axios from "axios";
import axiosRetry from "axios-retry";

// ✅ Hardcoded backend URL
const BASE_URL = "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach retry logic
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 2000,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.code === "ECONNABORTED" ||
    (error.response && error.response.status >= 500),
});

// Attach token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global auth error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Unified API methods
const apiService = {
  get: (url, params = {}) => apiClient.get(url, { params }).then(res => res.data),
  post: (url, data = {}) => apiClient.post(url, data).then(res => res.data),
  put: (url, data = {}) => apiClient.put(url, data).then(res => res.data),
  delete: (url) => apiClient.delete(url).then(res => res.data),

  // Helper to get full URL for static assets
  getAssetUrl: (filePath) => `http://localhost:5000${filePath}`,
};

export default apiService;
