import axios from "axios";
import axiosRetry from "axios-retry";
import apiConfigManager from "./apiConfig";
import { 
  partsListAPI, 
  vehicleListAPI, 
  masterListAPI, 
  partRelationsAPI, 
  stockListAPI, 
  generalSearchAPI 
} from './api';

/* ============================
   BASE CONFIG
============================ */
const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";


const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// Create a separate axios instance for external APIs (from database config)
const externalApiClient = axios.create({
  timeout: 120000,
});

/* ============================
   RETRY CONFIG
============================ */
axiosRetry(apiClient, {
  retries: 1,
  retryDelay: (retryCount) => {
    console.log(`⏳ Retry attempt ${retryCount}`);
    return retryCount * 2000;
  },
  retryCondition: (error) => {
    if (error.code === "ECONNABORTED") return false;

    if (error.response) {
      const status = error.response.status;
      if (status === 502 || status === 503 || status === 504) return false;
      return status === 500;
    }

    return axiosRetry.isNetworkError(error);
  },
});

// Apply retry config to external API client as well
axiosRetry(externalApiClient, {
  retries: 1,
  retryDelay: (retryCount) => {
    console.log(`⏳ External API Retry attempt ${retryCount}`);
    return retryCount * 2000;
  },
  retryCondition: (error) => {
    if (error.code === "ECONNABORTED") return false;

    if (error.response) {
      const status = error.response.status;
      if (status === 502 || status === 503 || status === 504) return false;
      return status === 500;
    }

    return axiosRetry.isNetworkError(error);
  },
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
apiClient.interceptors.request.use(
  (config) => {
    // Default headers
    if (!config.headers["Content-Type"] && !config.responseType) {
      config.headers["Content-Type"] = "application/json";
    }

    // Public endpoints (no token)
    const publicEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/verify-otp",
      "/auth/resend-otp",
      "/auth/reset-password",
      "/auth/ui-assets",
      "/auth/cng",
      "/auth/electric",
      "/auth/fastmovers",
      "/auth/highvalue",
      "/auth/discontinue-model",
      "/auth/only-with-us",
      "/vehicle-list",
      "/parts-list",
      "/related",
      "/stock-list",
      "/filter",
      "/search",
      "/oci/read",
    ];

    const isPublic = publicEndpoints.some((ep) =>
      config.url?.includes(ep)
    );

    if (!isPublic) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// External API client interceptor (for database-configured APIs)
externalApiClient.interceptors.request.use(
  (config) => {
    // Default headers
    if (!config.headers["Content-Type"] && !config.responseType) {
      config.headers["Content-Type"] = "application/json";
    }

    // Auth headers are now handled by apiConfigManager.getAuthHeaders()
    // No need to manually add auth here

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
apiClient.interceptors.response.use(
  (response) => response,   // ✅ do not unwrap (blob safe)
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

externalApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ External API Error:', error.message);
    return Promise.reject(error);
  }
);

/* ============================
   UNIFIED API SERVICE
============================ */
const apiService = {
  /* -------- RAW REQUEST -------- */
  request: (config) => apiClient.request(config).then(res => res.data),

  /* -------- JSON METHODS -------- */
  get: (url, config = {}) =>
    apiClient.get(url, { ...config, responseType: "json" }).then(res => res.data),

  post: (url, data = {}, config = {}) =>
    apiClient.post(url, data, { ...config, responseType: "json" }).then(res => res.data),

  put: (url, data = {}, config = {}) =>
    apiClient.put(url, data, { ...config, responseType: "json" }).then(res => res.data),

  delete: (url, config = {}) =>
    apiClient.delete(url, { ...config, responseType: "json" }).then(res => res.data),

  /* -------- BINARY / IMAGE -------- */
  getBlob: (url, config = {}) =>
    apiClient.get(url, {
      ...config,
      responseType: "blob",
      headers: {
        Accept: "image/*",
        ...(config.headers || {}),
      },
    }).then(res => res.data),

  /* -------- ASSET URL -------- */
  getAssetUrl: (filePath) => `${BASE_URL}${filePath}`,

  /* -------- DYNAMIC API CALL (from database config) -------- */
  /**
   * Call an external API using configuration from database
   * @param {string} apiName - Name of the API (e.g., "vehicle list", "part list")
   * @param {Object} data - Request body data (for POST) or query params (for GET)
   * @param {Object} options - Additional axios options
   * @returns {Promise} API response
   */
  callExternalApi: async (apiName, data = {}, options = {}) => {
    // Get API configuration from apiConfigManager
    const apiConfig = apiConfigManager.getApi(apiName);
    
    if (!apiConfig) {
      console.error(`❌ API configuration not found for: ${apiName}`);
      throw new Error(`API configuration not found for: ${apiName}`);
    }

    console.log(`🌐 Calling external API directly: ${apiName}`, {
      url: apiConfig.api_url,
      method: apiConfig.http_method || 'POST',
      data: data,
    });

    try {
      // Get auth headers from apiConfigManager
      const authHeaders = apiConfigManager.getAuthHeaders(apiName);
      
      // Determine HTTP method (default to POST for backward compatibility)
      const method = (apiConfig.http_method || 'POST').toUpperCase();
      
      let response;
      
      if (method === 'GET') {
        // For GET requests, send data as query parameters
        response = await externalApiClient.get(apiConfig.api_url, {
          ...options,
          params: data,
          headers: {
            ...authHeaders,
            ...(options.headers || {}),
          },
          responseType: "json",
        });
      } else if (method === 'PUT') {
        // For PUT requests, send data in body
        response = await externalApiClient.put(apiConfig.api_url, data, {
          ...options,
          headers: {
            ...authHeaders,
            ...(options.headers || {}),
          },
          responseType: "json",
        });
      } else {
        // For POST requests (default), send data in body
        response = await externalApiClient.post(apiConfig.api_url, data, {
          ...options,
          headers: {
            ...authHeaders,
            ...(options.headers || {}),
          },
          responseType: "json",
        });
      }
      
      console.log(`✅ ${apiName} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error calling ${apiName}:`, error.message);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
      }
      throw error;
    }
  },
};

/* ============================
   BUSINESS APIs (Using Centralized API Functions)
   These functions preserve existing request body structures
============================ */

// Fetch parts list by part number
export const fetchPartsListByPartNumber = async (partNumber) => {
  const requestBody = {
    brandPriority: ["VALEO"],
    limit: 50,
    offset: 0,
    sortOrder: "ASC",
    fieldOrder: null,
    customerCode: "0046",
    partNumber,
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

  // Use centralized API function with full request body
  return await partsListAPI(requestBody);
};

// Fetch parts list by item name
export const fetchPartsListByItemName = async (itemName) => {
  const requestBody = {
    brandPriority: ["VALEO"],
    limit: 1000,
    offset: 0,
    sortOrder: "ASC",
    fieldOrder: null,
    customerCode: "0046",
    partNumber: null,
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

  // Use centralized API function with full request body
  const response = await partsListAPI(requestBody);

  // Filter by item name on the client side
  if (response?.data && Array.isArray(response.data)) {
    const filtered = response.data.filter(item =>
      item.itemDescription?.toLowerCase().includes(itemName.toLowerCase())
    );
    return { ...response, data: filtered };
  }

  return response;
};

// Fetch vehicle list
export const fetchVehicleListByPartNumber = async (partNumber, limit = 10, offset = 0) => {
  const requestBody = {
    limit,
    offset,
    sortOrder: "ASC",
    customerCode: "0046",
    brand: null,
    partNumber: [partNumber],
    aggregate: null,
    subAggregate: null,
    make: null,
    model: null,
    variant: null,
    fuelType: null,
    vehicle: null,
    year: null,
  };

  // Use centralized API function with full request body
  return await vehicleListAPI(requestBody);
};

// Fetch master list
export const fetchMasterList = async ({
  masterType,
  make = null,
  model = null,
  variant = null,
  aggregate = null,
  subAggregate = null,
  limit = 0,
}) => {
  const requestBody = {
    partNumber: null,
    sortOrder: "ASC",
    customerCode: "0046",
    aggregate,
    brand: null,
    fuelType: null,
    limit,
    make,
    masterType,
    model,
    offset: 0,
    primary: false,
    subAggregate,
    variant,
    year: null,
  };

  // Use centralized API function with full request body
  return await masterListAPI(requestBody);
};

// Fetch part relations
export const fetchPartRelations = async (partNumber) => {
  const requestBody = {
    partNumber,
  };

  // Use centralized API function with full request body
  return await partRelationsAPI(requestBody);
};

// Fetch stock list
export const fetchStockList = async (requestBody) => {
  // Use centralized API function - pass request body as-is
  return await stockListAPI(requestBody);
};

// General search
export const generalSearch = async (searchQuery) => {
  const requestBody = {
    searchKey: searchQuery,
    customerCode: "0046",
  };

  // Use centralized API function with full request body
  return await generalSearchAPI(requestBody);
};


/* ============================
   EXPORT
============================ */
export default apiService;
