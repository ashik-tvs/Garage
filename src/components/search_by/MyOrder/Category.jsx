import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/Category.css";
import { fastMoversAPI, highValueAPI } from "../../../services/api";
import CategorySkeleton from "../../skeletonLoading/CategorySkeleton";
import OciImage from "../../oci_image/ociImages";
import NoImage from "../../../assets/No Image.png";
import Navigation from "../../Navigation/Navigation";

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract state variables including make, model, and variant
  const { featureLabel, make, model, variant } = location.state || {};

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ===============================
     FETCH CATEGORIES (Fast Movers or High Value)
     =============================== */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine which API to call based on variant or featureLabel
      const isFastMovers = variant === "fm" || featureLabel === "Fast Movers";
      const isHighValue = variant === "hv" || featureLabel === "High Value";

      let response;
      
      if (isFastMovers) {
        console.log("Fetching Fast Movers categories...");
        // Call centralized Fast Movers API (GET method, no request body)
        response = await fastMoversAPI();
      } else if (isHighValue) {
        console.log("Fetching High Value categories...");
        // Call centralized High Value API (GET method, no request body)
        response = await highValueAPI();
      } else {
        throw new Error("Invalid feature type. Expected Fast Movers or High Value.");
      }

      console.log("API Response:", response);

      // Handle response structure
      let data = [];
      if (response && response.success && Array.isArray(response.data)) {
        data = response.data;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        throw new Error("Invalid API response");
      }

      // ✅ Deduplicate aggregate values
      const uniqueAggregates = [
        ...new Set(data.map((item) => item.aggregate).filter(Boolean)),
      ];

      const formatted = uniqueAggregates.map((name, index) => ({
        id: index + 1,
        name,
      }));

      setCategories(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
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
        aggregate: category.name,
        featureLabel,
        make,
        model,
        variant,
      },
    });
  };

  // Build breadcrumbs array
  const breadcrumbs = [];

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
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <Navigation breadcrumbs={breadcrumbs} />
      </div>

      {/* Content */}
<div className="category-content">
  {/* Skeleton Loading */}
  {loading && <CategorySkeleton count={8} />}

  {/* Error State */}
  {!loading && error && (
    <p style={{ color: "red", textAlign: "center" }}>
      {error}
    </p>
  )}

  {/* Empty State */}
  {!loading && !error && categories.length === 0 && (
    <p style={{ textAlign: "center" }}>
      No categories available
    </p>
  )}

  {/* Category List */}
  {!loading &&
    !error &&
    categories.map((category) => (
      <div
        key={category.id}
        className="category-item"
        onClick={() => handleCategoryClick(category)}
      >
        <div className="category-card">
          {/* Image */}
          <div className="category-image-wrapper">
            <OciImage
              partNumber={category.name}
              folder="categories"
              fallbackImage={NoImage}
              className="category-image"
              alt={category.name}
            />
          </div>

          {/* Label */}
          <div className="category-label">
            <span title={category.name}>{category.name}</span>
          </div>
        </div>
      </div>
    ))}
</div>

    </div>
  );
};

export default Category;
