import { getOciImage } from './ociImage';

/**
 * Preload multiple OCI images in batches for better performance
 * @param {Array} imageRequests - Array of {folder, fileName} objects
 * @param {number} batchSize - Number of images to load simultaneously
 * @returns {Promise} Promise that resolves when all images are processed
 */
export const preloadOciImagesBatch = async (imageRequests, batchSize = 3) => {
  const results = [];
  
  for (let i = 0; i < imageRequests.length; i += batchSize) {
    const batch = imageRequests.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async ({ folder, fileName, priority = false }) => {
      try {
        const startTime = Date.now();
        const url = await getOciImage(folder, fileName);
        const loadTime = Date.now() - startTime;
        
        return {
          folder,
          fileName,
          url,
          success: url !== null,
          loadTime,
          priority
        };
      } catch (error) {
        return {
          folder,
          fileName,
          url: null,
          success: false,
          error: error.message,
          priority
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    ));
    
    // Small delay between batches to prevent overwhelming the server
    if (i + batchSize < imageRequests.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

/**
 * Preload images for a specific component type
 * @param {Array} items - Array of items with image data
 * @param {string} folder - OCI folder type
 * @param {Function} getImageName - Function to extract image name from item
 * @returns {Promise} Promise that resolves with preload results
 */
export const preloadComponentImages = async (items, folder, getImageName) => {
  const imageRequests = items
    .map(item => {
      const fileName = getImageName(item);
      return fileName ? { folder, fileName } : null;
    })
    .filter(Boolean);
  
  if (imageRequests.length === 0) return [];
  
  console.log(`🚀 Preloading ${imageRequests.length} images for ${folder}`);
  
  const results = await preloadOciImagesBatch(imageRequests);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`✅ Preloaded ${successful}/${results.length} images for ${folder} (${failed} failed)`);
  
  return results;
};

/**
 * Preload images for make components
 */
export const preloadMakeImages = (makes) => {
  return preloadComponentImages(makes, 'make', (make) => make.name || make.makeName);
};

/**
 * Preload images for model components
 */
export const preloadModelImages = (models, make) => {
  return preloadComponentImages(models, 'model', (model) => {
    // For models, we need to resolve the OCI name format
    if (make && model.name) {
      return `${make} - ${model.name}`;
    }
    return model.name;
  });
};

/**
 * Preload images for category components
 */
export const preloadCategoryImages = (categories) => {
  return preloadComponentImages(categories, 'categories', (category) => 
    category.aggregateName || category.name
  );
};

/**
 * Preload images for subcategory components
 */
export const preloadSubcategoryImages = (subcategories) => {
  return preloadComponentImages(subcategories, 'subcategories', (subcategory) => 
    subcategory.subAggregateName || subcategory.name
  );
};

/**
 * Smart preloader that determines the best images to preload based on viewport
 * @param {Array} items - All items
 * @param {number} visibleCount - Number of visible items
 * @param {Function} preloadFunction - Specific preload function to use
 * @returns {Promise} Promise that resolves when priority images are loaded
 */
export const smartPreload = async (items, visibleCount, preloadFunction) => {
  if (!items || items.length === 0) return;
  
  // Preload visible items first (high priority)
  const visibleItems = items.slice(0, visibleCount);
  const remainingItems = items.slice(visibleCount);
  
  // Load visible items immediately
  const visibleResults = await preloadFunction(visibleItems);
  
  // Load remaining items in background with lower priority
  if (remainingItems.length > 0) {
    setTimeout(() => {
      preloadFunction(remainingItems);
    }, 1000); // Delay background loading
  }
  
  return visibleResults;
};