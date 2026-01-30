import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Navigation/Navigation.css";
import apiService from "../../services/apiservice";

/**
 * Reusable Navigation Component
 * Displays breadcrumb navigation with Home icon and dynamic path
 * Automatically builds breadcrumbs based on current route and location state
 * 
 * @param {Array} breadcrumbs - Optional array of breadcrumb items (for manual override)
 * If not provided, breadcrumbs are auto-generated based on route and state
 * Example: [
 *   { label: "TOYOTA", onClick: () => navigate("/make") },
 *   { label: "CAMRY", onClick: () => navigate("/model") },
 *   { label: "WIPER SYSTEM", onClick: () => navigate("/category") },
 *   { label: "WIPER TANK" }
 * ]
 */
const Navigation = ({ breadcrumbs: manualBreadcrumbs = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [uiAssets, setUiAssets] = useState({});

  // Extract state from location
  const {
    make,
    model,
    brand,
    category,
    aggregateName,
    subAggregateName,
    subCategory,
    featureLabel,
    variant,
    isOnlyWithUs,
  } = location.state || {};

  // Auto-generate breadcrumbs based on route and state
  const generateBreadcrumbs = () => {
    const crumbs = [];
    const currentPath = location.pathname;

    // Determine navigation flow
    const hasFeature = featureLabel;
    const hasBrand = brand;
    const hasMake = make;
    const hasModel = model;
    const hasCategory = aggregateName || category;
    const hasSubCategory = subAggregateName || subCategory;

    // VehicleNumberProduct page breadcrumbs
    if (currentPath === "/vehicle-number-products") {
      // Flow 1: Feature-based flows
      if (hasFeature) {
        // Sub-flow 1a: Fast Movers/High Value → Category → SubCategory → Products
        if ((featureLabel === "Fast Movers" || featureLabel === "High Value") && !hasMake && !hasModel && !hasBrand) {
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/Category", { state: { featureLabel, variant } }),
            });
          }
        }
        // Sub-flow 1b: CNG → Make → Model → Category → SubCategory → Products
        else if (featureLabel === "CNG" && hasMake) {
          crumbs.push({
            label: make,
            onClick: () => navigate("/MakeNew", { state: { featureLabel, variant } }),
          });
          if (hasModel) {
            crumbs.push({
              label: model,
              onClick: () => navigate("/Model", { state: { make, featureLabel, variant } }),
            });
          }
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/CategoryNew", { state: { make, model, featureLabel, variant } }),
            });
          }
        }
        // Sub-flow 1c: Discontinued Model/Electric → Model → Category → SubCategory → Products
        else if ((featureLabel === "Discontinued Model" || featureLabel === "Electric") && hasModel && !hasMake) {
          crumbs.push({
            label: model,
            onClick: () => navigate("/Model", { state: { featureLabel, variant } }),
          });
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/CategoryNew", { state: { model, featureLabel, variant, make: null } }),
            });
          }
        }
        // Sub-flow 1d: Only with us → Brand → Category → SubCategory → Products
        else if (featureLabel === "Only with us" && hasBrand) {
          crumbs.push({
            label: brand,
            onClick: () => navigate("/brand", { state: { featureLabel, variant } }),
          });
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/CategoryNew", { state: { brand, featureLabel, variant, isOnlyWithUs: true } }),
            });
          }
        }
      }
      // Flow 2: Direct Category flow (from Home) → Home (Categories) → SubCategory → Products
      else if (hasCategory && !hasMake && !hasModel && !hasBrand) {
        // When clicking category breadcrumb, go back to home where categories are displayed
        crumbs.push({
          label: aggregateName || category,
          onClick: () => navigate("/home", { state: { variant } }),
        });
      }
      // Flow 3: Make flow → Make → Model → Category → SubCategory → Products
      else if (hasMake && hasModel) {
        crumbs.push({
          label: make,
          onClick: () => navigate("/MakeNew", { state: { variant } }),
        });
        crumbs.push({
          label: model,
          onClick: () => navigate("/Model", { state: { make, variant } }),
        });
        if (hasCategory) {
          crumbs.push({
            label: aggregateName || category,
            onClick: () => navigate("/CategoryNew", { state: { make, model, variant } }),
          });
        }
      }

      // Always add SubCategory breadcrumb if it exists
      if (hasSubCategory) {
        crumbs.push({
          label: subAggregateName || subCategory?.name || subCategory,
          onClick: () => navigate("/sub_category", {
            state: {
              make: hasMake ? make : null,
              model: hasModel ? model : null,
              brand: hasBrand ? brand : null,
              category: aggregateName || category,
              aggregate: aggregateName || category,
              aggregateName: aggregateName || category,
              variant,
              featureLabel: hasFeature ? featureLabel : undefined,
              isOnlyWithUs: hasBrand && featureLabel === "Only with us",
            },
          }),
        });
      }
    }
    // SubCategory page breadcrumbs
    else if (currentPath === "/sub_category") {
      // Feature-based flows
      if (hasFeature) {
        if ((featureLabel === "Fast Movers" || featureLabel === "High Value") && !hasMake && !hasModel && !hasBrand) {
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/Category", { state: { featureLabel, variant } }),
            });
          }
        } else if (featureLabel === "CNG" && hasMake) {
          crumbs.push({ label: make, onClick: () => navigate("/MakeNew", { state: { featureLabel, variant } }) });
          if (hasModel) {
            crumbs.push({ label: model, onClick: () => navigate("/Model", { state: { make, featureLabel, variant } }) });
          }
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/CategoryNew", { state: { make, model, featureLabel, variant } }),
            });
          }
        } else if ((featureLabel === "Discontinued Model" || featureLabel === "Electric") && hasModel && !hasMake) {
          crumbs.push({ label: model, onClick: () => navigate("/Model", { state: { featureLabel, variant } }) });
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/CategoryNew", { state: { model, featureLabel, variant, make: null } }),
            });
          }
        } else if (featureLabel === "Only with us" && hasBrand) {
          crumbs.push({ label: brand, onClick: () => navigate("/brand", { state: { featureLabel, variant } }) });
          if (hasCategory) {
            crumbs.push({
              label: aggregateName || category,
              onClick: () => navigate("/CategoryNew", { state: { brand, featureLabel, variant, isOnlyWithUs: true } }),
            });
          }
        }
      }
      // Direct category (from Home) or Make flows
      else if (hasCategory && !hasMake && !hasModel && !hasBrand) {
        // When from Home → Category → SubCategory, clicking category goes back to Home
        crumbs.push({
          label: aggregateName || category,
          onClick: () => navigate("/home", { state: { variant } }),
        });
      } else if (hasMake && hasModel) {
        crumbs.push({ label: make, onClick: () => navigate("/MakeNew", { state: { variant } }) });
        crumbs.push({ label: model, onClick: () => navigate("/Model", { state: { make, variant } }) });
        if (hasCategory) {
          crumbs.push({
            label: aggregateName || category,
            onClick: () => navigate("/CategoryNew", { state: { make, model, variant } }),
          });
        }
      }
    }
    // CategoryNew page breadcrumbs
    else if (currentPath === "/CategoryNew") {
      if (hasFeature) {
        if (featureLabel === "CNG" && hasMake) {
          crumbs.push({ label: make, onClick: () => navigate("/MakeNew", { state: { featureLabel, variant } }) });
          if (hasModel) {
            crumbs.push({ label: model, onClick: () => navigate("/Model", { state: { make, featureLabel, variant } }) });
          }
        } else if ((featureLabel === "Discontinued Model" || featureLabel === "Electric") && hasModel) {
          crumbs.push({ label: model, onClick: () => navigate("/Model", { state: { featureLabel, variant } }) });
        } else if (featureLabel === "Only with us" && hasBrand) {
          crumbs.push({ label: brand, onClick: () => navigate("/brand", { state: { featureLabel, variant } }) });
        }
      } else if (hasMake && hasModel) {
        crumbs.push({ label: make, onClick: () => navigate("/MakeNew", { state: { variant } }) });
        crumbs.push({ label: model, onClick: () => navigate("/Model", { state: { make, variant } }) });
      }
    }
    // Model page breadcrumbs
    else if (currentPath === "/Model") {
      if (hasMake) {
        crumbs.push({ label: make, onClick: () => navigate("/MakeNew", { state: { featureLabel, variant } }) });
      }
    }

    return crumbs;
  };

  // Use manual breadcrumbs if provided, otherwise auto-generate
  const breadcrumbs = manualBreadcrumbs !== null ? manualBreadcrumbs : generateBreadcrumbs();

  // Fetch UI assets with caching
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        // Check cache first
        const cacheKey = "navigation_ui_assets";
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

        if (cachedData && cacheTimestamp) {
          const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;
          
          if (isCacheValid) {
            console.log("📦 Loading navigation assets from cache");
            setUiAssets(JSON.parse(cachedData));
            return;
          }
        }

        // Fetch from API
        console.log("🌐 Fetching navigation assets from API");
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data);
        
        // Cache the assets
        localStorage.setItem(cacheKey, JSON.stringify(assets.data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        console.log("💾 Navigation assets cached successfully");
      } catch (err) {
        console.error("❌ Failed to load UI assets", err);
      }
    };
    fetchUiAssets();
  }, []);

  // Helper to get full URL
  const getAssetUrl = (tagName) => {
    if (!uiAssets[tagName]) return null;
    return apiService.getAssetUrl(uiAssets[tagName]);
  };

  // Format label with first letter capitalized, rest lowercase
  const formatLabel = (label) => {
    if (!label) return "";
    return label
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="nav-breadcrumbs">
      {/* Home Icon */}
      {getAssetUrl("HOME") && (
        <img
          src={getAssetUrl("HOME")}
          alt="Home"
          className="nav-home-icon"
          onClick={() => navigate("/home")}
          title="Home"
        />
      )}

      {/* Breadcrumb Trail */}
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {getAssetUrl("RIGHT ARROW") && (
            <img
              src={getAssetUrl("RIGHT ARROW")}
              alt=""
              className="nav-arrow-icon"
            />
          )}
          <span
            className={`nav-breadcrumb-item ${crumb.onClick ? "clickable" : ""}`}
            onClick={crumb.onClick}
            title={crumb.label}
          >
            {formatLabel(crumb.label)}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Navigation;
