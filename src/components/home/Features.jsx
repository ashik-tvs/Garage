import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssets, getAsset } from "../../utils/assets";
import "../../styles/home/Features.css";

const Features = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState({});
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  const categories = [
    { id: 1, label: "Fast Movers", assetKey: "FASTMOVERS", path: "/Category", variant: "fm" },
    { id: 2, label: "High Value", assetKey: "HIGHVALUE", path: "/Category", variant: "hv" },
    { id: 3, label: "CNG", assetKey: "CNG", path: "/MakeNew", variant: "cng" },
    { id: 4, label: "Discontinued Model", assetKey: "DISCONTINUE", path: "/Model", variant: "wide" },
    { id: 5, label: "Electric", assetKey: "ELECTRIC", path: "/Model", variant: "e" },
    { id: 6, label: "Only with us", assetKey: "ONLY WITH US", path: "/brand", variant: "logo" },
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
                src={getAsset(c.assetKey, assets)}
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
