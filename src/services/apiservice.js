import axios from "axios";
import axiosRetry from "axios-retry";

// ✅ Hardcoded backend URL
const BASE_URL = "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // Increased to 120 seconds for slow external APIs
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach retry logic
axiosRetry(apiClient, {
  retries: 1, // Only retry once to avoid long waits
  retryDelay: (retryCount) => {
    console.log(`⏳ Retry attempt ${retryCount}`);
    return retryCount * 2000; // 2 seconds between retries
  },
  retryCondition: (error) => {
    // Don't retry on 502, 503, 504, or timeout errors - these indicate upstream issues
    if (error.code === 'ECONNABORTED') return false; // No retry on timeout
    if (error.response) {
      const status = error.response.status;
      // Don't retry on gateway errors or service unavailable
      if (status === 502 || status === 503 || status === 504) return false;
      // Only retry on temporary server errors
      return status === 500;
    }
    // Retry on network errors only
    return axiosRetry.isNetworkError(error);
  },
});

// Attach token automatically (but NOT for public external API endpoints)
apiClient.interceptors.request.use(
  (config) => {
    // ❌ Do NOT attach JWT token for external API proxy endpoints
    const publicEndpoints = ['/vehicle-list', '/parts-list', '/related', '/stock-list', '/filter', '/search'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
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

// Fetch parts list by part number
export const fetchPartsListByPartNumber = async (partNumber) => {
  const requestBody = {
    brandPriority: ["VALEO"],
    limit: 50,
    offset: 0,
    sortOrder: "ASC",
    fieldOrder: null,
    customerCode: "0046",
    partNumber: partNumber,
    model: null,
    brand: null,
    subAggregate: null,
    aggregate: null,
    make: null,
    variant: null,
    fuelType: null,
    vehicle: null,
    year: null,
  };

  return apiService.post("/parts-list", requestBody);
};

// Fetch parts list by item description (item name search)
// Note: API doesn't have itemDescription in request body, so we search with broad filters
// and filter by itemDescription on the client side
export const fetchPartsListByItemName = async (itemName) => {
  const requestBody = {
    brandPriority: ["VALEO"],
    limit: 1000, // Increased limit to get more results for filtering
    offset: 0,
    sortOrder: "ASC",
    fieldOrder: null,
    customerCode: "0046",
    partNumber: null,
    model: null,
    brand: null,
    subAggregate: null, // Can't filter by itemDescription in API
    aggregate: null,
    make: null,
    variant: null,
    fuelType: null,
    vehicle: null,
    year: null,
  };

  const response = await apiService.post("/parts-list", requestBody);
  
  // Filter results by itemDescription on client side
  if (response?.data && Array.isArray(response.data)) {
    const filtered = response.data.filter(item => 
      item.itemDescription?.toLowerCase().includes(itemName.toLowerCase())
    );
    return { ...response, data: filtered };
  }
  
  return response;
};

export default apiService;
