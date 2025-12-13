import React, { useState } from "react";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Category.css";

const Category = () => {
  const [expanded, setExpanded] = useState(false);

  const categories = [
    { id: 1, label: "Engine", icon: NoImage },
    { id: 2, label: "Brakes", icon: NoImage },
    { id: 3, label: "Battery", icon: NoImage },
    { id: 4, label: "Steering", icon: NoImage },
    { id: 5, label: "Tyres", icon: NoImage },
    { id: 6, label: "Body Parts", icon: NoImage },
    { id: 7, label: "Accessories", icon: NoImage },
    { id: 8, label: "Electricals", icon: NoImage },
    { id: 9, label: "Filters", icon: NoImage },
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
          <div key={cat.id} className="cat-card">
            <div className="cat-img-box">
              <img src={cat.icon} alt={cat.label} className="cat-img" />
            </div>
            <p className="cat-label">{cat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Category;
