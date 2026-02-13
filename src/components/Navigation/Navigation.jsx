import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Navigation/Navigation.css";
import { getAssets, getAsset } from "../../utils/assets";

/**
 * Intelligent Navigation Component
 * Automatically generates breadcrumbs based on route patterns and state
 * Supports both auto-generation and manual override
 * Highly configurable and maintainable
 */

// Route configuration for intelligent breadcrumb generation
const ROUTE_CONFIG = {
  // Service Type Routes
  "/search-by-service-type": {
    pattern: "serviceType",
    breadcrumbs: (state) => [
      state?.serviceType && { label: state.serviceType, path: "/search-by-service-type" }
    ].filter(Boolean)
  },
  
  "/service-type-model": {
    pattern: "serviceType > make",
    breadcrumbs: (state) => [
      state?.serviceType && { label: state.serviceType, path: "/search-by-service-type", state: { serviceType: state.serviceType } },
      state?.make && { label: state.make, path: "/service-type-model" }
    ].filter(Boolean)
  },
  
  "/service-type-category": {
    pattern: "serviceType > make > model",
    breadcrumbs: (state) => [
      state?.serviceType && { label: state.serviceType, path: "/search-by-service-type", state: { serviceType: state.serviceType } },
      state?.make && { label: state.make, path: "/service-type-model", state: { serviceType: state.serviceType, make: state.make } },
      state?.model && { label: state.model, path: "/service-type-category" }
    ].filter(Boolean)
  },
  
  "/service-type-sub-category": {
    pattern: "serviceType > make > model > category",
    breadcrumbs: (state) => [
      state?.serviceType && { label: state.serviceType, path: "/search-by-service-type", state: { serviceType: state.serviceType } },
      state?.make && { label: state.make, path: "/service-type-model", state: { serviceType: state.serviceType, make: state.make } },
      state?.model && { label: state.model, path: "/service-type-category", state: { serviceType: state.serviceType, make: state.make, model: state.model } },
      state?.category && { label: state.category, path: "/service-type-sub-category" }
    ].filter(Boolean)
  },
  
  "/service-type-products": {
    pattern: "serviceType > make > model > category > subCategory",
    breadcrumbs: (state) => [
      state?.serviceType && { label: state.serviceType, path: "/search-by-service-type", state: { serviceType: state.serviceType } },
      state?.make && { label: state.make, path: "/service-type-model", state: { serviceType: state.serviceType, make: state.make } },
      state?.model && { label: state.model, path: "/service-type-category", state: { serviceType: state.serviceType, make: state.make, model: state.model } },
      state?.category && { label: state.category, path: "/service-type-sub-category", state: { serviceType: state.serviceType, make: state.make, model: state.model, category: state.category } },
      state?.subCategory && { label: state.subCategory, path: "/service-type-products" }
    ].filter(Boolean)
  },

  // Vehicle Number Routes
  "/vehicle-number-products": {
    pattern: "dynamic",
    breadcrumbs: (state) => {
      const crumbs = [];
      
      // Feature-based flows
      if (state?.featureLabel) {
        // Fast Movers/High Value flow
        if ((state.featureLabel === "Fast Movers" || state.featureLabel === "High Value") && !state.make && !state.model && !state.brand) {
          state.aggregateName && crumbs.push({ 
            label: state.aggregateName, 
            path: "/Category", 
            state: { featureLabel: state.featureLabel, variant: state.variant } 
          });
        }
        // CNG flow
        else if (state.featureLabel === "CNG" && state.make) {
          state.make && crumbs.push({ 
            label: state.make, 
            path: "/MakeNew", 
            state: { featureLabel: state.featureLabel, variant: state.variant } 
          });
          state.model && crumbs.push({ 
            label: state.model, 
            path: "/Model", 
            state: { make: state.make, featureLabel: state.featureLabel, variant: state.variant } 
          });
          state.aggregateName && crumbs.push({ 
            label: state.aggregateName, 
            path: "/CategoryNew", 
            state: { make: state.make, model: state.model, featureLabel: state.featureLabel, variant: state.variant } 
          });
        }
        // Discontinued/Electric flow
        else if ((state.featureLabel === "Discontinued Model" || state.featureLabel === "Electric") && state.model && !state.make) {
          state.model && crumbs.push({ 
            label: state.model, 
            path: "/Model", 
            state: { featureLabel: state.featureLabel, variant: state.variant } 
          });
          state.aggregateName && crumbs.push({ 
            label: state.aggregateName, 
            path: "/CategoryNew", 
            state: { model: state.model, featureLabel: state.featureLabel, variant: state.variant, make: null } 
          });
        }
        // Only with us flow
        else if (state.featureLabel === "Only with us" && state.brand) {
          state.brand && crumbs.push({ 
            label: state.brand, 
            path: "/brand", 
            state: { featureLabel: state.featureLabel, variant: state.variant } 
          });
          state.aggregateName && crumbs.push({ 
            label: state.aggregateName, 
            path: "/CategoryNew", 
            state: { brand: state.brand, featureLabel: state.featureLabel, variant: state.variant, isOnlyWithUs: true } 
          });
        }
      }
      // Direct category flow (from Home)
      else if (state?.aggregateName && !state.make && !state.model && !state.brand) {
        crumbs.push({ 
          label: state.aggregateName, 
          path: "/home", 
          state: { variant: state.variant } 
        });
      }
      // Make flow
      else if (state?.make && state?.model) {
        state.make && crumbs.push({ 
          label: state.make, 
          path: state.fromHome ? "/home" : "/MakeNew", 
          state: { variant: state.variant } 
        });
        state.model && crumbs.push({ 
          label: state.model, 
          path: "/Model", 
          state: { make: state.make, variant: state.variant, fromHome: state.fromHome } 
        });
        state.aggregateName && crumbs.push({ 
          label: state.aggregateName, 
          path: "/CategoryNew", 
          state: { make: state.make, model: state.model, variant: state.variant, fromHome: state.fromHome } 
        });
      }

      // Add SubCategory if exists
      if (state?.subAggregateName || state?.subCategory) {
        crumbs.push({
          label: state.subAggregateName || state.subCategory?.name || state.subCategory,
          path: "/sub_category",
          state: {
            make: state.make || null,
            model: state.model || null,
            brand: state.brand || null,
            category: state.aggregateName || state.category,
            aggregate: state.aggregateName || state.category,
            aggregateName: state.aggregateName || state.category,
            variant: state.variant,
            featureLabel: state.featureLabel,
            isOnlyWithUs: state.brand && state.featureLabel === "Only with us",
            fromHome: state.fromHome,
          },
        });
      }

      return crumbs;
    }
  },

  // Standard Routes
  "/sub_category": {
    pattern: "dynamic",
    breadcrumbs: (state) => {
      const crumbs = [];
      
      // Feature-based flows
      if (state?.featureLabel) {
        if ((state.featureLabel === "Fast Movers" || state.featureLabel === "High Value") && !state.make && !state.model && !state.brand) {
          state.aggregateName && crumbs.push({ 
            label: state.aggregateName, 
            path: "/Category", 
            state: { featureLabel: state.featureLabel, variant: state.variant } 
          });
        } else if (state.featureLabel === "CNG" && state.make) {
          state.make && crumbs.push({ label: state.make, path: "/MakeNew", state: { featureLabel: state.featureLabel, variant: state.variant } });
          state.model && crumbs.push({ label: state.model, path: "/Model", state: { make: state.make, featureLabel: state.featureLabel, variant: state.variant } });
          state.aggregateName && crumbs.push({ label: state.aggregateName, path: "/CategoryNew", state: { make: state.make, model: state.model, featureLabel: state.featureLabel, variant: state.variant } });
        } else if ((state.featureLabel === "Discontinued Model" || state.featureLabel === "Electric") && state.model && !state.make) {
          state.model && crumbs.push({ label: state.model, path: "/Model", state: { featureLabel: state.featureLabel, variant: state.variant } });
          state.aggregateName && crumbs.push({ label: state.aggregateName, path: "/CategoryNew", state: { model: state.model, featureLabel: state.featureLabel, variant: state.variant, make: null } });
        } else if (state.featureLabel === "Only with us" && state.brand) {
          state.brand && crumbs.push({ label: state.brand, path: "/brand", state: { featureLabel: state.featureLabel, variant: state.variant } });
          state.aggregateName && crumbs.push({ label: state.aggregateName, path: "/CategoryNew", state: { brand: state.brand, featureLabel: state.featureLabel, variant: state.variant, isOnlyWithUs: true } });
        }
      }
      // Direct category or Make flows
      else if (state?.aggregateName && !state.make && !state.model && !state.brand) {
        crumbs.push({ label: state.aggregateName, path: "/home", state: { variant: state.variant } });
      } else if (state?.make && state?.model) {
        state.make && crumbs.push({ label: state.make, path: state.fromHome ? "/home" : "/MakeNew", state: { variant: state.variant } });
        state.model && crumbs.push({ label: state.model, path: "/Model", state: { make: state.make, variant: state.variant, fromHome: state.fromHome } });
        state.aggregateName && crumbs.push({ label: state.aggregateName, path: "/CategoryNew", state: { make: state.make, model: state.model, variant: state.variant, fromHome: state.fromHome } });
      }

      return crumbs;
    }
  },

  "/CategoryNew": {
    pattern: "dynamic",
    breadcrumbs: (state) => {
      const crumbs = [];
      
      if (state?.featureLabel) {
        if (state.featureLabel === "CNG" && state.make) {
          state.make && crumbs.push({ label: state.make, path: "/MakeNew", state: { featureLabel: state.featureLabel, variant: state.variant } });
          state.model && crumbs.push({ label: state.model, path: "/Model", state: { make: state.make, featureLabel: state.featureLabel, variant: state.variant } });
        } else if ((state.featureLabel === "Discontinued Model" || state.featureLabel === "Electric") && state.model) {
          crumbs.push({ label: state.model, path: "/Model", state: { featureLabel: state.featureLabel, variant: state.variant } });
        } else if (state.featureLabel === "Only with us" && state.brand) {
          crumbs.push({ label: state.brand, path: "/brand", state: { featureLabel: state.featureLabel, variant: state.variant } });
        }
      } else if (state?.make && state?.model) {
        state.make && crumbs.push({ label: state.make, path: state.fromHome ? "/home" : "/MakeNew", state: { variant: state.variant } });
        state.model && crumbs.push({ label: state.model, path: "/Model", state: { make: state.make, variant: state.variant, fromHome: state.fromHome } });
      }

      return crumbs;
    }
  },

  "/Model": {
    pattern: "make",
    breadcrumbs: (state) => [
      state?.make && { 
        label: state.make, 
        path: state.fromHome ? "/home" : "/MakeNew", 
        state: { featureLabel: state.featureLabel, variant: state.variant } 
      }
    ].filter(Boolean)
  },

  // Static routes
  "/cart": {
    pattern: "static",
    breadcrumbs: () => [{ label: "Cart" }]
  },

  "/brand": {
    pattern: "static", 
    breadcrumbs: () => [{ label: "Brand" }]
  },

  "/my-orders": {
    pattern: "static",
    breadcrumbs: () => [{ label: "My Orders" }]
  }
};

const Navigation = ({ breadcrumbs: manualBreadcrumbs = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assets, setAssets] = useState({});
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  // Generate intelligent breadcrumbs
  const generateIntelligentBreadcrumbs = () => {
    const currentPath = location.pathname;
    const routeConfig = ROUTE_CONFIG[currentPath];
    
    if (!routeConfig) {
      console.warn(`⚠️ No route configuration found for: ${currentPath}`);
      return [];
    }

    try {
      return routeConfig.breadcrumbs(location.state || {});
    } catch (error) {
      console.error(`❌ Error generating breadcrumbs for ${currentPath}:`, error);
      return [];
    }
  };

  // Use manual breadcrumbs if provided, otherwise auto-generate
  const breadcrumbs = manualBreadcrumbs !== null ? manualBreadcrumbs : generateIntelligentBreadcrumbs();

  // Format label with first letter capitalized, rest lowercase
  const formatLabel = (label) => {
    if (!label) return "";
    return label
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle breadcrumb click
  const handleBreadcrumbClick = (crumb) => {
    if (crumb.onClick) {
      crumb.onClick();
    } else if (crumb.path) {
      navigate(crumb.path, { state: crumb.state || {} });
    }
  };

  return (
    <div className="nav-breadcrumbs">
      {/* Home Icon */}
      <img
        src={getAsset('HOME', assets)}
        alt="Home"
        className="nav-home-icon"
        onClick={() => navigate("/home")}
        title="Home"
      />

      {/* Breadcrumb Trail */}
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <img
            src={getAsset('RIGHT ARROW', assets)}
            alt=""
            className="nav-arrow-icon"
          />
          <span
            className={`nav-breadcrumb-item ${(crumb.onClick || crumb.path) ? "clickable" : ""}`}
            onClick={() => handleBreadcrumbClick(crumb)}
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