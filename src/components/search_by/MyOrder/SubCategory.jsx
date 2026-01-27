import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiService from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import OciImage from "../../oci_image/ociImages";
import Navigation from "../../Navigation/Navigation";
import "../../../styles/home/SubCategory.css";

const Sub_Category = () => {
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

  const [uiAssets, setUiAssets] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getIconForSubCategory = (subAggregateName) => {
    const upperName = subAggregateName.toUpperCase();
    return [upperName] || NoImage;
  };

  // Fetch UI assets
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data);
      } catch (err) {
        console.error("❌ Failed to load UI assets", err);
      }
    };
    fetchUiAssets();
  }, []);

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

      console.log("✨ Fetching sub-categories for:", brand ? { selectedAggregate, brand } : { selectedAggregate, make, model });

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
        console.log(`📦 Fetching batch ${batchCount + 1} (offset: ${offset}, limit: ${BATCH_SIZE})`);
        console.log(`📤 Request params:`, brand ? { brand, aggregate: selectedAggregate } : { make, model, aggregate: selectedAggregate }, `masterType=subAggregate`);

        try {
          const response = await axios.post(
            "http://localhost:5000/api/matertype",
            {
              partNumber: null,
              sortOrder: "ASC",
              customerCode: "0046",
              aggregate: selectedAggregate,
              brand: brand || null,
              fuelType: null,
              limit: BATCH_SIZE,
              make: brand ? null : (make || null),
              masterType: "subAggregate",
              model: brand ? null : (model || null),
              offset: offset,
              primary: false,
              subAggregate: null,
              variant:  null,
              year: null,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 120000,
            },
          );

          console.log(`📥 Batch ${batchCount + 1} response:`, {
            success: response.data?.success,
            message: response.data?.message,
            count: response.data?.count,
            dataLength: response.data?.data?.length,
          });

          // Extract master data
          const masterData = Array.isArray(response.data?.data) ? response.data.data : [];

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
          console.log(`📊 Found ${newSubCategoriesFound} new sub-categories (total: ${uniqueSubAggregates.size})`);

          // Progressive loading: Update UI with sub-categories found so far
          if (uniqueSubAggregates.size > 0 && batchCount % 2 === 0) {
            // Update every 2 batches to show progress
            const subAggregatesArray = Array.from(uniqueSubAggregates).sort();
            const progressiveSubCategories = subAggregatesArray.map((subAggregate, index) => ({
              id: index + 1,
              name: subAggregate
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              subAggregateName: subAggregate,
              image: getIconForSubCategory(subAggregate),
            }));
            setSubCategories(progressiveSubCategories);
            console.log(`🔄 Progressive update: Showing ${progressiveSubCategories.length} sub-categories`);
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
          if (batchError.code === "ECONNABORTED" || batchError.response?.status === 504 || batchError.response?.status === 500) {
            console.error("⏱️ Timeout/Server error - stopping batch fetch");
            if (uniqueSubAggregates.size > 0) {
              console.log(`💡 Using ${uniqueSubAggregates.size} sub-categories found so far`);
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

      console.log(`✅ Total unique sub-categories found: ${uniqueSubAggregates.size}`);

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

  // Helper to build full asset URL
  const getAssetUrl = (filePath) => {
    if (!filePath) return "";
    return apiService.getAssetUrl(filePath);
  };

  const serviceTypes = [
    "Complete Brake System Inspection",
    "Brake Noise / Vibration Diagnosis",
    "Brake Fluid Level Check",
    "ABS Warning Light Check",
    "Front Brake Pad Replacement",
    "Rear Brake Pad Replacement",
    "Brake Shoe Replacement (Drum Brakes)",
    "Brake Pad Cleaning & Adjustment",
    "Brake Rotor (Disc) Replacement",
    "Brake Rotor Resurfacing",
    "Brake Drum Replacement",
    "Brake Drum Turning / Resurfacing",
    "Brake Caliper Repair / Replacement",
    "Brake Line / Hose Replacement",
    "Brake Bleeding (Air Removal)",
    "Brake Oil Change (Brake Fluid Flush)",
    "Handbrake Cable Adjustment",
  ];

  const handleBack = () => navigate(-1);

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
    breadcrumbs.push({
      label: selectedAggregate || category,
      onClick: () =>
        navigate("/CategoryNew", {
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
                {subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    className="sub-category-item"
                    onClick={() => handleSubCategoryClick(subCategory)}
                  >
                    <div className="sub-category-image-wrapper">
                      <OciImage
                        partNumber={subCategory.subAggregateName}
                        folder="subcategories"
                        fallbackImage={subCategory.image}
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

        {/* Service Type Sidebar */}
        <div className="service-type-sidebar">
          <div className="service-type-header">
            <span>
              Service Type for {selectedAggregate || category || "Category"}
            </span>
            <div className="service-type-icon">
              <img
                src={getAssetUrl(uiAssets["SERVICE TYPE"])}
                alt="Service Type"
              />
            </div>
          </div>

          <ul className="service-type-list">
            {serviceTypes.map((service, index) => (
              <li
                key={index}
                className="service-type-item"
                onClick={() => handleServiceTypeClick(service)}
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sub_Category;
