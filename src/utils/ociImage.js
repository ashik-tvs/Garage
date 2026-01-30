import NoImage from "../assets/No Image.png";
import apiService from "../services/apiservice";   // ✅ uses unified apiService

/* ============================
   CONFIG
============================ */
const FOLDER_MAP = {
  make: "Partsmart/PartsmartImages/PV/Make/",
  model: "Partsmart/PartsmartImages/PV/Model/",
  products: "Partsmart/PartsmartImages/products/",
  brand: "Partsmart/PartsmartImages/brand/",
  categories: "Partsmart/PartsmartImages/PV/Categories/",
  subcategories: "Partsmart/PartsmartImages/PV/SubCategory/",
};

const EXTENSIONS = [
  "png", "jpg", "jpeg", "webp",
  "PNG", "JPG", "JPEG", "WEBP",
];

/* ============================
   CACHE (IN-MEMORY)
============================ */
const imageCache = new Map();

/* ============================
   STRING HELPERS
============================ */
const clean = (str = "") =>
  str
    .replace(/\+/g, " ")
    .replace(/%20/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const caseVariants = (str) => [
  str,
  str.toUpperCase(),
  str.toLowerCase(),
  str
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" "),
];

const separatorVariants = (str) => {
  const base = clean(str);
  return [
    base,
    base.replace(/\s+/g, "-"),
    base.replace(/\s+/g, "_"),
    base.replace(/\s+/g, ""),
    base.replace(/-/g, " "),
    base.replace(/_/g, " "),
  ];
};

/* ============================
   BUILD ALL POSSIBLE FILENAMES
============================ */
const buildFileNames = (name) => {
  const set = new Set();

  separatorVariants(name).forEach((variant) => {
    caseVariants(variant).forEach((cased) => {
      set.add(cased);
    });
  });

  return [...set];
};

/* ============================
   MAIN FUNCTION
============================ */
export const getOciImage = async (folder, fileName) => {
  try {
    if (!fileName || !FOLDER_MAP[folder]) {
      return NoImage;
    }

    const cacheKey = `${folder}_${fileName}`;

    /* ---------- CACHE HIT ---------- */
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    const basePath = FOLDER_MAP[folder];
    const fileNames = buildFileNames(fileName);

    /* ---------- SEARCH LOGIC ---------- */
    for (const name of fileNames) {
      for (const ext of EXTENSIONS) {
        const fullPath = `${basePath}${name}.${ext}`;

        try {
          /* ===== OCI CALL USING apiService ===== */
          const blob = await apiService.getBlob("/oci/read", {
            params: { name: fullPath },
          });

          const url = URL.createObjectURL(blob);

          /* ---------- CACHE SUCCESS ---------- */
          imageCache.set(cacheKey, url);

          return url;

        } catch (err) {
          // silent retry
        }
      }
    }

    console.warn(`🟡 OCI image missing: ${folder}/${fileName}`);

    /* ---------- CACHE FAILURE ---------- */
    imageCache.set(cacheKey, NoImage);
    return NoImage;

  } catch (err) {
    console.error("🔴 OCI Image Resolver Error:", err);
    return NoImage;
  }
};

/* ============================
   OPTIONAL UTILITIES
============================ */

// Clear all cached images (memory cleanup)
export const clearOciImageCache = () => {
  for (const url of imageCache.values()) {
    if (typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url); // prevent memory leak
    }
  }
  imageCache.clear();
};

// Remove single cached image
export const removeOciImageFromCache = (folder, fileName) => {
  const key = `${folder}_${fileName}`;
  const url = imageCache.get(key);
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
  imageCache.delete(key);
};
