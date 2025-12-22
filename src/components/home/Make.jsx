import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OciImage from "../oci_image/ociImages.jsx";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Make.css";
import Maruti from "../../assets/Make/MARUTI SUZUKI.png";
import Tata from "../../assets/Make/TATA.png";
import Hyundai from "../../assets/Make/HYUNDAI.png";
import Mahindra from "../../assets/Make/MAHINDRA.png";
import Abarth from "../../assets/Make/ABARTH.png";
import Audi from "../../assets/Make/AUDI.png";
import Ford from "../../assets/Make/FORD.png";
import Bently from "../../assets/Make/BENTLEY.png";
import Bmw from "../../assets/Make/BMW.png";
import Jeep from "../../assets/Make/JEEP.png";

const Make = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const handleMakeClick = (make) => {
    navigate("/Model");
  };

  const brands = [
    { id: 7, name: "AUDI", icon: Audi },
    { id: 1, name: "Maruti Suzuki", icon: Maruti },
    { id: 2, name: "HYUNDAI", icon: Hyundai },
    { id: 3, name: "TATA", icon: Tata },
    { id: 4, name: "MAHINDRA", icon: Mahindra },
    { id: 5, name: "ABARTH", icon: Abarth },
    { id: 9, name: "BMW", icon: Bmw },
    { id: 6, name: "Ford", icon: Ford },
    { id: 8, name: "BENTLEY", icon: Bently },
    { id: 10, name: "Jeep", icon: Jeep },
  ];

  const visibleBrands = expanded ? brands : brands.slice(0, 8);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Make</h3>
        <span className="see-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      <div className="grid-container">
        {visibleBrands.map((b) => (
          <div
            key={b.id}
            className="brand-card"
            onClick={() => handleMakeClick(b)}
          >
            <img src={b.icon} alt={b.name} className="brand-img" />
            <p className="brand-label" title={b.name}>
              {b.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Make;
