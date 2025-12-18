import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Search from "../../home/Search";
import NoImage from "../../../assets/No Image.png";
import "../../../styles/search_by/service_type/ServiceTypeSearch.css";
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

const carMakes = [
  { name: "MARUTHI", image: Maruti },
  { name: "HYUNDAI", image: Hyundai },
  { name: "TATA", image: Tata },
  { name: "MAHINDRA", image: Mahindra },
  { name: "ABARTH", image: Abarth },
  { name: "AUDI", image: Audi },
  { name: "FORD", image: Ford },
  { name: "BENTLEY", image: Bently },
  { name: "BMW", image: Bmw },
  { name: "JEEP", image: Jeep },
];

const makeImageMap = {
  MARUTHI: Maruti,
  HYUNDAI: Hyundai,
  TATA: Tata,
  MAHINDRA: Mahindra,
  ABARTH: Abarth,
  AUDI: Audi,
  BENTLEY: Bently,
  BMW: Bmw,
  JEEP: Jeep,
  FORD: Ford,
};

const ServiceTypeSearch = () => {
  const { state } = useLocation();
  const searchKey = state?.serviceType || "";

  const [vehicleNumber, setVehicleNumber] = useState("");
  const navigate = useNavigate();

  const handleMakeClick = (make) => {
    navigate("/service-type-model", {
      state: { make },
    });
  };

  const handleSearch = () => {
    if (!vehicleNumber) {
      alert("Please enter a vehicle number.");
      return;
    }
    console.log("Searching for vehicle number:", vehicleNumber);
  };

  const handleFindAutoParts = () => {
    navigate("/service-type-products", {
      state: {
        serviceType: searchKey,
      },
    });
  };

  return (
    <div className="st-s-service-type-search">
      {/* Banner Search */}
      <Search />
      <div className="vne-search-key-text">
        <span className="srp-search-key-label">Search Key : </span>
        <span className="srp-search-key-value">{searchKey}</span>
      </div>
      {/* Vehicle Number & Filters */}
      <div className="st-s-filter-container">
        <div className="st-s-row-center">
          {/* Vehicle Number Search */}
          <div className="st-s-vehicle-number-search">
            <input
              type="text"
              placeholder="TN - 59 - CS - 3866"
              className="st-s-vehicle-input"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            />
            <button className="st-s-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>

          {/* OR text */}
          <div className="st-s-or-text">(OR)</div>

          {/* Filters */}
          <div className="st-s-filters">
            <select className="st-s-filter-dropdown">
              <option>Select Make</option>
            </select>
            <select className="st-s-filter-dropdown">
              <option>Select Model</option>
            </select>
            <select className="st-s-filter-dropdown">
              <option>Select Variant</option>
            </select>
            <select className="st-s-filter-dropdown">
              <option>Select Fuel Type</option>
            </select>
            <select className="st-s-filter-dropdown">
              <option>Select Year</option>
            </select>
            <button className="st-s-find-btn" onClick={handleFindAutoParts}>
              Find Auto Parts
            </button>
          </div>
        </div>
      </div>

      {/* Search by Make */}
      <div className="st-s-make-grid-container">
        <p className="st-s-make-title">Search by Make (OR)</p>
        <div className="st-s-make-grid">
          {carMakes.map((make, index) => (
            <div
              key={index}
              className="st-s-make-card"
              onClick={() => handleMakeClick(make.name)}
            >
              <img
                src={make.image}
                alt={make.name}
                className="st-s-make-logo"
                loading="lazy"
              />
              <p className="st-s-make-name" title={make.name}>
                {make.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeSearch;
