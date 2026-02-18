/**
 * Partsmart API Functions (via Backend Proxy)
 * All Partsmart API calls go through the backend to avoid CORS issues
 */

import apiService from './apiservice';

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
 * @param {number} params.limit - Results per source (default: 5)
 * @param {Object} params.vehicle - Optional explicit vehicle context
 */
export const partsmartTextSearchAPI = async ({ query, sources = ['tvs'], limit = 5, vehicle = null }) => {
  try {
    console.log('🔍 Calling Partsmart Text Search API (via proxy) with query:', query);

    const requestBody = {
      query,
      sources,
      limit
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
export const partsmartImageSearchAPI = async ({ image, query = null, vehicle = null, sources = ['tvs'], limit = 5 }) => {
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

    formData.append('limit', limit.toString());

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

export default {
  partsmartSuggestionsAPI,
  partsmartTextSearchAPI,
  partsmartImageSearchAPI,
};
