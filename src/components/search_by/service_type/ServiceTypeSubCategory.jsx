import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../../services/apiservice";
import { masterListAPI } from "../../../services/api";
import OciImage from "../../oci_image/ociImages";
import NoImage from "../../../assets/No Image.png";
import Navigation from "../../Navigation/Navigation";
import "../../../styles/home/SubCategory.css";
import "../../../styles/skeleton/skeleton.css";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import ServiceTypeIcon from "../../../assets/vehicle_search_entry/servicetype.png";

const BASE_PAYLOAD = {
  partNumber: null,
  sortOrder: "ASC",
  customerCode: "0046",
  aggregate: null,
  brand: null,
  fuelType: null,
  limit: 100,
  make: null,
  masterType: "subAggregate", // 👈 SUB-CATEGORY
  model: null,
  offset: 0,
  primary: false,
  subAggregate: null,
  variant: null,
  year: null,
};

const Sub_Category = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { serviceType, make, model, category } = state || {};

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH SUB-CATEGORIES ===================== */
  useEffect(() => {
    if (!make || !model || !category) return;

    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const response = await masterListAPI({
          ...BASE_PAYLOAD,
          make,
          model,
          aggregate: category, // filter by parent category
        });

        if (response?.success && Array.isArray(response.data)) {
          const formattedSubCategories = response.data.map((item, index) => ({
            id: index + 1,
            name: item.masterName,
          }));
          setSubCategories(formattedSubCategories);
        } else {
          setSubCategories([]);
        }
      } catch (err) {
        console.error("❌ Sub-Category API Error:", err);
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [make, model, category]);

  /* ===================== NAVIGATION ===================== */

  const handleSubCategoryClick = (subCategory) => {
    navigate("/service-type-products", {
      state: {
        serviceType,
        make,
        model,
        category,
        subCategory: subCategory.name,
      },
    });
  };

  const handleServiceTypeClick = (serviceType) => {
    navigate("/search-by-service-type", { state: { serviceType } });
  };

  /* ===================== JSX (UNCHANGED STRUCTURE) ===================== */
  return (
    <div className="sub-category-container">
      {/* Header */}
      <Navigation />

      <div className="sub-category-main">
        {/* Sub Categories Content */}
        <div className="sub-category-content">
          <div className="sub-category-row">
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton-sub-item skeleton-card">
                    <div className="skeleton-sub-image-wrapper">
                      <div className="skeleton skeleton-sub-image"></div>
                    </div>
                    <div className="skeleton-sub-label">
                      <div className="skeleton"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  className="sub-category-item"
                  onClick={() => handleSubCategoryClick(subCategory)}
                >
                  <div className="sub-category-image-wrapper">
                    <OciImage
                      partNumber={subCategory.name}
                      folder="subAggregate"
                      fallbackImage={NoImage}
                      className="sub-category-image"
                      alt={subCategory.name}
                    />
                  </div>
                  <div className="sub-category-label">
                    <span>{subCategory.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SERVICE TYPE SIDEBAR (COMMENTED OUT - NOT NEEDED) */}
        {/* <div className="service-type-sidebar">
          <div className="service-type-header">
            <span>Service Type for {category}</span>
            <div className="service-type-icon">
              <img src={ServiceTypeIcon} alt="Service Type" />
            </div>
          </div>
          <div className="service-type-list">
            {[
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
            ].map((service, index) => (
              <div
                key={index}
                className="service-type-item"
                onClick={() => handleServiceTypeClick(service)}
              >
                {service}
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Sub_Category;
