import NoImage from "../assets/No Image.png";

/* ============================
   CONFIG
============================ */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const OCI_PROXY_URL = `${BACKEND_URL}/oci/image`;

// Debug: Log configuration on module load
console.log('🔧 OCI Image API Configuration:', {
  backendUrl: BACKEND_URL,
  proxyUrl: OCI_PROXY_URL,
});

const FOLDER_MAP = {
  make: "Partsmart/PartsmartImages/PV/Make/",
  model: "Partsmart/PartsmartImages/PV/Model/",
  products: "Partsmart/PartsmartImages/products/",
  brand: "Partsmart/PartsmartImages/PV/Brand/",
  categories: "Partsmart/PartsmartImages/PV/Categories/",
  subcategories: "Partsmart/PartsmartImages/PV/SubCategory/",
  // Add missing folder mappings
  aggregate: "Partsmart/PartsmartImages/PV/Categories/", // Same as categories
  subAggregate: "Partsmart/PartsmartImages/PV/SubCategory/", // Same as subcategories
};

// Prioritized extensions - most common first for faster resolution
const EXTENSIONS = ["png", "PNG", "jpg", "JPG", "jpeg", "JPEG", "webp", "WEBP"];

/* ============================
   SIMPLE CACHE TO PREVENT REPEATED LOADING
============================ */
const imageCache = new Map();
const failedCache = new Map(); // Track failed attempts with timestamps

/* ============================
   CACHE MANAGEMENT
============================ */
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
const FAILED_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes for failed attempts

const isCacheExpired = (timestamp) => {
  return Date.now() - timestamp > CACHE_EXPIRY;
};

const isFailedCacheExpired = (key) => {
  if (!failedCache.has(key)) return true;
  const timestamp = failedCache.get(key);
  return !timestamp || Date.now() - timestamp > FAILED_CACHE_EXPIRY;
};

/* ============================
   INTELLIGENT FILENAME RESOLUTION
============================ */
const getIntelligentFilenames = (name, folder) => {
  if (!name) return [];
  
  const cleaned = name
    .replace(/\+/g, " ")
    .replace(/%20/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Folder-specific intelligent naming patterns
  const patterns = [];
  
  switch (folder) {
    case 'make':
      // Make names are usually uppercase with spaces
      patterns.push(
        cleaned.toUpperCase(),
        cleaned.toUpperCase().replace(/\s+/g, " "),
        cleaned
      );
      break;
      
    case 'model':
      // Model names follow "Make - Model" pattern
      if (cleaned.includes(' - ')) {
        patterns.push(cleaned); // Already formatted
      } else {
        // Try to construct proper format if possible
        patterns.push(cleaned, cleaned.toUpperCase());
      }
      break;
      
    case 'categories':
    case 'subcategories':
      // Categories are usually uppercase
      patterns.push(
        cleaned.toUpperCase(),
        cleaned.toUpperCase().replace(/\s+/g, " "),
        cleaned
      );
      break;
      
    case 'brand':
      // Brands are usually uppercase
      patterns.push(
        cleaned.toUpperCase(),
        cleaned
      );
      break;
      
    case 'products':
      // Products can have various formats
      patterns.push(
        cleaned,
        cleaned.toUpperCase(),
        cleaned.toLowerCase()
      );
      break;
      
    default:
      patterns.push(cleaned);
  }
  
  // Add common variations only if not already included
  const variations = new Set(patterns);
  
  // Add separator variations for top patterns only
  patterns.slice(0, 2).forEach(pattern => {
    variations.add(pattern.replace(/\s+/g, "-"));
    variations.add(pattern.replace(/\s+/g, "_"));
    variations.add(pattern.replace(/\s+/g, ""));
  });
  
  return Array.from(variations).filter(Boolean);
};

/* ============================
   PARALLEL IMAGE LOADING WITH BETTER ERROR HANDLING
============================ */
const loadImageWithTimeout = async (fullPath, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const requestUrl = `${OCI_PROXY_URL}?name=${encodeURIComponent(fullPath)}`;
    console.log('📡 OCI Image API Request (via proxy):', requestUrl);
    
    // Call backend proxy (no auth needed - backend handles it)
    const response = await fetch(requestUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/*',
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('📥 OCI Image API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Validate that we got a valid image blob
    if (!blob || blob.size === 0) {
      throw new Error('Empty blob received');
    }
    
    console.log('✅ OCI Image loaded successfully:', fullPath, `(${blob.size} bytes)`);
    
    return URL.createObjectURL(blob);
  } catch (err) {
    clearTimeout(timeoutId);
    
    // Log specific error types for debugging
    if (err.name === 'AbortError') {
      console.warn(`⏱️ OCI Image timeout: ${fullPath}`);
    } else if (err.message.includes('404')) {
      // Don't log 404s - they're expected for missing images
    } else {
      console.warn(`❌ OCI Image error for ${fullPath}:`, err.message);
    }
    
    throw err;
  }
};

/* ============================
   MAIN FUNCTION - OPTIMIZED WITH BETTER CACHE AND ERROR HANDLING
============================ */
export const getOciImage = async (folder, fileName) => {
  try {
    if (!fileName || !FOLDER_MAP[folder]) {
      return NoImage;
    }

    const cacheKey = `${folder}_${fileName}`;

    // Check if this request failed recently
    if (failedCache.has(cacheKey) && !isFailedCacheExpired(cacheKey)) {
      console.warn(`🚫 Skipping recently failed image: ${cacheKey}`);
      return NoImage;
    }

    // Check cache first to prevent repeated loading
    if (imageCache.has(cacheKey)) {
      const cached = imageCache.get(cacheKey);
      
      // Return cached URL if not expired (blob URLs are never revoked, so they're always valid)
      if (cached.url && !isCacheExpired(cached.timestamp)) {
        console.log(`✅ Using cached image: ${cacheKey}`);
        return cached.url;
      } else {
        // Cache expired, remove it (but don't revoke blob URL - it might be in use elsewhere)
        imageCache.delete(cacheKey);
      }
    }

    const basePath = FOLDER_MAP[folder];
    const intelligentNames = getIntelligentFilenames(fileName, folder);
    
    // Create prioritized paths - fewer attempts for better performance
    const imagePaths = [];
    
    // Try only the most likely combinations
    for (const name of intelligentNames.slice(0, 2)) { // Top 2 name variants
      for (const ext of EXTENSIONS.slice(0, 3)) { // Top 3 extensions
        imagePaths.push(`${basePath}${name}.${ext}`);
      }
    }
    
    // Try paths in smaller batches for better performance
    const BATCH_SIZE = 2;
    for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
      const batch = imagePaths.slice(i, i + BATCH_SIZE);
      
      // Try batch in parallel with timeout
      const promises = batch.map(async (fullPath) => {
        try {
          const url = await loadImageWithTimeout(fullPath, 6000); // Increased timeout
          return { success: true, url, path: fullPath };
        } catch (err) {
          return { success: false, path: fullPath, error: err.message };
        }
      });
      
      try {
        const results = await Promise.allSettled(promises);
        
        // Return first successful result
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.success) {
            // Cache the successful result with timestamp
            imageCache.set(cacheKey, {
              url: result.value.url,
              timestamp: Date.now()
            });
            
            // Remove from failed cache if it was there
            failedCache.delete(cacheKey);
            
            console.log(`✅ Loaded and cached new image: ${cacheKey}`);
            
            return result.value.url;
          }
        }
      } catch (batchError) {
        console.warn(`🟡 Batch failed for ${folder}/${fileName}:`, batchError.message);
        continue; // Try next batch
      }
    }

    console.warn(`🟡 OCI image not found: ${folder}/${fileName}`);
    
    // Cache the failed attempt to prevent immediate retries
    failedCache.set(cacheKey, Date.now());
    
    // Don't cache NoImage result - allow retries after expiry
    return NoImage;

  } catch (err) {
    console.error("🔴 OCI Image Resolver Error:", err);
    return NoImage;
  }
};

/* ============================
   PRELOADING UTILITIES
============================ */
export const preloadOciImages = async (imageRequests) => {
  const preloadPromises = imageRequests.map(async ({ folder, fileName }) => {
    try {
      const url = await getOciImage(folder, fileName);
      return { folder, fileName, url, success: true };
    } catch (err) {
      return { folder, fileName, error: err.message, success: false };
    }
  });
  
  return Promise.allSettled(preloadPromises);
};

/* ============================
   CLEANUP UTILITIES
============================ */
export const revokeOciImageUrl = (url) => {
  if (typeof url === "string" && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

/* ============================
   CACHE MANAGEMENT
============================ */
export const clearOciImageCache = () => {
  // Revoke all blob URLs
  for (const cached of imageCache.values()) {
    if (cached.url && typeof cached.url === "string" && cached.url.startsWith("blob:")) {
      URL.revokeObjectURL(cached.url);
    }
  }
  imageCache.clear();
  failedCache.clear();
  console.log("🧹 OCI image cache cleared");
};

export const getCacheStats = () => {
  return {
    cached: imageCache.size,
    failed: failedCache.size,
    totalMemory: imageCache.size + failedCache.size
  };
};
