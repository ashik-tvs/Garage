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
const VehicleSelection = ({
  vehicle,
  onEdit,
  showEdit,
  onCancel,
  onConfirm,
}) => (
  <div className="Vne-selection">
    {/* Group 1000006943 */}
    <div className="Vne-edit-filter">
      {/* Group 480960940 */}
      <div className="Vne-filter-frame">
        {/* Rectangle 1769 */}
        <div className="Vne-filter-rect" />

        {/* Number group */}
        <div className="Vne-filter-number">
          {/* Hyundai */}
          <div className="Vne-num-part">{vehicle.make}</div>
          
          {/* Separator */}
          <div className="Vne-sep">-</div>
          
          {/* Grand */}
          <div className="Vne-num-part">{vehicle.model}</div>
          
          {/* Separator */}
          <div className="Vne-sep">-</div>
          
          {/* i10 */}
          <div className="Vne-num-part">{vehicle.variant}</div>
          
          {/* Separator */}
          <div className="Vne-sep">-</div>
          
          {/* Petrol */}
          <div className="Vne-num-part">{vehicle.fuel}</div>
          
          {/* Separator */}
          <div className="Vne-sep">-</div>
          
          {/* 2021 */}
          <div className="Vne-num-part">{vehicle.year}</div>
        </div>

        {/* Hidden indicator group */}
        <div className="Vne-indicator">
          <div className="Vne-indicator-text">IND</div>
          <div className="Vne-line-vertical" />
        </div>
      </div>

      {/* Frame 15 - Edit button */}
      <button className="Vne-edit-btn" onClick={onEdit} aria-label="Edit vehicle">
        <img src={EditIcon} alt="edit" className="Vne-edit-icon-img" />
      </button>
    </div>

    {/* Inline dropdowns */}
    {showEdit && (
      <div className="Vne-edit-dropdowns">
        <select className="Vne-dropdown">
          <option>Select Make</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Model</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Variant</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Fuel type</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Year</option>
        </select>
        <button className="Vne-find-btn" onClick={onConfirm}>
          Find Auto Parts
        </button>
      </div>
    )}

    <div className="Vne-selection-hint">
      You can change your vehicle details
    </div>
  </div>
);

const CategoryGrid = ({ title, items, onSelect, activeItem }) => (
  <div className="Vne-category-section">
    <h3 className="Vne-category-title">{title}</h3>

    <div className="Vne-category-grid">
      {items.map((item, i) => {
        const isActive = activeItem === item.name;

        return (
          <div
            key={i}
            className={`Vne-category-card ${isActive ? "active" : ""}`}
            onClick={() => onSelect(item)}
          >
            <img src={item.icon} alt={item.name} />
            <span className="Vne-category-name">{item.name}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const ServicePanel = ({ services }) => {
  return (
    <div className="Vne-service-panel">
      <div className="Vne-service-header">
        <h4>Service Type</h4>
        <img src={ServiceTypeIcon} alt="service" />
      </div>

      <ul className="Vne-service-list">
        {services.map((service, i) => (
          <li key={i} className="Vne-service-item">
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

  const [vehicle] = useState({
    ...MOCK_VEHICLE,
    number: state?.vehicleNumber,
  });

  const [selectedCategory, setSelectedCategory] = useState(
    MAIN_CATEGORIES[0].name
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

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

  const handleConfirmEdit = () => {
    setShowPopup(false);
    // Add logic to update vehicle details here
  };

  return (
    <div className="Vne-vehicle-page">
      <Search />

      <div className="Vne-vehicle-content">
        <VehicleSelection
          vehicle={vehicle}
          onEdit={() => setShowPopup(!showPopup)}
          showEdit={showPopup}
          onCancel={() => setShowPopup(false)}
          onConfirm={handleConfirmEdit}
        />

        <div className="Vne-main-content">
          <div className="Vne-left-section">
            <CategoryGrid
              title="Category wise this Vehicle"
              items={MAIN_CATEGORIES}
              onSelect={(c) => {
                setSelectedCategory(c.name);
                setSelectedSubCategory(null); // reset sub category
              }}
              activeItem={selectedCategory}
            />

            {selectedCategory && (
              <CategoryGrid
                title={`Sub Category - ${selectedCategory}`}
                items={SUB_CATEGORIES}
                onSelect={(sub) => {
                  setSelectedSubCategory(sub.name);
                  handleSubCategory(sub);
                }}
                activeItem={selectedSubCategory}
              />
            )}
          </div>

          <div className="Vne-right-section">
            <ServicePanel
              services={[
                "Brake Service",
                "Battery Check",
                "Oil Change",
                "AC Service",
                "Complete Brake System Inspection",
                "Rear Brake Pad Replacement",
                "Front Brake Pad Replacement",
                "ABS Warning Light Check",
                " Brake Fluid Replacement",
                "Brake Shoe Replacement (Drum Brakes)",
                "Brake Pad Cleaning & Adjustment",
                "Brake Rotor (Disc) Replacement",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleNumberEntry;
