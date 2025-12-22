import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/Category.css";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";

// Category Images
import BrakeSystem from "../../../assets/Categories/BRAKE SYSTEM.png";
import Accessories from "../../../assets/Categories/ACCESSORIES.png";
import Battery from "../../../assets/Categories/BATTERY.png";
import Bearing from "../../../assets/Categories/BEARING.png";
import Belts from "../../../assets/Categories/BELTS AND TENSIONER.png";
import BodyParts from "../../../assets/Categories/BODY PARTS.png";
import Cables from "../../../assets/Categories/CABLES AND WIRES.png";
import ChildParts from "../../../assets/Categories/CHILD PARTS.png";
import Clutch from "../../../assets/Categories/CLUTCH SYSTEMS.png";
import Comfort from "../../../assets/Categories/GLASS.png";
import Electricals from "../../../assets/Categories/ELECTRICALS AND ELECTRONICS.png";
import Engine from "../../../assets/Categories/ENGINE.png";
import Filters from "../../../assets/Categories/FILTERS.png";
import Fluids from "../../../assets/Categories/FLUIDS COOLANT AND GREASE.png";
import Horns from "../../../assets/Categories/HORNS.png";
import Lubes from "../../../assets/Categories/LUBES.png";
import Lights from "../../../assets/Categories/LIGHTING.png";

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, model, brand } = location.state || {};

  const categories = [
    { id: 1, name: "Engine", image: Engine },
    { id: 2, name: "Brake System", image: BrakeSystem },
    { id: 3, name: "Battery", image: Battery },
    { id: 4, name: "Body Parts", image: BodyParts },
    { id: 5, name: "Accessories", image: Accessories },
    { id: 6, name: "Electricals & Electronics", image: Electricals },
    { id: 7, name: "Filters", image: Filters },
    { id: 8, name: "Cables & Wires", image: Cables },
    { id: 9, name: "Bearing", image: Bearing },
    { id: 10, name: "Horns", image: Horns },
    { id: 11, name: "Lubes", image: Lubes },
    { id: 12, name: "Fluids, Coolant & Grease", image: Fluids },
    { id: 13, name: "Glass / Comfort", image: Comfort },
    { id: 14, name: "Clutch Systems", image: Clutch },
    { id: 15, name: "Belts & Tensioner", image: Belts },
    { id: 16, name: "Lighting", image: Lights },
    { id: 17, name: "Child Parts", image: ChildParts },
  ];

  const handleBack = () => navigate(-1);

  const handleCategoryClick = (category) => {
    navigate("/sub_category", {
      state: {
        make,
        model,
        brand,
        category: category.name,
      },
    });
  };

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="category-title">Search by Category</h1>
      </div>

      {/* Category Grid */}
      <div className="category-content">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-item"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="category-card">
              <div className="category-image-wrapper">
                <img
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                />
              </div>
              <div className="category-label">
                <span title={category.name}>{category.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
