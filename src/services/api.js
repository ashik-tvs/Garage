/**
 * Centralized API Service
 * All API endpoints and functions in one place
 */

import apiService from './apiservice';
import apiConfigManager from './apiConfig';

/* ============================
   EXTERNAL API CALLS (Using API Config Manager)
============================ */

/**
 * General Search API
 * Search for parts by query string
 * Accepts FULL request body as-is from components
 */
export const generalSearchAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('general search', requestBody);
    }
  } catch (error) {
    console.error('General search API error:', error);
  }
  return null;
};

/**
 * Labour API
 * Get labour categories
 */
export const labourAPI = async () => {
  try {
    if (apiConfigManager.isInitialized()) {
      // Labour API requires userId and password in request body
      return await apiService.callExternalApi('labour api', {
        userId: "tvs_new",
        password: "tvs%$876"
      });
    }
  } catch (error) {
    console.error('Labour API error:', error);
  }
  return null;
};

/**
 * Parts List API
 * Get parts list by part number or filters
 * Accepts FULL request body as-is from components
 */
export const partsListAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('part list', requestBody);
    }
  } catch (error) {
    console.error('Parts list API error:', error);
  }
  return null;
};

/**
 * Vehicle List API
 * Get vehicle list by part number
 * Accepts FULL request body as-is from components
 */
export const vehicleListAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('vehicle list', requestBody);
    }
  } catch (error) {
    console.error('Vehicle list API error:', error);
  }
  return null;
};

/**
 * Master List API
 * Get master data (makes, models, variants, etc.)
 * Accepts FULL request body as-is from components
 */
export const masterListAPI = async (requestBody) => {
  try {
    console.log('🔍 masterListAPI called with:', requestBody);
    
    const isInitialized = apiConfigManager.isInitialized();
    console.log('📋 API Config Manager initialized:', isInitialized);
    
    if (!isInitialized) {
      console.error('❌ API Config Manager not initialized!');
      console.log('💡 Checking localStorage for api_config...');
      const stored = localStorage.getItem('api_config');
      if (stored) {
        console.log('✅ Found api_config in localStorage');
        const parsed = JSON.parse(stored);
        console.log('📦 API config count:', parsed.length);
        const masterListConfig = parsed.find(api => api.api_name.toLowerCase() === 'master list');
        console.log('🔍 Master list config:', masterListConfig);
      } else {
        console.error('❌ No api_config in localStorage!');
      }
      return null;
    }
    
    return await apiService.callExternalApi('master list', requestBody);
  } catch (error) {
    console.error('❌ Master list API error:', error);
    console.error('Error stack:', error.stack);
  }
  return null;
};

/**
 * Part Relations API
 * Get related parts for a part number
 * Accepts FULL request body as-is from components
 */
export const partRelationsAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('part relation', requestBody);
    }
  } catch (error) {
    console.error('Part relations API error:', error);
  }
  return null;
};

/**
 * Stock List API
 * Get stock information
 */
export const stockListAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('stock list', requestBody);
    }
  } catch (error) {
    console.error('Stock list API error:', error);
  }
  return null;
};

/**
 * Image API
 * Get product images
 */
export const imageAPI = async (params) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('image', params);
    }
  } catch (error) {
    console.error('Image API error:', error);
  }
  return null;
};

/**
 * CNG API
 * Get CNG parts data from backend
 * Uses GET method - no request body needed
 */
export const cngAPI = async () => {
  try {
    return await apiService.get('/auth/cng');
  } catch (error) {
    console.error('CNG API error:', error);
  }
  return null;
};

/**
 * Electric API
 * Get electric vehicle parts data from backend
 * Uses GET method - no request body needed
 */
export const electricAPI = async () => {
  try {
    return await apiService.get('/auth/electric');
  } catch (error) {
    console.error('Electric API error:', error);
  }
  return null;
};

/**
 * Fast Movers API
 * Get fast moving parts data from backend
 * Uses GET method - no request body needed
 */
export const fastMoversAPI = async () => {
  try {
    return await apiService.get('/auth/fastmovers');
  } catch (error) {
    console.error('Fast Movers API error:', error);
  }
  return null;
};

/**
 * High Value API
 * Get high value parts data from backend
 * Uses GET method - no request body needed
 */
export const highValueAPI = async () => {
  try {
    return await apiService.get('/auth/highvalue');
  } catch (error) {
    console.error('High Value API error:', error);
  }
  return null;
};

/**
 * Discontinued Model API
 * Get discontinued model parts data from backend
 * Uses GET method - no request body needed
 */
export const discontinuedModelAPI = async () => {
  try {
    return await apiService.get('/auth/discontinue-model');
  } catch (error) {
    console.error('Discontinued Model API error:', error);
  }
  return null;
};

/**
 * Only With Us API
 * Get exclusive parts data from backend
 * Uses GET method - no request body needed
 */
export const onlyWithUsAPI = async () => {
  try {
    return await apiService.get('/auth/only-with-us');
  } catch (error) {
    console.error('Only With Us API error:', error);
  }
  return null;
};

/* ============================
   PARTSMART UNIFIED SEARCH API (via Backend Proxy)
============================ */

/**
 * Partsmart Autocomplete Suggestions API
 * Get real-time search suggestions as user types
 * @param {string} query - Search query (partial or complete)
 * @param {number} limit - Maximum suggestions to return (1-20, default: 5)
 */
export const partsmartSuggestionsAPI = async (query, limit = 5) => {
  try {
    console.log('🔍 Calling Partsmart Suggestions API (via proxy) with query:', query);
    
    const response = await apiService.get(`/partsmart/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    console.log('✅ Suggestions data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart suggestions API error:', error);
    return null;
  }
};

/**
 * Partsmart Unified Text Search API
 * Search using natural language with automatic NLP extraction
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query (natural language, vehicle number, or part number)
 * @param {Array<string>} params.sources - Search sources: ["tvs", "boodmo", "smart"] (default: ["tvs"])
 * @param {number} params.limit - Results per source (default: 10)
 * @param {Object} params.vehicle - Optional explicit vehicle context
 */
export const partsmartTextSearchAPI = async ({ query, sources = ['tvs'], limit = 10, vehicle = null }) => {
  try {
    console.log('🔍 Calling Partsmart Text Search API (via proxy) with query:', query);

    const requestBody = {
      query,
      sources,
      limitPerPart: limit  // Use limitPerPart instead of limit
    };

    if (vehicle) {
      requestBody.vehicle = vehicle;
    }

    console.log('📡 Request body:', requestBody);

    const response = await apiService.post('/partsmart/search', requestBody);

    console.log('✅ Text search data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart text search API error:', error);
    return null;
  }
};

/**
 * Partsmart Image Search API
 * Upload image(s) for part detection and search
 * @param {Object} params - Search parameters
 * @param {File|File[]} params.image - Single image or array of images
 * @param {string} params.query - Optional vehicle number for NLP detection
 * @param {Object} params.vehicle - Optional explicit vehicle context
 * @param {Array<string>} params.sources - Search sources (default: ["tvs"])
 * @param {number} params.limit - Results per source (default: 5)
 */
export const partsmartImageSearchAPI = async ({ image, query = null, vehicle = null, sources = ['tvs'], limit = 5, limitPerPart = null }) => {
  try {
    console.log('🔍 Calling Partsmart Image Search API (via proxy)');

    const formData = new FormData();
    formData.append('search_type', 'image');
    
    // Handle single or multiple images
    if (Array.isArray(image)) {
      image.forEach(img => formData.append('images', img));
    } else {
      formData.append('image', image);
    }

    if (query) {
      formData.append('query', query);
    }

    if (vehicle) {
      formData.append('vehicle', JSON.stringify(vehicle));
    }

    // Add sources as JSON array
    if (sources && sources.length > 0) {
      formData.append('sources', JSON.stringify(sources));
    }

    // Use limitPerPart if provided, otherwise use limit
    if (limitPerPart) {
      formData.append('limitPerPart', limitPerPart.toString());
    } else {
      formData.append('limit', limit.toString());
    }

    const response = await apiService.post('/partsmart/image-search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    console.log('✅ Image search data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart image search API error:', error);
    return null;
  }
};

/**
 * Partsmart Audio Search API
 * Voice search with automatic speech-to-text
 * Note: This requires backend proxy support
 */
export const partsmartAudioSearchAPI = async ({ audio, mode = 'translate', vehicle = null, sources = ['tvs'], limit = 5 }) => {
  console.warn('Audio search not yet implemented in backend proxy');
  return null;
};

/**
 * Partsmart Multipart Search API
 * Search for multiple parts simultaneously
 * @param {Object} params - Search parameters
 * @param {string} params.query - Natural language query with multiple parts (for NLP extraction)
 * @param {Array<Object>} params.parts - Array of part objects: [{partDescription: "brake pad"}, ...]
 * @param {Object} params.vehicle - Vehicle context (optional for NLP, recommended for better results)
 * @param {Array<string>} params.sources - Search sources (default: ["tvs"])
 * @param {number} params.limit - Results per part (default: 10)
 */
export const partsmartMultipartSearchAPI = async ({ query = null, parts = null, vehicle = null, sources = ['tvs'], limit = 10 }) => {
  try {
    console.log('🔍 Calling Partsmart Multipart Search API (via proxy)');

    const requestBody = {
      search_type: 'multipart',
      sources,
      limitPerPart: limit  // Use limitPerPart instead of limit
    };

    // Either query (for NLP extraction) or parts array (structured)
    if (query) {
      requestBody.query = query;
    } else if (parts) {
      requestBody.parts = parts;
    }

    // Vehicle context is optional but recommended for better results
    if (vehicle) {
      requestBody.vehicle = vehicle;
    }

    console.log('📡 Multipart request body:', requestBody);

    const response = await apiService.post('/partsmart/search', requestBody);

    console.log('✅ Multipart search data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart multipart search API error:', error);
    return null;
  }
};

/* ============================
   LOCAL BACKEND APIs
============================ */

/**
 * Login API
 */
export const loginAPI = async (email, password, isProceedToLogin = 0) => {
  return await apiService.post('/auth/login', {
    email,
    password,
    is_proceed_to_login: isProceedToLogin
  });
};

/**
 * Forgot Password API
 */
export const forgotPasswordAPI = async (email, password, confirmPassword) => {
  return await apiService.post('/auth/forgot-password', { email, password, confirmPassword });
};

/**
 * Verify OTP API
 */
export const verifyOTPAPI = async (email, otp) => {
  // Ensure OTP is sent as a number, not a string
  return await apiService.post('/auth/verify-otp', { 
    email, 
    otp: typeof otp === 'string' ? parseInt(otp, 10) : otp 
  });
};

/**
 * Reset Password API
 */
export const resetPasswordAPI = async (email, newPassword) => {
  return await apiService.post('/auth/reset-password', { email, newPassword });
};

/**
 * UI Assets API
 */
export const uiAssetsAPI = async () => {
  return await apiService.get('/auth/ui-assets');
};

/**
 * Profile API
 */
export const profileAPI = async () => {
  return await apiService.get('/auth/profile');
};

/**
 * Create Order API
 * Submit order to external ERP system
 */
export const createOrderAPI = async (orderData) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('order create api', orderData);
    }
  } catch (error) {
    console.error('Create order API error:', error);
  }
  return null;
};

/* ============================
   EXPORT ALL
============================ */
export default {
  // External APIs
  generalSearchAPI,
  labourAPI,
  partsListAPI,
  vehicleListAPI,
  masterListAPI,
  partRelationsAPI,
  stockListAPI,
  imageAPI,
  cngAPI,
  electricAPI,
  fastMoversAPI,
  highValueAPI,
  discontinuedModelAPI,
  onlyWithUsAPI,
  
  // Partsmart Unified Search APIs
  partsmartSuggestionsAPI,
  partsmartTextSearchAPI,
  partsmartImageSearchAPI,
  partsmartAudioSearchAPI,
  partsmartMultipartSearchAPI,
  
  // Local Backend APIs
  loginAPI,
  forgotPasswordAPI,
  verifyOTPAPI,
  resetPasswordAPI,
  uiAssetsAPI,
  profileAPI,
  createOrderAPI,
};
