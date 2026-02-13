import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategorySkeleton from "../skeletonLoading/CategorySkeleton";
import { masterListAPI } from "../../services/api";
import OciImage from "../oci_image/ociImages";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Category.css";
import "../../styles/skeleton/skeleton.css";

const Category = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getIconForCategory = (aggregateName) => {
    const upperName = aggregateName.toUpperCase();
    return [upperName];
  };

  useEffect(() => {
    // Check if categories are already cached in localStorage
    const cachedCategories = localStorage.getItem("categoryCache");
    const cacheTimestamp = localStorage.getItem("categoryCacheTimestamp");
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cachedCategories && cacheTimestamp) {
      const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;

      if (isCacheValid) {
        console.log("Loading categories from cache...");
        const cachedData = JSON.parse(cachedCategories);
        setCategories(cachedData);
        setLoading(false);
        
        // Preload visible images in background
        // smartPreload(cachedData, 9, preloadCategoryImages);
        return;
      }
    }

    // If no valid cache, fetch from API
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("✨ Fetching categories from masterType API...");

      const BATCH_SIZE = 500; // Larger batch for masterType API
      const MAX_BATCHES = 50; // Enough batches
      const uniqueAggregates = new Set();
      let offset = 0;
      let batchCount = 0;
      let consecutiveEmptyBatches = 0;
      let consecutiveErrors = 0;

      // Fetch in batches until we stop finding new categories
      while (batchCount < MAX_BATCHES && consecutiveErrors < 3) {
        console.log(
          `📦 Fetching batch ${batchCount + 1} (offset: ${offset})...`,
        );

        try {
          const response = await masterListAPI({
            partNumber: null,
            sortOrder: "ASC",
            customerCode: "0046",
            aggregate: null,
            brand: null,
            fuelType: null,
            limit: BATCH_SIZE,
            make: null,
            masterType: "aggregate", // Get all aggregates
            model: null,
            offset: offset,
            primary: false,
            subAggregate: null,
            variant: null,
            year: null,
          });
console.log("RAW API RESPONSE:", response);

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
            masterData = response.data;
          } else if (Array.isArray(response?.result)) {
            masterData = response.result;
          } else if (Array.isArray(response?.data?.data)) {
            masterData = response.data.data;
          } else {
            console.error("❌ Unknown API structure:", response);
          }

          // If no data returned, we've reached the end
          if (!masterData || masterData.length === 0) {
            console.log("✅ No more data in this batch");
            consecutiveEmptyBatches++;
            if (consecutiveEmptyBatches >= 3) break;
          } else {
            consecutiveEmptyBatches = 0;
            consecutiveErrors = 0; // Reset on success
          }

          // Count categories before adding new ones
          const previousSize = uniqueAggregates.size;

          // Extract aggregates from this batch using masterName field
          masterData.forEach((item) => {
            const aggregateValue =
              item.aggregate ||
              item.aggregateName ||
              item.masterName ||
              item.master_value ||
              item.value;

            if (aggregateValue && String(aggregateValue).trim() !== "") {
              uniqueAggregates.add(String(aggregateValue).trim());
            }
          });

          const newCategoriesFound = uniqueAggregates.size - previousSize;
          console.log(
            `📊 Found ${newCategoriesFound} new categories (total: ${uniqueAggregates.size})`,
          );

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
          });
          consecutiveErrors++;

          // If it's a timeout, stop immediately
          if (
            batchError.code === "ECONNABORTED" ||
            batchError.response?.status === 504 ||
            batchError.response?.status === 500
          ) {
            console.error("⏱️ Timeout/Server error - stopping batch fetch");
            if (uniqueAggregates.size > 0) {
              console.log(
                `💡 Using ${uniqueAggregates.size} categories found so far`,
              );
              break; // Use what we have
            } else {
              console.error("⚠️ Failed on first batch");
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
        setError("No categories available at the moment.");
        setLoading(false);
        return;
      }

      // Convert Set to sorted Array and format categories
      const aggregatesArray = Array.from(uniqueAggregates).sort();
      const formattedCategories = aggregatesArray.map((aggregate, index) => ({
        id: index + 1,
        label: aggregate
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        aggregateName: aggregate,
        icon: getIconForCategory(aggregate),
      }));

      console.log("✅ Formatted categories:", formattedCategories);

      // Cache the categories in localStorage
      localStorage.setItem(
        "categoryCache",
        JSON.stringify(formattedCategories),
      );
      localStorage.setItem("categoryCacheTimestamp", Date.now().toString());
      console.log("💾 Categories cached successfully");

      setCategories(formattedCategories);
    
      
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Handle errors
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError(
          "⏱️ Request timeout. The external API is slow. Please try again later.",
        );
      } else if (err.response?.status === 504) {
        setError(
          "⏱️ Gateway timeout. The external API is taking too long. Please try again later.",
        );
      } else if (
        err.response?.data?.message &&
        err.response.data.message.includes("Query execution was interrupted")
      ) {
        setError("Database timeout. Please try again in a few moments.");
      } else if (
        err.response?.data?.error &&
        typeof err.response.data.error === "string" &&
        err.response.data.error.includes("timeout")
      ) {
        setError("External API timeout. Please try again in a moment.");
      } else {
        setError(
          `Failed to load categories: ${err.message || "Please try again."}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate("/sub_category", {
      state: {
        category: category.label, // ✅ FIX
        aggregateName: category.aggregateName, // ✅ OK
      },
    });
  };

  const visibleCategories = expanded ? categories : categories.slice(0, 9);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Category</h3>
        <span className="see-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      {loading ? (
        <CategorySkeleton count={9} />
      ) : error ? (
        <div
          className="grid-container"
          style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}
        >
          <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          <button
            onClick={fetchCategories}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid-container">
          {visibleCategories.map((cat, index) => (
            <div
              key={cat.id}
              className=" cat-card"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className=" cat-img-box">
                <OciImage
                  partNumber={cat.aggregateName}
                  folder="categories"
                  fallbackImage={NoImage}
                  className="cat-img"
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className="cat-divider"></div>

              <p className="cat-label" title={cat.label}>
                {cat.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Category;
