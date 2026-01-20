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
  const {
    make,
    model,
    brand,
    category,
    aggregateName,
    aggregate,
    featureLabel,
    variant,
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
      const cacheKey = `subCategory_${selectedAggregate}`;
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

      console.log("Fetching sub-categories for:", selectedAggregate);

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
          model: null,
          brand: null,
          subAggregate: null,
          aggregate: selectedAggregate, // Filter by selected category (e.g., "BATTERY", "STEERING")
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
          timeout: 90000,
        },
      );

      console.log("Sub-categories API Response:", response);

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

      // Extract unique sub-aggregates (Sub-Categories)
      const uniqueSubAggregates = [
        ...new Set(
          partsData
            .map((item) => item.subAggregate)
            .filter((subAggregate) => subAggregate),
        ),
      ];

      console.log("Unique sub-aggregates:", uniqueSubAggregates);

      // Format sub-categories
      const formattedSubCategories = uniqueSubAggregates.map(
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

      console.log("Formatted sub-categories:", formattedSubCategories);

      // Cache the sub-categories
      const cacheKey = `subCategory_${selectedAggregate}`;
      localStorage.setItem(cacheKey, JSON.stringify(formattedSubCategories));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      console.log(
        `Sub-categories for ${selectedAggregate} cached successfully`,
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

  return (
    <div className="sub-category-container">
      {/* Header */}
      <div className="sub-category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={getAssetUrl(uiAssets["LEFT ARROW"])} alt="Back" />
        </button>
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate("/home")}>
            Home
          </span>
          {make && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span
                className="breadcrumb-link"
                onClick={() =>
                  navigate("/MakeNew", {
                    state: { variant, featureLabel },
                  })
                }
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
                onClick={() =>
                  navigate("/Model", {
                    state: { make, variant, featureLabel },
                  })
                }
              >
                {model}
              </span>
            </>
          )}
          {(selectedAggregate || category) && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span
                className="breadcrumb-link"
                onClick={() =>
                  navigate("/Category", {
                    state: { make, model, variant, featureLabel },
                  })
                }
              >
                {selectedAggregate || category}
              </span>
              <span className="breadcrumb-separator">&gt;</span>
            </>
          )}
        </div>
      </div>

      <div className="sub-category-main">
        {/* Sub Categories */}
        <div className="sub-category-content">
          {loading ? (
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
          ) : subCategories.length === 0 ? (
            <div className="sub-category-empty">
              <p style={{ textAlign: "center", padding: "20px" }}>
                No subcategories found for {selectedAggregate || category}.
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
