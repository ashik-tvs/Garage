import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/search_by/MyOrder/MakeNew.css";
import noImage from "../../../assets/No Image.png";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import Maruti from "../../../assets/Make/MARUTI SUZUKI.png";
import Tata from "../../../assets/Make/TATA.png";
import Hyundai from "../../../assets/Make/HYUNDAI.png";
import Mahindra from "../../../assets/Make/MAHINDRA.png";
import Abarth from "../../../assets/Make/ABARTH.png";
import Audi from "../../../assets/Make/AUDI.png";
import Ford from "../../../assets/Make/FORD.png";
import Bently from "../../../assets/Make/BENTLEY.png";
import Bmw from "../../../assets/Make/BMW.png";
import Jeep from "../../../assets/Make/JEEP.png";

const MakeNew = () => {
  const navigate = useNavigate();
  const makes = [
    { id: 1, name: "MARUTHI", image: Maruti },
    { id: 2, name: "HYUNDAI", image: Hyundai },
    { id: 3, name: "TATA", image: Tata },
    { id: 4, name: "MAHINDRA", image: Mahindra },
    { id: 5, name: "ABARTH", image: Abarth },
    { id: 6, name: "AUDI", image: Audi },
    { id: 7, name: "FORD", image: Ford },
    { id: 8, name: "BENTLEY", image: Bently },
    { id: 9, name: "BMW", image: Bmw },
    { id: 10, name: "JEEP", image: Jeep },
  ];

  const handleMakeClick = (make) => {
    navigate("/Model", { state: { make: make.name } });
  };

  return (
    <div className="make-container">
      <div className="make-header">
        <button className="make-back-button" onClick={() => navigate(-1)}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="make-title">Make</h1>
      </div>

      <div className="make-grid-wrapper">
        <div className="make-row">
          <div className="make-row-inner">
            {makes.map((make) => (
              <div
                key={make.id}
                className="make-card"
                onClick={() => handleMakeClick(make)}
              >
                <div className="make-img-wrapper">
                  <img
                    src={make.image}
                    alt={make.name}
                    className="make-img"
                    loading="lazy"
                  />
                </div>
                <div className="make-text">
                  <p className="make-name" title={make.name}>
                    {make.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeNew;
