import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/Category.css";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import apiService from "../../../services/apiservice";
import CategorySkeleton from "../../skeletonLoading/CategorySkeleton";
import Image from "../../oci_image/ociImages";

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract state variables including make, model, and variant
  const { featureLabel, make, model, variant } = location.state || {};

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uiAssets, setUiAssets] = useState({});

  /* ===============================
     FETCH UI ASSETS
     =============================== */
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data);
      } catch (error) {
        console.error("❌ Error fetching UI assets:", error);
      }
    };
    fetchUiAssets();
  }, []);

  const getAssetUrl = (tagName) => {
    if (!uiAssets[tagName]) return "";
    return apiService.getAssetUrl(uiAssets[tagName]);
  };

  /* ===============================
     FETCH FASTMOVER CATEGORIES
     =============================== */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get("/fastmovers");

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error("Invalid API response");
      }

      // ✅ Deduplicate aggregate values
      const uniqueAggregates = [
        ...new Set(response.data.map((item) => item.aggregate)),
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

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <div className="breadcrumb-nav">
          <img
            src={getAssetUrl("HOME")}
            alt="Home"
            className="breadcrumb-link"
            style={{ cursor: "pointer", width: "20px", height: "20px" }}
            onClick={() => navigate("/home")}
            title="Home"
          />
          {make && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span 
                className="breadcrumb-link" 
                onClick={() => navigate('/MakeNew', { 
                  state: { variant, featureLabel } 
                })}
              >
                {make}
              </span>
            </>
          )}
          {model && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span 
                className="breadcrumb-link" 
                onClick={() => navigate('/Model', { 
                  state: { make, variant, featureLabel } 
                })}
              >
                {model}
              </span>
              <span className="breadcrumb-separator">&gt;</span>
            </>
          )}
        </div>
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
            <Image
              partNumber={category.name}
              folder="categories"
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
