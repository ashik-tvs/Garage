// src/components/search_by/vehicle_number_entry/VehicleNumberEntry.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Search from "../../home/Search";

import EditIcon from "../../../assets/vehicle_search_entry/edit.png";
import ServiceTypeIcon from "../../../assets/vehicle_search_entry/servicetype.png";
import NoImage from "../../../assets/No Image.png";

import "../../../styles/search_by/vehicle_number_entry/VehicleNumber.css";

// -------------------- MOCK DATA --------------------
const MOCK_VEHICLE = {
  make: "Hyundai",
  model: "Grand",
  variant: "i10",
  fuel: "Petrol",
  year: "2021",
};

const MAIN_CATEGORIES = [
  { name: "Engine", icon: NoImage },
  { name: "Brakes", icon: NoImage },
  { name: "Battery", icon: NoImage },
  { name: "Steering", icon: NoImage },
  { name: "Body Parts", icon: NoImage },
  { name: "Filters", icon: NoImage },
];

const SUB_CATEGORIES = [
  { name: "Bonnet", icon: NoImage },
  { name: "Bumper", icon: NoImage },
  { name: "Body Bush", icon: NoImage },
  { name: "Fog Lamp", icon: NoImage },
  { name: "Head Lamp", icon: NoImage },
  { name: "Panel", icon: NoImage },
];

// -------------------- SMALL COMPONENTS --------------------
const VehicleSelection = ({ vehicle, onEdit }) => (
  <div className="v-selection">
    <div className="v-selection-tags">
      {[vehicle.make, vehicle.model, vehicle.variant, vehicle.fuel, vehicle.year].map(
        (v, i) => (
          <span key={i} className="v-tag">
            {v}
          </span>
        )
      )}
      <img src={EditIcon} className="edit-icon" alt="edit" onClick={onEdit} />
    </div>
    <div className="v-selection-hint">You can change your vehicle details</div>
  </div>
);

const CategoryGrid = ({ title, items, onSelect }) => (
  <div className="category-section">
    <h3 className="category-title">{title}</h3>
    <div className="category-grid">
      {items.map((item, i) => (
        <div
          key={i}
          className="category-card"
          onClick={() => onSelect(item)}
        >
          <img src={item.icon} alt={item.name} />
          <span className="category-name">{item.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const ServicePanel = ({ services }) => {
  return (
    <div className="service-panel">
      <div className="service-header">
        <h4>Service Type</h4>
        <img src={ServiceTypeIcon} alt="service" />
      </div>

      <ul className="service-list">
        {services.map((service, i) => (
          <li key={i} className="service-item">
            {service}
          </li>
        ))}
      </ul>
    </div>
  );
};


// -------------------- MAIN --------------------
const VehicleNumberEntry = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    ...MOCK_VEHICLE,
    number: state?.vehicleNumber,
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleSubCategory = (sub) => {
    navigate("/vehicle-number-products", {
      state: {
        vehicle,
        category: selectedCategory,
        subCategory: sub,
      },
    });
  };

  return (
    <div className="vehicle-page">
      <Search />

      <div className="vehicle-content">
        <VehicleSelection vehicle={vehicle} onEdit={() => setShowPopup(true)} />

        <div className="main-content">
          <div className="left-section">
            <CategoryGrid
              title="Category wise this Vehicle"
              items={MAIN_CATEGORIES}
              onSelect={(c) => setSelectedCategory(c.name)}
            />

            {selectedCategory && (
              <CategoryGrid
                title={`Sub Category - ${selectedCategory}`}
                items={SUB_CATEGORIES}
                onSelect={handleSubCategory}
              />
            )}
          </div>

          <div className="right-section">
            <ServicePanel
              services={[
                "Brake Service",
                "Battery Check",
                "Oil Change",
                "AC Service",
              ]}
            />
          </div>
        </div>
      </div>

      {/* ---------------- POPUP ---------------- */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Edit Vehicle</h3>

            <input
              className="plate-input"
              placeholder="Enter Vehicle Number"
            />

            <div className="popup-divider">OR</div>

            <select><option>Make</option></select>
            <select><option>Model</option></select>
            <select><option>Year</option></select>
            <select><option>Variant</option></select>

            <div className="popup-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleNumberEntry;
