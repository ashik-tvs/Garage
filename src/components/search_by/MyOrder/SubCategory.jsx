import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiService from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import OciImage from "../../oci_image/ociImages";
import "../../../styles/home/SubCategory.css";


const Sub_Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, model, brand, category, aggregateName } = location.state || {};

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
  if (!aggregateName) {
    console.error("aggregateName missing — API will not call");
    return;
  }

  fetchSubCategories(true); // force fetch
}, [aggregateName]);


const fetchSubCategories = async (force = false) => {
  try {
    setLoading(true);
    setError(null);

    const cacheKey = `subCategory_${aggregateName}`;
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const cacheExpiry = 24 * 60 * 60 * 1000;

    if (!force) {
      const cachedData = localStorage.getItem(cacheKey);

      if (
        cachedData &&
        cacheTimestamp &&
        Date.now() - parseInt(cacheTimestamp) < cacheExpiry
      ) {
        setSubCategories(JSON.parse(cachedData));
        setLoading(false);
        return; // ⛔ API skipped intentionally
      }
    }

    // ✅ API CALL WILL ALWAYS HAPPEN HERE
    const response = await axios.post(
      "http://localhost:5000/api/parts-list",
      { aggregate: aggregateName },
      { timeout: 90000 }
    );

    const partsData = response.data?.data || [];
    const uniqueSubAggregates = [
      ...new Set(partsData.map(i => i.subAggregate).filter(Boolean))
    ];

    const formatted = uniqueSubAggregates.map((sub, i) => ({
      id: i + 1,
      name: sub,
      subAggregateName: sub,
      image: NoImage
    }));

    localStorage.setItem(cacheKey, JSON.stringify(formatted));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

    setSubCategories(formatted);
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
    // "Complete Brake System Inspection",
    // "Brake Noise / Vibration Diagnosis",
    // "Brake Fluid Level Check",
    // "ABS Warning Light Check",
    // "Front Brake Pad Replacement",
    // "Rear Brake Pad Replacement",
    // "Brake Shoe Replacement (Drum Brakes)",
    // "Brake Pad Cleaning & Adjustment",
    // "Brake Rotor (Disc) Replacement",
    // "Brake Rotor Resurfacing",
    // "Brake Drum Replacement",
    // "Brake Drum Turning / Resurfacing",
    // "Brake Caliper Repair / Replacement",
    // "Brake Line / Hose Replacement",
    // "Brake Bleeding (Air Removal)",
    // "Brake Oil Change (Brake Fluid Flush)",
    // "Handbrake Cable Adjustment",
  ];

  const handleBack = () => navigate(-1);

  const handleSubCategoryClick = (subCategory) => {
    navigate("/vehicle-number-products", {
      state: {
        make,
        model,
        brand,
        category,
        aggregateName, // Pass the aggregate name from Category
        subCategory: subCategory.name,
        subAggregateName: subCategory.subAggregateName,
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

  return (
    <div className="sub-category-container">
      {/* Header */}
      <div className="sub-category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={getAssetUrl(uiAssets["LEFT ARROW"])} alt="Back" />
        </button>
        <h1 className="sub-category-title">Search by Sub Category</h1>
      </div>

      <div className="sub-category-main">
        {/* Sub Categories */}
        <div className="sub-category-content">
          {loading ? (
            <div className="sub-category-loading">
              <p style={{ textAlign: "center", padding: "20px" }}>
                Loading subcategories...
              </p>
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
          ) : subCategories.length === 0 ? (
            <div className="sub-category-empty">
              <p style={{ textAlign: "center", padding: "20px" }}>
                No subcategories found for {category}.
              </p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Service Type Sidebar */}
        <div className="service-type-sidebar">
          <div className="service-type-header">
            <span>Service Type for {category || "Category"}</span>
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
