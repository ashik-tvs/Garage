import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiService from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import OciImage from "../../oci_image/ociImages";
import "../../../styles/home/SubCategory.css";

// Sub Category Images (fallback)
import BrakePad from "../../../assets/brakePad.png";
import BrakeDisc from "../../../assets/Brake Disk.png";
import Caliper from "../../../assets/caliperPins.png";
import BrakeShoe from "../../../assets/brakeShoe.png";
import BrakeLining from "../../../assets/BrakeLining.png";
import MC from "../../../assets/McBooster.png";
import Anti from "../../../assets/AntiLocking.png";
import BrakeHose from "../../../assets/brakeHose.png";
import BrakeDrum from "../../../assets/brakeDrum.png";
import BrakeCable from "../../../assets/Sub Category/BRAKE CABLE.png";
import Cylinder from "../../../assets/Cylinder.png";

const Sub_Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, model, brand, category, aggregateName } = location.state || {};

  const [uiAssets, setUiAssets] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for fallback images
  const iconMap = {
    "BRAKE PAD": BrakePad,
    "BRAKE DISC": BrakeDisc,
    "BRAKE DISK": BrakeDisc,
    "CALIPER PINS": Caliper,
    CALIPER: Caliper,
    "BRAKE SHOE": BrakeShoe,
    "BRAKE LINING": BrakeLining,
    "MC / BOOSTER": MC,
    "MC BOOSTER": MC,
    CYLINDER: Cylinder,
    "ANTI LOCKING (ABS)": Anti,
    ABS: Anti,
    "BRAKE HOSE": BrakeHose,
    "BRAKE DRUM": BrakeDrum,
    "BRAKE CABLE": BrakeCable,
  };

  const getIconForSubCategory = (subAggregateName) => {
    const upperName = subAggregateName.toUpperCase();
    return iconMap[upperName] || NoImage;
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
    if (aggregateName) {
      // Check cache first
      const cacheKey = `subCategory_${aggregateName}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (cachedData && cacheTimestamp) {
        const isCacheValid =
          Date.now() - parseInt(cacheTimestamp) < cacheExpiry;

        if (isCacheValid) {
          console.log(
            `Loading sub-categories for ${aggregateName} from cache...`
          );
          setSubCategories(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      fetchSubCategories();
    }
  }, [aggregateName]);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching sub-categories for:", aggregateName);

      const response = await axios.post(
        "http://localhost:5000/api/parts-list",
        {
          brandPriority: ["VALEO"],
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: null,
          customerCode: "0046",
          partNumber: null,
          model: null,
          brand: null,
          subAggregate: null,
          aggregate: aggregateName, // Filter by selected category
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
        }
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
            .filter((subAggregate) => subAggregate)
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
        })
      );

      console.log("Formatted sub-categories:", formattedSubCategories);

      // Cache the sub-categories
      const cacheKey = `subCategory_${aggregateName}`;
      localStorage.setItem(cacheKey, JSON.stringify(formattedSubCategories));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      console.log(`Sub-categories for ${aggregateName} cached successfully`);

      setSubCategories(formattedSubCategories);
    } catch (err) {
      console.error("Error fetching sub-categories:", err);

      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError("Request timeout. Please try again later.");
      } else {
        setError(
          `Failed to load sub-categories: ${err.message || "Please try again."}`
        );
      }
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
                onClick={fetchSubCategories}
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
