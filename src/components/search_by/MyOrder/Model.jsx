import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/Model.css";
import apiService from "../../../services/apiservice";
import OciImage from "../../oci_image/ociImages";
import noImage from "../../../assets/No Image.png";
import Navigation from "../../Navigation/Navigation";

const Model = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, variant, featureLabel } = location.state || {};

  console.log("Model component - Received state:", {
    make,
    variant,
    featureLabel,
  });

  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState("");

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
    if (!uiAssets[tagName]) return null;
    return apiService.getAssetUrl(uiAssets[tagName]);
  };

  const fetchModels = useCallback(async () => {
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
        // Fetch regular models using masterType API with batch loading
        console.log(`Fetching models for ${make} from API using masterType...`);
        
        const BATCH_SIZE = 500;
        const MAX_BATCHES = 50;
        const uniqueModels = new Set();
        let consecutiveErrors = 0;
        const MAX_CONSECUTIVE_ERRORS = 3;

        for (let batch = 0; batch < MAX_BATCHES; batch++) {
          const offset = batch * BATCH_SIZE;
          
          console.log(`📦 Fetching batch ${batch + 1} (offset: ${offset}, limit: ${BATCH_SIZE})`);

          try {
            response = await apiService.post(
              "/matertype",
              {
                partNumber: null,
                sortOrder: "ASC",
                customerCode: "0046",
                aggregate: null,
                brand: null,
                fuelType: null,
                limit: BATCH_SIZE,
                make: make,
                masterType: "model",
                model: null,
                offset: offset,
                primary: false,
                subAggregate: null,
                variant: null,
                year: null,
              }
            );

            console.log(`✅ Batch ${batch + 1} response:`, response);

            // Extract master data from response
            const masterData = response?.data;
            
            if (!masterData || !Array.isArray(masterData) || masterData.length === 0) {
              console.log(`⚠️ Batch ${batch + 1} returned no data. Stopping pagination.`);
              break;
            }

            // Extract masterName from each item
            masterData.forEach((item) => {
              if (item.masterName && item.masterName.trim() !== "") {
                uniqueModels.add(item.masterName.trim());
              }
            });

            console.log(`📊 Batch ${batch + 1} added ${masterData.length} items. Total unique models: ${uniqueModels.size}`);

            // Reset error counter on success
            consecutiveErrors = 0;

            // If we got less than BATCH_SIZE items, we've reached the end
            if (masterData.length < BATCH_SIZE) {
              console.log(`✅ Received partial batch (${masterData.length} items). End of data reached.`);
              break;
            }

          } catch (batchError) {
            consecutiveErrors++;
            console.error(`❌ Error fetching batch ${batch + 1}:`, {
              message: batchError.message,
              response: batchError.response?.data,
              status: batchError.response?.status
            });

            // If this is the first batch and it fails, throw error
            if (batch === 0) {
              throw new Error(`Failed to fetch models on first batch: ${batchError.message}`);
            }

            // If we've had too many consecutive errors, stop trying
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
              console.log(`⚠️ Stopping after ${MAX_CONSECUTIVE_ERRORS} consecutive errors. Using ${uniqueModels.size} models collected so far.`);
              break;
            }

            // For subsequent batches, log warning but continue with what we have
            console.log(`⚠️ Batch ${batch + 1} failed but continuing with ${uniqueModels.size} models collected so far`);
            break;
          }
        }

        // Check if we have any models
        if (uniqueModels.size === 0) {
          console.log(`⚠️ No models found for ${make}`);
          setError(`No models available for ${make}. Please try another make.`);
          setModels([]);
          setLoading(false);
          return;
        }

        // Convert Set to sorted array for vehicleData
        vehicleData = Array.from(uniqueModels).sort().map(modelName => ({
          model: modelName
        }));

        console.log(`✅ Total unique models fetched: ${uniqueModels.size}`);
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
  }, [make, variant, featureLabel]);

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
  }, [make, variant, featureLabel, fetchModels]);

  const handleModelClick = (model) => {
    const isDiscontinued =
      variant === "wide" || featureLabel === "Discontinued Model";
    const isElectric = variant === "e" || featureLabel === "Electric";
    
    console.log("🚙 Model clicked:", model.name);
    // Normalize model name to uppercase for API consistency
    const normalizedModel = model.name.toUpperCase();
    console.log("🚙 Normalized model:", normalizedModel);
    
    navigate("/CategoryNew", {
      state: {
        make: isDiscontinued || isElectric ? null : make,
        model: normalizedModel,
        variant,
        featureLabel,
      },
    });
  };

  const handleNameClick = (e, modelName) => {
    e.stopPropagation(); // Prevent card click
    setSelectedModelName(modelName);
    setShowNameModal(true);
  };

  const closeModal = () => {
    setShowNameModal(false);
    setSelectedModelName("");
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

  return (
    <div className="model-container">
      <div className="model-header">
        <Navigation breadcrumbs={breadcrumbs} />
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

                  <p 
                    className="model-name" 
                    title={model.name}
                    onClick={(e) => handleNameClick(e, model.name)}
                  >
                    {model.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for showing full model name */}
      {showNameModal && (
        <div className="model-name-modal-overlay" onClick={closeModal}>
          <div className="model-name-modal" onClick={(e) => e.stopPropagation()}>
            <div className="model-name-modal-header">
              <h3>Model Name</h3>
              <button className="model-name-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="model-name-modal-content">
              <p>{selectedModelName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Model;
