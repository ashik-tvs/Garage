import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/CategoryNew.css";
import axios from "axios";
import OciImage from "../../oci_image/ociImages";
import Navigation from "../../Navigation/Navigation";
import NoImage from "../../../assets/No Image.png";

const CategoryNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Extract state variables including make, model, and variant
  const { featureLabel, make, model, variant } = location.state || {};

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getIconForCategory = (aggregateName) => {
    const upperName = aggregateName.toUpperCase();
    return [upperName] || NoImage;
  };

  /* ===============================
     FETCH CATEGORIES FROM PARTS-LIST API
     =============================== */
  const fetchCategories = async () => {
    if (!make || !model) {
      setError("Make and Model are required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching categories for:", { make, model });

      const response = await axios.post(
        "http://localhost:5000/api/parts-list",
        {
          brandPriority: null,
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: null,
          customerCode: "0046",
          partNumber: null,
          model: model,
          brand: null,
          subAggregate: null,
          aggregate: null,
          make: make,
          variant: variant || null,
          fuelType: null,
          vehicle: null,
          year: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 90000,
        }
      );

      console.log("Categories API Response:", response);

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

      // Extract unique aggregates (Categories)
      const uniqueAggregates = [
        ...new Set(
          partsData
            .map((item) => item.aggregate)
            .filter((aggregate) => aggregate)
        ),
      ];

      console.log("Unique aggregates (categories):", uniqueAggregates);

      // Format categories
      const formattedCategories = uniqueAggregates.map(
        (aggregate, index) => ({
          id: index + 1,
          name: aggregate
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          aggregateName: aggregate,
          image: getIconForCategory(aggregate),
        })
      );

      setCategories(formattedCategories);

      // Cache data
      const cacheKey = `categories_${make}_${model}`;
      localStorage.setItem(cacheKey, JSON.stringify(formattedCategories));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
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
    <div className="category-new-container">
      {/* Header */}
      <div className="category-new-header">
        <Navigation breadcrumbs={breadcrumbs} />
      </div>

      <div className="category-new-main">
        {/* Categories */}
        <div className="category-new-content">
          {loading ? (
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
          ) : categories.length === 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryNew;
