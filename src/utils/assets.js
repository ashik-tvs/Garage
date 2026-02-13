/**
 * Simple asset utility - fetches from API and caches in localStorage
 */

import apiService from '../services/apiservice';

const BASE_URL = process.env.REACT_APP_PUBLIC_URL || 'http://localhost:3000/public';
// const BASE_URL = process.env.REACT_APP_PUBLIC_URL || 'http://10.237.102.72:3000/public';

const CACHE_KEY = 'ui_assets';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let assetsCache = null;

/**
 * Fetch assets from API
 */
async function fetchAssets() {
  try {
    const result = await apiService.get('/auth/ui-assets');
    
    if (result.success && Array.isArray(result.data)) {
      const assetMap = {};
      result.data.forEach(asset => {
        if (asset.tag_name && asset.file_url) {
          assetMap[asset.tag_name] = `${BASE_URL}${asset.file_url}`;
        }
      });
      
      // Cache in localStorage
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: assetMap,
        timestamp: Date.now()
      }));
      
      assetsCache = assetMap;
      return assetMap;
    }
  } catch (error) {
    console.error('Failed to fetch assets:', error);
  }
  
  return {};
}

/**
 * Get assets from cache or fetch
 */
export async function getAssets() {
  // Return from memory cache if available
  if (assetsCache) {
    return assetsCache;
  }
  
  // Check localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_DURATION) {
        assetsCache = data;
        return data;
      }
    }
  } catch (error) {
    console.error('Cache error:', error);
  }
  
  // Fetch fresh data
  return await fetchAssets();
}

/**
 * Get single asset URL
 */
export function getAsset(tagName, assets) {
  if (!assets || !assets[tagName]) {
    return `${BASE_URL}/assets/placeholder.png`;
  }
  return assets[tagName];
}

/**
 * Initialize assets on app load
 */
export async function initAssets() {
  return await getAssets();
}
