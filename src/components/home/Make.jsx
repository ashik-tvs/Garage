import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Make.css";

const Make = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
    const handleMakeClick = (make) => {
    navigate('/Model');
  };

  const brands = [
    { id: 1, name: "MARUTI", icon: NoImage },
    { id: 2, name: "HYUNDAI", icon: NoImage },
    { id: 3, name: "TATA", icon: NoImage },
    { id: 4, name: "MAHINDRA", icon: NoImage },
    { id: 5, name: "ABARTH", icon: NoImage },
    { id: 6, name: "ASHOK LEYLAND", icon: NoImage },
    { id: 7, name: "AUDI", icon: NoImage },
    { id: 8, name: "BENTLEY", icon: NoImage },
    { id: 9, name: "DAEWOO", icon: NoImage },
    { id: 10, name: "DATSUN", icon: NoImage },
  ];

  const visibleBrands = expanded ? brands : brands.slice(0, 8);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Make</h3>
        <span
          className="see-more"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      <div className="grid-container">
        {visibleBrands.map((b) => (
          <div key={b.id} className="brand-card" onClick={() => handleMakeClick(b)}>
            <img src={b.icon} alt={b.name} className="brand-img" />
            <p className="brand-label" title={b.name}>{b.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Make;
