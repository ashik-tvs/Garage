import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/Model.css";
import apiService from "../../../services/apiservice";
import OciImage from "../../oci_image/ociImages";
import noImage from "../../../assets/No Image.png";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";

const Model = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, variant, featureLabel } = location.state || {};

  console.log("Model component - Received state:", {
    make,
    variant,
    featureLabel,
  });
  const getOciModelFileName = (modelName) => {
    if (!modelName) return null;

    // Convert "AUDI A3" → "Audi - A3"
    const parts = modelName.split(" ");
    if (parts.length < 2) return modelName;

    const brand = parts[0].charAt(0) + parts[0].slice(1).toLowerCase();
    const model = parts.slice(1).join(" ");

    return `${brand} - ${model}`;
  };

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    // For discontinued and electric variants, fetch without needing a make
    if (
      variant === "wide" ||
      featureLabel === "Discontinued Model" ||
      variant === "e" ||
      featureLabel === "Electric"
    ) {
      fetchModels();
    } else if (make) {
      fetchModels();
    } else {
      setLoading(false);
      setError("No make selected. Please go back and select a make.");
    }
  }, [make, variant, featureLabel]);

  const fetchModels = async () => {
    // For discontinued model and electric, we don't need a make
    const isDiscontinued =
      variant === "wide" || featureLabel === "Discontinued Model";
    const isElectric = variant === "e" || featureLabel === "Electric";

    if (!make && !isDiscontinued && !isElectric) {
      setError("No make selected. Please go back and select a make.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache first - include variant for proper cache separation
      const cacheKey = isDiscontinued
        ? "models_discontinued"
        : isElectric
        ? "models_electric"
        : variant
        ? `models_${variant}_${make}`
        : `models_${make}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (cachedData && cacheTimestamp) {
        const isCacheValid =
          Date.now() - parseInt(cacheTimestamp) < cacheExpiry;

        if (isCacheValid) {
          const cacheMsg = isDiscontinued
            ? "Loading discontinued models from cache..."
            : isElectric
            ? "Loading electric models from cache..."
            : `Loading models for ${make} from cache...`;
          console.log(cacheMsg);
          try {
            // Cached data is now just model names, need to format with icons
            const cachedModelNames = JSON.parse(cachedData);
            console.log("Cached model names:", cachedModelNames);

            // Check if cached data is an array of strings or objects
            let modelNames = [];
            if (Array.isArray(cachedModelNames)) {
              modelNames = cachedModelNames
                .map((item) => {
                  // If item is an object with a 'name' property, extract it
                  if (typeof item === "object" && item !== null && item.name) {
                    return item.name;
                  }
                  // If item is a string, use it directly
                  if (typeof item === "string") {
                    return item;
                  }
                  return null;
                })
                .filter((name) => name !== null);
            }

            const formattedModels = modelNames.map((modelName, index) => ({
              id: index + 1,
              name: modelName,
            }));

            setModels(formattedModels);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error("Error parsing cached data:", parseError);
            // Clear invalid cache and fetch from API
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_timestamp`);
          }
        }
      }

      // Fetch from API
      let response;
      let vehicleData = [];

      if (isDiscontinued) {
        // Fetch discontinued models from dedicated API
        console.log("Fetching discontinued models from API...");
        response = await apiService.get("/discontinue-model");
        console.log("Discontinued API Response:", response);

        // Extract data from response
        if (response && response.success && Array.isArray(response.data)) {
          vehicleData = response.data;
        } else if (Array.isArray(response)) {
          vehicleData = response;
        } else {
          console.error(
            "Unexpected discontinued response structure:",
            response
          );
          throw new Error("Invalid response format from discontinued API");
        }
      } else if (isElectric) {
        // Fetch electric models from dedicated API
        console.log("Fetching electric models from API...");
        response = await apiService.get("/electric");
        console.log("Electric API Response:", response);

        // Extract data from response
        if (response && response.success && Array.isArray(response.data)) {
          vehicleData = response.data;
        } else if (Array.isArray(response)) {
          vehicleData = response;
        } else {
          console.error("Unexpected electric response structure:", response);
          throw new Error("Invalid response format from electric API");
        }
      } else {
        // Fetch regular models from vehicle-list API
        console.log(`Fetching models for ${make} from API...`);
        console.log("Request payload:", {
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          customerCode: "0046",
          brand: null,
          partNumber: null,
          aggregate: null,
          subAggregate: null,
          make: make,
          model: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        });

        response = await apiService.post("/vehicle-list", {
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          customerCode: "0046",
          brand: null,
          partNumber: null,
          aggregate: null,
          subAggregate: null,
          make: make,
          model: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        });

        console.log("API Response:", response);
        console.log("API Response type:", typeof response);
        console.log("Is Array:", Array.isArray(response));

        // Handle different response structures
        if (Array.isArray(response)) {
          vehicleData = response;
        } else if (
          response &&
          response.success &&
          Array.isArray(response.data)
        ) {
          vehicleData = response.data;
        } else if (response && Array.isArray(response.data)) {
          vehicleData = response.data;
        } else if (response && response.data) {
          console.error("Response has data but not an array:", response.data);
          throw new Error("Invalid response format - data is not an array");
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }
      }

      console.log("Extracted vehicleData:", vehicleData);
      console.log("vehicleData length:", vehicleData.length);
      console.log("First 3 items:", vehicleData.slice(0, 3));

      if (vehicleData.length === 0) {
        const errorMsg = isDiscontinued
          ? "No discontinued models found."
          : isElectric
          ? "No electric models found."
          : `No models found for ${make}. Please try another make.`;
        setError(errorMsg);
        setModels([]);
        setLoading(false);
        return;
      }

      // Extract unique models
      const uniqueModels = [
        ...new Set(
          vehicleData
            .map((item) => {
              console.log("Processing item:", item);
              return item.model;
            })
            .filter((model) => {
              const isValid = model && model.trim() !== "";
              if (!isValid) console.log("Filtered out invalid model:", model);
              return isValid;
            })
        ),
      ];

      console.log("Unique models:", uniqueModels);
      console.log("Unique models count:", uniqueModels.length);

      if (uniqueModels.length === 0) {
        const errorMsg = isDiscontinued
          ? "No discontinued models available."
          : isElectric
          ? "No electric models available."
          : `No models available for ${make}.`;
        setError(errorMsg);
        setModels([]);
        setLoading(false);
        return;
      }

      // Format models
      const formattedModels = uniqueModels.map((modelName, index) => ({
        id: index + 1,
        name: modelName,
      }));

      // Cache the results - only cache model names to save space
      try {
        // Store only the model names array, not the full objects with images
        const modelNamesOnly = uniqueModels;
        localStorage.setItem(cacheKey, JSON.stringify(modelNamesOnly));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        const cacheMsg = isDiscontinued
          ? `Discontinued models cached successfully (${modelNamesOnly.length} models)`
          : isElectric
          ? `Electric models cached successfully (${modelNamesOnly.length} models)`
          : `Models for ${make} cached successfully (${modelNamesOnly.length} models)`;
        console.log(cacheMsg);
      } catch (quotaError) {
        console.warn(
          "Failed to cache models (storage quota exceeded):",
          quotaError
        );
        // Continue without caching - the app will still work
      }

      setModels(formattedModels);
    } catch (err) {
      console.error("Error fetching models:", err);
      console.error("Error details:", err.response || err.message);
      setError("Failed to load models. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (model) => {
    const isDiscontinued =
      variant === "wide" || featureLabel === "Discontinued Model";
    const isElectric = variant === "e" || featureLabel === "Electric";
    navigate("/Category", {
      state: {
        make: isDiscontinued || isElectric ? null : make,
        model: model.name,
        variant,
        featureLabel,
      },
    });
  };

  return (
    <div className="model-container">
      <div className="model-header">
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
          <span className="breadcrumb-separator">&gt;</span>
          {make && (
            <>
              <span 
                className="breadcrumb-link" 
                onClick={() => navigate('/MakeNew', { 
                  state: { variant, featureLabel } 
                })}
              >
                {make}
              </span>
              <span className="breadcrumb-separator">&gt;</span>
            </>
          )}
        </div>
      </div>

      <div className="model-grid-wrapper">
{loading ? (
  <div className="model-row">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="model-card skeleton-card">
        <div className="model-card-content">
          <div className="skeleton skeleton-image"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </div>
    ))}
  </div>
)
: error ? (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            <p>{error}</p>
            <button
              onClick={fetchModels}
              style={{
                marginTop: "10px",
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Retry
            </button>
          </div>
        ) : models.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No models available for {make}</p>
          </div>
        ) : (
          <div className="model-row">
            {models.map((model) => (
              <div
                key={model.id}
                className="model-card"
                onClick={() => handleModelClick(model)}
              >
                <div className="model-card-content">
                  <OciImage
                    partNumber={model.name}
                    make={make} // ✅ PASS MAKE
                    folder="model"
                    fallbackImage={noImage}
                    className="model-image"
                    alt={model.name}
                  />

                  <p className="model-name" title={model.name}>
                    {model.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Model;
