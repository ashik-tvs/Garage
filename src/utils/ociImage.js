import axios from "axios";
import NoImage from "../assets/No Image.png";

/* ============================
   CONFIG
============================ */
const OCI_API = "http://localhost:5000/api/oci/read";

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
   IN-MEMORY CACHE
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

    // ✅ CACHE HIT
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    const basePath = FOLDER_MAP[folder];
    const fileNames = buildFileNames(fileName);

    for (const name of fileNames) {
      for (const ext of EXTENSIONS) {
        const fullPath = `${basePath}${name}.${ext}`;

        try {
          const res = await axios.get(OCI_API, {
            params: { name: fullPath },
            responseType: "blob",
          });

          const url = URL.createObjectURL(res.data);

          // ✅ CACHE SUCCESS
          imageCache.set(cacheKey, url);

          return url;
        } catch {
          // Silent retry
        }
      }
    }

    console.warn(`🟡 OCI image missing: ${folder}/${fileName}`);

    // ❌ CACHE FAILURE
    imageCache.set(cacheKey, NoImage);
    return NoImage;
  } catch (err) {
    console.error("🔴 OCI Image Resolver Error:", err);
    return NoImage;
  }
};
