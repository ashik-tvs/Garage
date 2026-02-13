import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../../services/apiservice";
import { masterListAPI } from "../../../services/api";
import OciImage from "../../oci_image/ociImages";
import Navigation from "../../Navigation/Navigation";
import NoImage from "../../../assets/No Image.png";
import "../../../styles/search_by/MyOrder/Category.css";
import "../../../styles/skeleton/skeleton.css";
import "../../../styles/skeleton/skeleton.css";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";

const BASE_PAYLOAD = {
  partNumber: null,
  sortOrder: "ASC",
  customerCode: "0046",
  aggregate: null,
  brand: null,
  fuelType: null,
  limit: 100,
  make: null,
  masterType: "aggregate", // 👈 CATEGORY
  model: null,
  offset: 0,
  primary: false,
  subAggregate: null,
  variant: null,
  year: null,
};

const Category = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { serviceType, make, model } = state || {};

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH CATEGORIES ===================== */
  useEffect(() => {
    if (!make || !model) return;

    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await masterListAPI({
          ...BASE_PAYLOAD,
          make,
          model,
        });

        if (response?.success && Array.isArray(response.data)) {
          const formattedCategories = response.data.map((item, index) => ({
            id: index + 1,
            name: item.masterName,
          }));

          setCategories(formattedCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("❌ Category API Error:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [make, model]);

  /* ===================== NAVIGATION ===================== */
  const handleBack = () => navigate(-1);

  const handleCategoryClick = (category) => {
    navigate("/service-type-sub-category", {
      state: {
        serviceType,
        make,
        model,
        category: category.name,
      },
    });
  };

  /* ===================== JSX (UNCHANGED STRUCTURE) ===================== */
  return (
    <div className="category-container">
<Navigation />

      <div className="category-content">
        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="skeleton-cat-item skeleton-card">
                <div className="skeleton-cat-image">
                  <div className="skeleton"></div>
                </div>
                <div className="skeleton-cat-label">
                  <div className="skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="category-item"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-card">
                <div className="category-image-wrapper">
                  <OciImage
                    partNumber={category.name}
                    folder="aggregate"
                    fallbackImage={NoImage}
                    className="category-image"
                    alt={category.name}
                  />
                </div>
                <div className="category-label">
                  <span>{category.name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Category;
