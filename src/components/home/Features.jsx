import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Speedometer from "../../assets/home/Speedometer.png";
import Brake from "../../assets/home/Brake.png";
import Car1 from "../../assets/home/Group 5776.png";
import Car from "../../assets/home/car.png";
import ElectricCar from "../../assets/home/battery 1.png";
import MyTVS from "../../assets/home/mytvs.png";

import "../../styles/home/Features.css";

const Features = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, label: "Fast Movers", icon: Speedometer, path: "/fast-movers" },
    { id: 2, label: "High Value", icon: Brake, path: "/high-value" },
    { id: 3, label: "CNG", icon: Car1, path: "/cng" },
    { id: 4, label: "Discontinued Model", icon: Car, path: "/discontinue-model" },
    { id: 5, label: "Electric", icon: ElectricCar, path: null },
    { id: 6, label: "Only with us", icon: MyTVS, path: null },
  ];

  const [activeId, setActiveId] = useState(null);

  const handleSelect = (cat) => {
    setActiveId(cat.id);
    if (cat.path) navigate(cat.path);
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
              <img className="sixcat-icon" src={c.icon} alt={c.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
