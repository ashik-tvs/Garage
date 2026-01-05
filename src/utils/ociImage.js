// utils/getOciImage.js
import axios from "axios";
import NoImage from "../assets/No Image.png";

// In-memory cache for OCI images
const imageCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const getOciImage = async (folder, fileName) => {
  try {
    if (!fileName) return NoImage;

    const original = fileName.trim();
    
    // Create cache key
    const cacheKey = `${folder}_${original}`;
    
    // Check in-memory cache first
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log(`📦 Cache hit for ${cacheKey}`);
      return cached.url;
    }
    
    // Check localStorage cache
    const localCacheKey = `oci_${cacheKey}`;
    const localCached = localStorage.getItem(localCacheKey);
    const localTimestamp = localStorage.getItem(`${localCacheKey}_timestamp`);
    
    if (localCached && localTimestamp) {
      const isValid = Date.now() - parseInt(localTimestamp) < CACHE_EXPIRY;
      if (isValid) {
        console.log(`💾 LocalStorage cache hit for ${cacheKey}`);
        // Store in memory cache for faster access
        imageCache.set(cacheKey, { url: localCached, timestamp: parseInt(localTimestamp) });
        return localCached;
      } else {
        // Clear expired cache
        localStorage.removeItem(localCacheKey);
        localStorage.removeItem(`${localCacheKey}_timestamp`);
      }
    }

    const upper = original.toUpperCase();
    const lower = original.toLowerCase();

    let path = "";

    if (folder === "make") {
      path = `Partsmart/PartsmartImages/CV/Make/`;
    } else if (folder === "model") {
      path = `Partsmart/PartsmartImages/CV/Model/`;
    } else if (folder === "products") {
      path = `Partsmart/PartsmartImages/products/`;
    } else if (folder === "brand") {
      path = `Partsmart/PartsmartImages/brand/`;
    } else if (folder === "categories") {
      path = `Partsmart/PartsmartImages/PV/Categories/`;
    } else if (folder === "subcategories") {
      path = `Partsmart/PartsmartImages/PV/SubCategory/`;
    } 


    const tryFiles = [
      `${upper}.png`,
      `${lower}.png`,
      `${original}.png`,
      `${upper}.jpg`,
      `${lower}.jpg`,
      `${original}.jpg`,
      `${upper}.PNG`,
      `${lower}.PNG`,
      `${original}.PNG`,
      `${upper}.JPG`,
      `${lower}.JPG`,
      `${original}.JPG`,
    ];

    for (let f of tryFiles) {
      try {
        const fullPath = `${path}${f}`; // IMPORTANT: NO MANUAL ENCODING

        const res = await axios.get("http://localhost:5000/api/oci/read", {
          params: { name: fullPath }, // Let axios encode it ONCE
          responseType: "blob",
        });

        // Convert blob to base64 data URL (can be stored in localStorage)
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(res.data);
        });
        
        // Cache the result in both memory and localStorage
        const timestamp = Date.now();
        imageCache.set(cacheKey, { url: dataUrl, timestamp });
        localStorage.setItem(localCacheKey, dataUrl);
        localStorage.setItem(`${localCacheKey}_timestamp`, timestamp.toString());
        
        console.log(`✅ Image cached: ${cacheKey}`);
        return dataUrl;
      } catch (err) {
        console.log("❌ Not found:", f);
      }
    }

    // Cache the NoImage result to avoid repeated failed requests
    const timestamp = Date.now();
    imageCache.set(cacheKey, { url: NoImage, timestamp });
    localStorage.setItem(localCacheKey, NoImage);
    localStorage.setItem(`${localCacheKey}_timestamp`, timestamp.toString());

    return NoImage;
  } catch (error) {
    console.log("OCI Image Error:", error);
    return NoImage;
  }
};
