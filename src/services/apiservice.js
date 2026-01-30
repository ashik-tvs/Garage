import axios from "axios";
import axiosRetry from "axios-retry";

/* ============================
   BASE CONFIG
============================ */
const BASE_URL = "http://localhost:5000/api";   // ✅ ONE BASE URL FOR ALL

const apiClient = axios.create({
  baseURL: BASE_URL,
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
      "/vehicle-list",
      "/parts-list",
      "/related",
      "/stock-list",
      "/filter",
      "/search",
      "/oci/read",        // ✅ OCI must be public
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
  getAssetUrl: (filePath) => `http://localhost:5000${filePath}`,
};

/* ============================
   BUSINESS APIs
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

  return apiService.post("/parts-list", requestBody);
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

  const response = await apiService.post("/parts-list", requestBody);

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

  return apiService.post("/vehicle-list", requestBody);
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

  return apiService.post("/filter", requestBody);
};

/* ============================
   EXPORT
============================ */
export default apiService;
