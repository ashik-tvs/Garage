import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../../home/Search";
import NoImage from "../../../assets/No Image.png";
import "../../../styles/search_by/service_type/ServiceTypeSearch.css";

const carMakes = [
  "MARUTHI", "HYUNDAI", "TATA", "MAHINDRA", "ABARTH", "ASHOK LEYLAND",
  "AUDI", "BENTLEY", "DAEWOO", "DATSUN", "FERRARI", "ICML", "ISUZU",
  "HINDUSTUN", "SONALIKA", "MASERATI", "JAGUAR", "MERCEDES BENZ",
  "ROLLS ROYALS", "TVS", "SCANIA", "LEXUS", "SSANGYONG", "MITSUBISHI",
  "BYD", "VOLVO", "KIA", "JEEP", "PEUGEOT"
];

const ServiceTypeSearch = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!vehicleNumber) {
      alert("Please enter a vehicle number.");
      return;
    }
    console.log("Searching for vehicle number:", vehicleNumber);
  };

  const handleFindAutoParts = () => {
    navigate("/service-type-products");
  };

  return (
    <div className="st-s-service-type-search">
      {/* Banner Search */}
      <Search />

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
            <button
              className="st-s-find-btn"
              onClick={handleFindAutoParts}
            >
              Find Auto Parts
            </button>
          </div>
        </div>
      </div>

      {/* Search by Make */}
      <div className="st-s-make-grid-container">
        <p className="st-s-make-title">Search by Make (OR)</p>
        <div className="st-s-make-grid">
          {carMakes.map((name, index) => (
            <div key={index} className="st-s-make-card">
              <img src={NoImage} alt={name} className="st-s-make-logo" />
              <p className="st-s-make-name">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeSearch;
