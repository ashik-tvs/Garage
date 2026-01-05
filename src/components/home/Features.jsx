import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiservice";
import "../../styles/home/Features.css";

const Features = () => {
  const navigate = useNavigate();
  const [uiAssets, setUiAssets] = useState({});

  // Fetch UI assets for categories
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data); // backend returns {success: true, data: {...}}
      } catch (err) {
        console.error("❌ Failed to load category assets", err);
      }
    };

    fetchUiAssets();
  }, []);

  const categories = [
    { id: 1, label: "Fast Movers", tag: "FASTMOVERS", path: "/Category", variant: "fm" },
    { id: 2, label: "High Value", tag: "HIGHVALUE", path: "/Category", variant: "hv" },
    { id: 3, label: "CNG", tag: "CNG", path: "/MakeNew", variant: "cng" },
    { id: 4, label: "Discontinued Model", tag: "DISCONTINUE", path: "/Model", variant: "wide" },
    { id: 5, label: "Electric", tag: "ELECTRIC", path: "/Model", variant: "e" },
    { id: 6, label: "Only with us", tag: "ONLY WITH US", path: "/brand", variant: "logo" },
  ];

  const [activeId, setActiveId] = useState(null);

  const handleSelect = (cat) => {
    setActiveId(cat.id);
    if (cat.path) {
      navigate(cat.path, {
        state: { variant: cat.variant, featureLabel: cat.label }
      });
    }
  };

  const handleKey = (e, cat) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(cat);
    }
  };

  // Helper to build full asset URL
  const getAssetUrl = (filePath) => {
    if (!filePath) return "";
    return apiService.getAssetUrl(filePath);
  };

  return (
    <section className="sixcat" aria-label="Explore categories">
      <div className="sixcat-inner">
        <div className="sixcat-row">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`sixcat-item ${activeId === c.id ? "sixcat-item--active" : ""}`}
              onClick={() => handleSelect(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKey(e, c)}
            >
              <span className="sixcat-label">{c.label}</span>
              <img
                className={`sixcat-icon sixcat-icon--${c.variant}`}
                src={getAssetUrl(uiAssets[c.tag])}
                alt={c.label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
