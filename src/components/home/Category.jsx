import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CategorySkeleton from "../skeletonLoading/CategorySkeleton";
// import NoImage from "../../assets/No Image.png";
import "../../styles/home/Category.css";
import OciImage from "../oci_image/ociImages";

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
        setCategories(JSON.parse(cachedCategories));
        setLoading(false);
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

      console.log("Fetching categories from API...");

      const response = await axios.post(
        "http://localhost:5000/api/parts-list",
        {
          brandPriority: ["VALEO"],
          limit: 5000, // Increased to get more unique categories
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: null,
          customerCode: "0046",
          partNumber: null,
          model: null,
          brand: null,
          subAggregate: null,
          aggregate: null, // Get all aggregates
          make: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 90000, // 90 second timeout for larger dataset
        },
      );

      console.log("API Response:", response);
      console.log("Response data:", response.data);

      // Check if using mock data
      if (
        response.data.message &&
        response.data.message.includes("mock data")
      ) {
        console.warn("⚠️ Using mock category data - external API unavailable");
      }

      // Handle different response structures
      let partsData = [];
      if (Array.isArray(response.data)) {
        partsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        partsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.parts)) {
        partsData = response.data.parts;
      } else {
        console.error("Unexpected response structure:", response.data);
        throw new Error("Invalid response format");
      }

      console.log("Parts data:", partsData);

      // Extract unique aggregates (Categories) from the response
      const uniqueAggregates = [
        ...new Set(
          partsData
            .map((item) => item.aggregate)
            .filter((aggregate) => aggregate), // Remove null/undefined/empty
        ),
      ];

      console.log("Unique aggregates:", uniqueAggregates);

      // Format categories with proper title case and icons
      const formattedCategories = uniqueAggregates.map((aggregate, index) => ({
        id: index + 1,
        label: aggregate
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        aggregateName: aggregate,
        icon: getIconForCategory(aggregate),
      }));

      console.log("Formatted categories:", formattedCategories);

      // Cache the categories in localStorage
      localStorage.setItem(
        "categoryCache",
        JSON.stringify(formattedCategories),
      );
      localStorage.setItem("categoryCacheTimestamp", Date.now().toString());
      console.log("Categories cached successfully");

      setCategories(formattedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Handle errors
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError(
          "Request timeout. The external API is slow or unreachable. Please try again later.",
        );
      } else if (err.response?.data?.error?.includes("timeout")) {
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
          {visibleCategories.map((cat) => (
            <div
              key={cat.id}
              className=" cat-card"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className=" cat-img-box">
                <OciImage
                  partNumber={cat.aggregateName}
                  folder="categories"
                  fallbackImage={cat.icon}
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
