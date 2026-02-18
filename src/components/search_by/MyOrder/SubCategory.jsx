import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { masterListAPI, labourAPI } from "../../../services/api";
import { getAssets, getAsset } from "../../../utils/assets";
import NoImage from "../../../assets/No Image.png";
import OciImage from "../../oci_image/ociImages";
import Navigation from "../../Navigation/Navigation";
import "../../../styles/home/SubCategory.css";
import "../../../styles/skeleton/skeleton.css";

const Sub_Category = () => {
  const [assets, setAssets] = useState({});
  const [serviceTypes, setServiceTypes] = useState([]);
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);
  const [serviceTypeLoading, setServiceTypeLoading] = useState(false);
  const [serviceTypeError, setServiceTypeError] = useState(null);
  const [categoryMatchStatus, setCategoryMatchStatus] = useState(null); // Enhanced state tracking

  const navigate = useNavigate();
  const location = useLocation();
  const {
    make,
    model,
    brand,
    category,
    aggregateName,
    aggregate,
    featureLabel,
    variant,
    isOnlyWithUs,
  } = location.state || {};

  // Use aggregate from Category.jsx if available, fallback to aggregateName
  const selectedAggregate = aggregate || aggregateName;

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getIconForSubCategory = (subAggregateName) => {
    const upperName = subAggregateName.toUpperCase();
    return [upperName] || NoImage;
  };

  // Fetch sub-categories from API
  useEffect(() => {
    if (selectedAggregate) {
      // Check cache first
      const cacheKey = brand
        ? `subCategory_${selectedAggregate}_brand_${brand}`
        : `subCategory_${selectedAggregate}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (cachedData && cacheTimestamp) {
        const isCacheValid =
          Date.now() - parseInt(cacheTimestamp) < cacheExpiry;

        if (isCacheValid) {
          console.log(
            `Loading sub-categories for ${selectedAggregate} from cache...`,
          );
          setSubCategories(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      fetchSubCategories();
    } else {
      setLoading(false);
      setError("No category selected");
    }
  }, [selectedAggregate]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "✨ Fetching sub-categories for:",
        brand
          ? { selectedAggregate, brand }
          : { selectedAggregate, make, model },
      );

      // Use masterType API with batch loading
      const BATCH_SIZE = 500;
      const MAX_BATCHES = 50;
      const uniqueSubAggregates = new Set();
      let offset = 0;
      let batchCount = 0;
      let consecutiveEmptyBatches = 0;
      let consecutiveErrors = 0;

      // Fetch in batches until we stop finding new sub-categories
      while (batchCount < MAX_BATCHES && consecutiveErrors < 3) {
        console.log(
          `📦 Fetching batch ${batchCount + 1} (offset: ${offset}, limit: ${BATCH_SIZE})`,
        );
        console.log(
          `📤 Request params:`,
          brand
            ? { brand, aggregate: selectedAggregate }
            : { make, model, aggregate: selectedAggregate },
          `masterType=subAggregate`,
        );

        try {
          const response = await masterListAPI({
            partNumber: null,
            sortOrder: "ASC",
            customerCode: "0046",
            aggregate: selectedAggregate,
            brand: brand || null,
            fuelType: null,
            limit: BATCH_SIZE,
            make: brand ? null : make || null,
            masterType: "subAggregate",
            model: brand ? null : model || null,
            offset: offset,
            primary: false,
            subAggregate: null,
            variant: null,
            year: null,
          });

          console.log(`📥 Batch ${batchCount + 1} response:`, {
            success: response?.success,
            message: response?.message,
            count: response?.count,
            dataLength: response?.data?.length,
          });

          // Extract master data
          let masterData = [];

          if (Array.isArray(response)) {
            masterData = response; // direct array response
          } else if (Array.isArray(response?.data)) {
            masterData = response.data; // { data: [] }
          } else if (Array.isArray(response?.rows)) {
            masterData = response.rows; // { rows: [] }
          } else if (Array.isArray(response?.result)) {
            masterData = response.result; // { result: [] }
          } else {
            console.error("❌ Unknown API response structure:", response);
          }

          // If no data returned, we've reached the end
          if (!masterData || masterData.length === 0) {
            console.log("✅ No more data in this batch");
            consecutiveEmptyBatches++;
            if (consecutiveEmptyBatches >= 3) break;
          } else {
            consecutiveEmptyBatches = 0;
            consecutiveErrors = 0; // Reset error counter on success
          }

          // Count sub-categories before adding new ones
          const previousSize = uniqueSubAggregates.size;

          // Extract masterName (sub-aggregate/subcategory name) from each item
          masterData.forEach((item) => {
            if (item.masterName && item.masterName.trim() !== "") {
              uniqueSubAggregates.add(item.masterName.trim());
            }
          });

          const newSubCategoriesFound = uniqueSubAggregates.size - previousSize;
          console.log(
            `📊 Found ${newSubCategoriesFound} new sub-categories (total: ${uniqueSubAggregates.size})`,
          );

          // Progressive loading: Update UI with sub-categories found so far
          if (uniqueSubAggregates.size > 0 && batchCount % 2 === 0) {
            // Update every 2 batches to show progress
            const subAggregatesArray = Array.from(uniqueSubAggregates).sort();
            const progressiveSubCategories = subAggregatesArray.map(
              (subAggregate, index) => ({
                id: index + 1,
                name: subAggregate
                  .toLowerCase()
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" "),
                subAggregateName: subAggregate,
                image: getIconForSubCategory(subAggregate),
              }),
            );
            setSubCategories(progressiveSubCategories);
            console.log(
              `🔄 Progressive update: Showing ${progressiveSubCategories.length} sub-categories`,
            );
          }

          // If no new sub-categories found in last 3 batches, stop
          if (newSubCategoriesFound === 0 && batchCount > 2) {
            console.log("✅ No new sub-categories found, stopping...");
            break;
          }
        } catch (batchError) {
          consecutiveErrors++;
          console.error(`❌ Error in batch ${batchCount + 1}:`, {
            message: batchError.message,
            status: batchError.response?.status,
            data: batchError.response?.data,
            code: batchError.code,
          });

          // If timeout, stop and use what we have
          if (
            batchError.code === "ECONNABORTED" ||
            batchError.response?.status === 504 ||
            batchError.response?.status === 500
          ) {
            console.error("⏱️ Timeout/Server error - stopping batch fetch");
            if (uniqueSubAggregates.size > 0) {
              console.log(
                `💡 Using ${uniqueSubAggregates.size} sub-categories found so far`,
              );
              break;
            } else {
              // No data collected yet, this is a real error
              console.error("⚠️ Failed on first batch, cannot proceed");
              throw batchError;
            }
          }

          if (consecutiveErrors >= 3) {
            console.error("⚠️ Too many consecutive errors");
            throw batchError;
          }
        }

        offset += BATCH_SIZE;
        batchCount++;
      }

      console.log(
        `✅ Total unique sub-categories found: ${uniqueSubAggregates.size}`,
      );

      if (uniqueSubAggregates.size === 0) {
        setError(`No sub-categories available for ${selectedAggregate}`);
        setLoading(false);
        return;
      }

      // Format sub-categories
      const subAggregatesArray = Array.from(uniqueSubAggregates).sort();
      const formattedSubCategories = subAggregatesArray.map(
        (subAggregate, index) => ({
          id: index + 1,
          name: subAggregate
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          subAggregateName: subAggregate,
          image: getIconForSubCategory(subAggregate),
        }),
      );

      console.log("✅ Formatted sub-categories:", formattedSubCategories);

      // Cache the sub-categories
      const cacheKey = brand
        ? `subCategory_${selectedAggregate}_brand_${brand}`
        : `subCategory_${selectedAggregate}`;
      localStorage.setItem(cacheKey, JSON.stringify(formattedSubCategories));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      console.log(
        `💾 Sub-categories for ${selectedAggregate} cached successfully`,
      );

      setSubCategories(formattedSubCategories);
    } catch (err) {
      setError("Failed to load sub-categories");
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for service type enhancement
  
  // Map category names from Categories API to Labour API format
  const mapCategoryToLabourAPI = (categoryName) => {
    if (!categoryName) return null;
    
    const upperCategory = categoryName.toUpperCase().replace(/\s+/g, ' ').trim();
    
    // Direct mapping from Categories API to Labour API
    const categoryMap = {
      'BRAKE SYSTEM': 'Brake',
      'BRAKE': 'Brake',
      'HVAC/THERMAL': 'AC_System',
      'HVAC THERMAL': 'AC_System',
      'AC SYSTEM': 'AC_System',
      'ELECTRICALS AND ELECTRONICS': 'Electrical',
      'ELECTRICAL': 'Electrical',
      'FUEL SYSTEM': 'Fuel_System',
      'BODY PARTS': 'Body_Frame',
      'BODY FRAME': 'Body_Frame',
      'WHEELS AND TYRES': 'Tyre',
      'TYRE': 'Tyre',
      'TYRES': 'Tyre',
      'ENGINE': 'Engine',
      'STEERING': 'Steering',
      'SUSPENSION': 'Suspension',
      'TRANSMISSION': 'Transmission',
      'CLUTCH SYSTEM': 'Transmission',
      'LUBRICATION': 'Lubrication',
      'COOLING': 'Cooling',
      // Categories that don't have labour API equivalents
      'WIPER SYSTEM': null,
      'ACCESSORIES': null,
      'BATTERY': null,
      'BEARING': null,
      'BELTS AND TENSIONER': null,
      'CABLES AND WIRES': null,
      'CHILD PARTS': null,
      'FILTERS': null,
      'FLUIDS COOLANT AND GREASE': null,
      'GLASS': null,
      'HORNS': null,
      'INTERIOR AND COMFORTS': null,
      'LIGHTING': null,
      'LUBES': null,
      'PAINTS AND CONSUMABLES': null,
      'RUBBERS HOSES AND MOUNTINGS': null,
    };
    
    return categoryMap[upperCategory] || null;
  };
  
  const formatCategoryName = (categoryName) => {
    if (!categoryName || categoryName === "Unknown") return "Unknown";
    return categoryName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const generateErrorMessage = (error, categoryName) => {
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      return "Service types loading timeout - please refresh";
    }
    if (error.response?.status >= 500) {
      return "Service types temporarily unavailable";
    }
    if (error.message?.includes('malformed') || error.message?.includes('parse')) {
      return "Service types temporarily unavailable";
    }
    return "Failed to load service types";
  };

  const generateNoServiceTypeMessage = (categoryName) => {
    const formattedName = formatCategoryName(categoryName);
    return `No service type for this category: ${formattedName}`;
  };

  const fetchServiceTypes = async () => {
    try {
      setServiceTypeLoading(true);
      setServiceTypeError(null);
      setCategoryMatchStatus(null); // Reset match status

      console.log("➡️ Fetching Service Types (Labour API)");
      console.log("🎯 Current category:", selectedAggregate || category);

      // Get current category name for messaging
      const currentCategoryName = selectedAggregate || category || "Unknown";

      console.log("📤 Calling Labour API");

      const response = await labourAPI();

      console.log("📥 Labour API raw response:", response);

      // Response is already the data
      const data = response;

      console.log("🔍 Parsed data:", data);

      if (data?.requestSuccessful !== true) {
        throw new Error("Labour API failed");
      }

const labourCategories = data?.labourCategory;
const labourSubcategory = data?.labourSubcategory;

if (!labourSubcategory || !labourCategories) {
  throw new Error("No labour data in response");
}

console.log("🧪 labourSubcategory keys:", Object.keys(labourSubcategory));

// Enhanced category matching with mapping
console.log("🔍 Enhanced category matching for:", currentCategoryName);

// Map the category name to Labour API format
const mappedCategoryName = mapCategoryToLabourAPI(currentCategoryName);
console.log("🗺️ Mapped category name:", mappedCategoryName);

// If mapping returns null, this category has no labour API equivalent
if (mappedCategoryName === null) {
  console.log("❌ Category has no labour API equivalent:", currentCategoryName);
  setCategoryMatchStatus({ found: false, category: null, matchType: 'no_mapping' });
  setServiceTypeError(generateNoServiceTypeMessage(currentCategoryName));
  return;
}

// Use the mapped name to find the matching category
let matchingCategory = null;

// Try exact match with mapped name (case insensitive) - also handle underscores vs spaces
matchingCategory = labourCategories.find(cat => {
  const catName = cat.labourCategoryName.toUpperCase().replace(/_/g, ' ');
  const searchName = mappedCategoryName.toUpperCase().replace(/_/g, ' ');
  return catName === searchName;
});

if (matchingCategory) {
  console.log("✅ Exact match found:", matchingCategory);
  setCategoryMatchStatus({ found: true, category: matchingCategory, matchType: 'exact' });
} else {
  // No exact match found even after mapping
  console.log("❌ No exact match found for mapped category:", mappedCategoryName);
  console.log("❌ Available categories:", labourCategories.map(cat => cat.labourCategoryName));
  setCategoryMatchStatus({ found: false, category: null, matchType: 'none' });
  setServiceTypeError(generateNoServiceTypeMessage(currentCategoryName));
  return;
}

console.log("🎯 Final matching category:", matchingCategory);

let targetCategoryId = null;
let actualCategoryName = null;
if (matchingCategory) {
  targetCategoryId = matchingCategory.labourCategoryId;
  actualCategoryName = matchingCategory.labourCategoryName;
  console.log("✅ Target category ID:", targetCategoryId);
  console.log("✅ Actual category name from API:", actualCategoryName);
} else {
  console.log("❌ No category match found. Available categories:", 
    labourCategories.map(cat => cat.labourCategoryName));
}

const services = [];

if (targetCategoryId && labourSubcategory[targetCategoryId]) {
  // Show only subcategories for the current category
  const subcategoryArray = labourSubcategory[targetCategoryId];
  console.log(`📂 Processing category ${targetCategoryId} (${actualCategoryName}) with ${subcategoryArray.length} items`);
  
  // Since the API returns all subcategories under each category,
  // we'll show all of them but prioritize relevant ones
  console.log(`🔍 Showing all subcategories for ${actualCategoryName} (API limitation)`);
  
  subcategoryArray.forEach((item) => {
    const itemKeys = Object.keys(item);
    if (itemKeys.length > 0) {
      const subcategoryData = item[itemKeys[0]];
      
      if (subcategoryData?.LabourSubcategoryName) {
        const subcategoryName = subcategoryData.LabourSubcategoryName.trim();
        
        services.push({
          id: itemKeys[0],
          name: subcategoryName,
          categoryId: targetCategoryId,
        });
      }
    }
  });
  
  console.log(`✅ Showing ${services.length} subcategories for ${actualCategoryName}`);
} else {
  // Fallback: show all subcategories if no specific category match
  console.log("🔄 Fallback: Processing all categories");
  Object.entries(labourSubcategory).forEach(([categoryId, subcategoryArray]) => {
    console.log(`📂 Category ${categoryId} size:`, subcategoryArray?.length);

    if (!Array.isArray(subcategoryArray)) return;

    subcategoryArray.forEach((item) => {
      const itemKeys = Object.keys(item);
      if (itemKeys.length > 0) {
        const subcategoryData = item[itemKeys[0]];
        
        if (subcategoryData?.LabourSubcategoryName) {
          services.push({
            id: itemKeys[0],
            name: subcategoryData.LabourSubcategoryName.trim(),
            categoryId: categoryId,
          });
        }
      }
    });
  });
}

console.log("🔢 Total services:", services.length);

      // Check if we have services after successful API call and category match
      if (services.length === 0 && matchingCategory) {
        setServiceTypeError("No service types available for this category");
        return;
      }

      // Don't deduplicate - show all subcategories as they come from the API
      console.log("✅ Service Types ready:", services);

      setServiceTypes(services);
    } catch (err) {
      console.error("❌ Failed to load service types:", err);
      
      // Use enhanced error message generation
      const currentCategoryName = selectedAggregate || category || "Unknown";
      const errorMessage = generateErrorMessage(err, currentCategoryName);
      setServiceTypeError(errorMessage);
    } finally {
      setServiceTypeLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const handleSubCategoryClick = (subCategory) => {
    navigate("/vehicle-number-products", {
      state: {
        make,
        model,
        brand,
        category,
        aggregateName: selectedAggregate, // Pass the selected aggregate name
        subCategory: subCategory.name,
        subAggregateName: subCategory.subAggregateName,
        featureLabel,
        variant,
      },
    });
  };

  const handleServiceTypeClick = (serviceType) => {
    navigate("/search-by-service-type", {
      state: {
        make,
        model,
        brand,
        category,
        subCategory: serviceType,
      },
    });
  };

  // Build breadcrumbs array
  const breadcrumbs = [];

  if (brand) {
    breadcrumbs.push({
      label: brand,
      onClick: () =>
        navigate("/brand", {
          state: { variant, featureLabel, isOnlyWithUs },
        }),
    });
  }

  if (make) {
    breadcrumbs.push({
      label: make,
      onClick: () =>
        navigate("/MakeNew", {
          state: { variant, featureLabel },
        }),
    });
  }

  if (model) {
    breadcrumbs.push({
      label: model,
      onClick: () =>
        navigate("/Model", {
          state: { make, variant, featureLabel },
        }),
    });
  }

  if (selectedAggregate || category) {
    // Fast Movers and High Value use /Category, others use /CategoryNew
    const isFastMoversOrHighValue =
      variant === "fm" ||
      variant === "hv" ||
      featureLabel === "Fast Movers" ||
      featureLabel === "High Value";

    breadcrumbs.push({
      label: selectedAggregate || category,
      onClick: () =>
        navigate(isFastMoversOrHighValue ? "/Category" : "/CategoryNew", {
          state: { make, model, variant, featureLabel, brand, isOnlyWithUs },
        }),
    });
  }

  return (
    <div className="sub-category-container">
      {/* Header */}
      <div className="sub-category-header">
        <Navigation breadcrumbs={breadcrumbs} />
      </div>

      <div className="sub-category-main">
        {/* Sub Categories */}
        <div className="sub-category-content">
          {loading && subCategories.length === 0 ? (
            // Initial loading skeleton
            <div className="sub-category-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="sub-category-item skeleton-sub-item"
                >
                  <div className="sub-category-image-wrapper">
                    <div className="skeleton skeleton-sub-image"></div>
                  </div>
                  <div className="sub-category-label">
                    <div className="skeleton skeleton-sub-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="sub-category-error">
              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "red",
                  marginBottom: "10px",
                }}
              >
                {error}
              </p>
              <button
                onClick={fetchSubCategories(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "block",
                  margin: "0 auto",
                }}
              >
                Retry
              </button>
            </div>
          ) : subCategories.length === 0 && !loading ? (
            <div className="sub-category-empty">
              <p style={{ textAlign: "center", padding: "20px" }}>
                No subcategories found for {selectedAggregate || category}.
              </p>
            </div>
          ) : (
            <>
              <div className="sub-category-grid">
                {subCategories.map((subCategory, index) => (
                  <div
                    key={subCategory.id}
                    className="sub-category-item"
                    onClick={() => handleSubCategoryClick(subCategory)}
                  >
                    <div className="sub-category-image-wrapper">
                      <OciImage
                        partNumber={subCategory.subAggregateName}
                        folder="subcategories"
                        fallbackImage={NoImage}
                        className="sub-category-image"
                        alt={subCategory.name}
                      />
                    </div>
                    <div className="sub-category-label">
                      <span title={subCategory.name}>{subCategory.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* SERVICE TYPE SIDEBAR (COMMENTED OUT - NOT NEEDED) */}
        {/* <div className="service-type-sidebar">
          <div className="service-type-header">
            <div className="service-type-icon">
              <img
                src={getAsset('SERVICE TYPE', assets)}
                alt="Service Type"
              />
            </div>
            <span>
              Service Type for {selectedAggregate || category || "Category"}
            </span>
          </div>

          <ul className="service-type-list">
            {serviceTypeLoading ? (
              <li className="service-type-item">Loading service types...</li>
            ) : serviceTypeError ? (
              <li className="service-type-item" style={{ color: "red" }}>
                {serviceTypeError}
              </li>
            ) : serviceTypes.length === 0 ? (
              <li className="service-type-item">No service types available</li>
            ) : (
              serviceTypes.map((service) => (
                <li
                  key={service.id}
                  className="service-type-item"
                  onClick={() => handleServiceTypeClick(service.name)}
                >
                  {service.name}
                </li>
              ))
            )}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Sub_Category;
