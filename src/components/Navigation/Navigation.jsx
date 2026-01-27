import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Navigation/Navigation.css";
import apiService from "../../services/apiservice";

/**
 * Reusable Navigation Component
 * Displays breadcrumb navigation with Home icon and dynamic path
 * 
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * Example: [
 *   { label: "TOYOTA", onClick: () => navigate("/make") },
 *   { label: "CAMRY", onClick: () => navigate("/model") },
 *   { label: "WIPER SYSTEM", onClick: () => navigate("/category") },
 *   { label: "WIPER TANK" }
 * ]
 */
const Navigation = ({ breadcrumbs = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [uiAssets, setUiAssets] = useState({});

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
