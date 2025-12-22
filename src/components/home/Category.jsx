import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Category.css";
import Accessories from "../../assets/Categories/ACCESSORIES.png"
import Battery from "../../assets/Categories/BATTERY.png"
import Bearing from "../../assets/Categories/BEARING.png"
import Belts from "../../assets/Categories/BELTS AND TENSIONER.png"
import BodyParts from "../../assets/Categories/BODY PARTS.png"
import BrakeSystem from "../../assets/Categories/BRAKE SYSTEM.png"
import Cables from "../../assets/Categories/CABLES AND WIRES.png"
import ChildParts from "../../assets/Categories/CHILD PARTS.png"
import Filters from "../../assets/Categories/FILTERS.png"


const Category = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  
  const handleCategoryClick = (category) => {
    console.log('Selected category:', category);
    // Navigate to Sub Category page
    navigate('/sub_category');
  };

  const categories = [
    { id: 1, label: "Accessories", icon: Accessories },
    { id: 2, label: "Bearing", icon: Bearing },
    { id: 3, label: "Battery", icon: Battery },
    { id: 4, label: "Bealts & Tensioner", icon: Belts },
    { id: 5, label: "Brake System", icon: BrakeSystem },
    { id: 6, label: "Body Parts", icon: BodyParts },
    { id: 7, label: "Cables", icon: Cables },
    { id: 8, label: "ChildParts", icon: ChildParts },
    { id: 9, label: "Filters", icon: Filters },
  ];

  const visibleCategories = expanded ? categories : categories.slice(0, 8);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Category</h3>
        <span className="see-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      <div className="grid-container">
        {visibleCategories.map((cat) => (
          <div key={cat.id} className="cat-card" onClick={() => handleCategoryClick(cat)}>
            <div className="cat-img-box">
              <img src={cat.icon} alt={cat.label} className="cat-img" />
            </div>
            <p className="cat-label" title={cat.label}>{cat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Category;
