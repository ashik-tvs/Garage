import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/CategoryNew.css";
import apiService from "../../../services/apiservice";
import OciImage from "../../oci_image/ociImages.jsx";
import Navigation from "../../Navigation/Navigation";
import NoImage from "../../../assets/No Image.png";

const CategoryNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract state variables including make, model, variant, and brand
  const { featureLabel, make, model, variant, brand, isOnlyWithUs, fromHome } = location.state || {};

  console.log("🔍 CategoryNew mounted with location.state:", location.state);
  console.log("🔍 Extracted values:", { featureLabel, make, model, variant, brand, isOnlyWithUs, fromHome });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getIconForCategory = (aggregateName) => {
    const upperName = aggregateName.toUpperCase();
    return [upperName] || NoImage;
  };

  /* ===============================
     FETCH CATEGORIES USING MASTERTYPE API
     =============================== */
  const fetchCategories = async () => {
    console.log("🚀 fetchCategories called with:", { make, model, variant, brand });
    
    // Validate: Either brand OR model must be present (make is optional for discontinued/electric)
    if (!brand && !model) {
      console.error("❌ Missing required parameters:", { make, model, brand });
      setError("Either Brand or Model is required");
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = brand 
      ? `categories_brand_${brand}` 
      : make 
        ? `categories_${make}_${model}_${variant || 'all'}` 
        : `categories_model_${model}_${variant || 'all'}`;
    console.log("🔑 Cache key:", cacheKey);
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    if (cachedData && cacheTimestamp) {
      const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;
      if (isCacheValid) {
        console.log("💾 Loading categories from cache...");
        setCategories(JSON.parse(cachedData));
        return;
      } else {
        console.log("🗑️ Cache expired, fetching fresh data");
      }
    } else {
      console.log("📭 No cache found, fetching from API");
    }

    try {
      setLoading(true);
      setError(null);

      console.log("✨ Fetching categories for:", brand ? { brand } : make ? { make, model, variant } : { model, variant });

      // Use masterType API with batch loading (match Category.jsx pattern)
      const BATCH_SIZE = 500;
      const MAX_BATCHES = 50;
      const uniqueAggregates = new Set();
      let offset = 0;
      let batchCount = 0;
      let consecutiveEmptyBatches = 0;
      let consecutiveErrors = 0;

      // Fetch in batches until we stop finding new categories
      while (batchCount < MAX_BATCHES && consecutiveErrors < 3) {
        console.log(`📦 Fetching batch ${batchCount + 1} (offset: ${offset}, limit: ${BATCH_SIZE})`);
        console.log(`📤 Request params:`, brand ? { brand } : make ? { make, model } : { model }, `masterType=aggregate`);

        const requestBody = {
          partNumber: null,
          sortOrder: "ASC",
          customerCode: "0046",
          aggregate: null,
          brand: brand || null,
          fuelType: null,
          limit: BATCH_SIZE,
          make: brand ? null : (make || null),
          masterType: "aggregate",
          model: brand ? null : model,
          offset: offset,
          primary: false,
          subAggregate: null,
          variant: null,  // ✅ Always null - variant not used for aggregate filtering
          year: null,
        };

        console.log(`🔍 Batch ${batchCount + 1} request body:`, JSON.stringify(requestBody, null, 2));

        try {
          const response = await apiService.post("/matertype", requestBody);

          console.log(`📥 Batch ${batchCount + 1} response:`, {
            success: response?.success,
            message: response?.message,
            count: response?.count,
            dataLength: response?.data?.length,
          });

          if (batchCount === 0) {
            console.log(`🔍 First batch full response:`, response);
            console.log(`🔍 First batch response.data:`, response?.data);
          }

          // Extract master data
          // apiService.post returns the response body directly, so response.data is the array
          const masterData = Array.isArray(response?.data) ? response.data : [];
          
          if (batchCount === 0) {
            console.log(`🔍 First batch masterData:`, masterData);
            console.log(`🔍 First batch masterData length:`, masterData.length);
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

          // Count categories before adding new ones
          const previousSize = uniqueAggregates.size;

          // Extract masterName (aggregate/category name) from each item
          masterData.forEach((item) => {
            if (item.masterName && item.masterName.trim() !== "") {
              uniqueAggregates.add(item.masterName.trim());
            }
          });

          const newCategoriesFound = uniqueAggregates.size - previousSize;
          console.log(`📊 Found ${newCategoriesFound} new categories (total: ${uniqueAggregates.size})`);

          // Progressive loading: Update UI with categories found so far
          if (uniqueAggregates.size > 0 && batchCount % 2 === 0) {
            // Update every 2 batches to show progress
            const aggregatesArray = Array.from(uniqueAggregates).sort();
            const progressiveCategories = aggregatesArray.map((aggregate, index) => ({
              id: index + 1,
              name: aggregate
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              aggregateName: aggregate,
              image: getIconForCategory(aggregate),
            }));
            setCategories(progressiveCategories);
            console.log(`🔄 Progressive update: Showing ${progressiveCategories.length} categories`);
          }

          // If no new categories found in last 3 batches, stop
          if (newCategoriesFound === 0 && batchCount > 2) {
            console.log("✅ No new categories found, stopping...");
            break;
          }
        } catch (batchError) {
          console.error(`❌ Error in batch ${batchCount + 1}:`, {
            message: batchError.message,
            status: batchError.response?.status,
            data: batchError.response?.data,
            code: batchError.code,
          });
          consecutiveErrors++;

          // If timeout, stop and use what we have
          if (batchError.code === "ECONNABORTED" || batchError.response?.status === 504 || batchError.response?.status === 500) {
            console.error("⏱️ Timeout/Server error - stopping batch fetch");
            if (uniqueAggregates.size > 0) {
              console.log(`💡 Using ${uniqueAggregates.size} categories found so far`);
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

      console.log(`✅ Total unique categories found: ${uniqueAggregates.size}`);

      if (uniqueAggregates.size === 0) {
        setError(
          brand 
            ? `No categories available for brand ${brand}` 
            : make 
              ? `No categories available for ${make} ${model}` 
              : `No categories available for ${model}`
        );
        setLoading(false);
        return;
      }

      // Convert Set to Array and format categories
      const aggregatesArray = Array.from(uniqueAggregates).sort();
      const formattedCategories = aggregatesArray.map((aggregate, index) => ({
        id: index + 1,
        name: aggregate
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        aggregateName: aggregate,
        image: getIconForCategory(aggregate),
      }));

      console.log("✅ Formatted categories:", formattedCategories);

      setCategories(formattedCategories);

      // Cache data
      localStorage.setItem(cacheKey, JSON.stringify(formattedCategories));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      console.log("💾 Categories cached successfully");
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // More specific error message
      let errorMsg = "Failed to load categories. ";
      if (err.response?.status === 500 || err.response?.status === 504) {
        errorMsg += "The server is taking too long to respond. Please try again.";
      } else if (err.code === "ECONNABORTED") {
        errorMsg += "Request timeout. Please try again.";
      } else {
        errorMsg += err.message || "Please try again.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate("/sub_category", {
      state: {
        aggregate: category.aggregateName,
        aggregateName: category.aggregateName,
        category: category.aggregateName,
        featureLabel,
        make,
        model,
        variant,
        brand,
        isOnlyWithUs,
        fromHome, // Pass through fromHome flag
      },
    });
  };

  // Build breadcrumbs array
  const breadcrumbs = [];

  if (brand) {
    breadcrumbs.push({
      label: brand,
      onClick: () => navigate('/brand', { 
        state: { variant, featureLabel, isOnlyWithUs } 
      })
    });
  }

  if (make) {
    breadcrumbs.push({
      label: make,
      onClick: () => navigate('/MakeNew', { 
        state: { variant, featureLabel } 
      })
    });
  }

  if (model) {
    breadcrumbs.push({
      label: model,
      onClick: () => navigate('/Model', { 
        state: { make, variant, featureLabel } 
      })
    });
  }

  return (
    <div className="category-new-container">
      {/* Header */}
      <div className="category-new-header">
        <Navigation breadcrumbs={breadcrumbs} />
      </div>

      <div className="category-new-main">
        {/* Categories */}
        <div className="category-new-content">
          {loading && categories.length === 0 ? (
            // Initial loading skeleton
            <div className="category-new-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="category-new-item skeleton-cat-item"
                >
                  <div className="category-new-image-wrapper">
                    <div className="skeleton skeleton-cat-image"></div>
                  </div>
                  <div className="category-new-label">
                    <div className="skeleton skeleton-sub-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="category-new-error">
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
            </div>
          ) : categories.length === 0 && !loading ? (
            <p
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#666",
              }}
            >
              No categories available for {make} {model}
            </p>
          ) : (
            <>
              <div className="category-new-grid">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="category-new-item"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="category-new-image-wrapper">
                      <OciImage
                        partNumber={category.aggregateName}
                        folder="categories"
                        fallbackImage={category.image}
                        className="category-new-image"
                        alt={category.name}
                      />
                    </div>
                    <div className="category-new-label">
                      <span title={category.name}>{category.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Loading indicator for additional batches */}
              {/* {loading && categories.length > 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                  <p>Loading more categories...</p>
                </div>
              )} */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryNew;
