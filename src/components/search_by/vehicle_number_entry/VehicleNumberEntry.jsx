import React, { useState,useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Search from "../../home/Search";
import { getAssets, getAsset } from "../../../utils/assets";
import EditIcon from "../../../assets/vehicle_search_entry/edit.png";
import ServiceTypeIcon from "../../../assets/vehicle_search_entry/servicetype.png";
import NoImage from "../../../assets/No Image.png";

import "../../../styles/search_by/vehicle_number_entry/VehicleNumber.css";
//category
import BrakeSystem from "../../../assets/Categories/BRAKE SYSTEM.png";
import Accessories from "../../../assets/Categories/ACCESSORIES.png";
import Battery from "../../../assets/Categories/BATTERY.png";
import Bearing from "../../../assets/Categories/BEARING.png";
import Belts from "../../../assets/Categories/BELTS AND TENSIONER.png";
import BodyParts from "../../../assets/Categories/BODY PARTS.png";
import Cables from "../../../assets/Categories/CABLES AND WIRES.png";
import ChildParts from "../../../assets/Categories/CHILD PARTS.png";
//sub-category
import BrakePad from "../../../assets/brakePad.png";
import BrakeDisc from "../../../assets/Brake Disk.png";
import Caliper from "../../../assets/caliperPins.png";
import BrakeShoe from "../../../assets/brakeShoe.png";
import BrakeLining from "../../../assets/BrakeLining.png";
import MC from "../../../assets/McBooster.png";
import Anti from "../../../assets/AntiLocking.png";
import BrakeHose from "../../../assets/brakeHose.png";
import BrakeDrum from "../../../assets/brakeDrum.png";
import BrakeCable from "../../../assets/Sub Category/BRAKE CABLE.png";
import Cylinder from "../../../assets/Cylinder.png";

// -------------------- MOCK DATA --------------------
const MOCK_VEHICLE = {
  make: "Hyundai",
  model: "Grand",
  variant: "i10",
  fuel: "Petrol",
  year: "2021",
};

const MAIN_CATEGORIES = [
  { name: "Brake System", icon: BrakeSystem },
  { name: "Accessories", icon: Accessories },
  { name: "Battery", icon: Battery },
  { name: "Bearing", icon: Bearing },
  { name: "Belts and Tensioner", icon: Belts },
  { name: "Body Parts", icon: BodyParts },
  { name: "Cables and Wires", icon: Cables },
  { name: "Child Parts", icon: ChildParts },
];

const SUB_CATEGORIES = [
  { name: "Brake Pad", icon: BrakePad },
  { name: "Brake Disc", icon: BrakeDisc },
  { name: "Caliper Pins", icon: Caliper },
  { name: "Brake Shoe", icon: BrakeShoe },
  { name: "Brake Lining", icon: BrakeLining },
  { name: "MC / Booster", icon: MC },
  { name: "Cylinder", icon: Cylinder },
  { name: "Anti Locking (ABS)", icon: Anti },
  { name: "Brake Hose", icon: BrakeHose },
  { name: "Brake Drum", icon: BrakeDrum },
  { name: "Brake Cable", icon: BrakeCable },
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
      <button
        className="Vne-edit-btn"
        onClick={onEdit}
        aria-label="Edit vehicle"
      >
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

const ServicePanel = ({ services, onSelectService, activeService }) => {
  return (
    <div className="Vne-service-panel">
      <div className="Vne-service-header">
        <h4>Service Type</h4>
        <img src={ServiceTypeIcon} alt="service" />
      </div>

      <ul className="Vne-service-list">
        {services.map((service, i) => (
          <li
            key={i}
            className={`Vne-service-item ${
              activeService === service ? "active" : ""
            }`}
            onClick={() => onSelectService(service)}
          >
            {service}
          </li>
        ))}
      </ul>
    </div>
  );
};

const VehicleNumberEntry = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = state?.vehicleNumber || searchParams.get('vehicleNumber') || "";

  const [vehicle] = useState({
    ...MOCK_VEHICLE,
    number: state?.vehicleNumber || searchParams.get('vehicleNumber'),
  });
  const [selectedService, setSelectedService] = useState(null);

  // Function to update URL with vehicle context
  const updateURLParams = (vehicleData, category = null, subCategory = null) => {
    const params = new URLSearchParams();
    
    if (vehicleData.number) params.set('vehicleNumber', vehicleData.number);
    if (vehicleData.make) params.set('make', vehicleData.make);
    if (vehicleData.model) params.set('model', vehicleData.model);
    if (vehicleData.variant) params.set('variant', vehicleData.variant);
    if (vehicleData.fuel) params.set('fuelType', vehicleData.fuel);
    if (vehicleData.year) params.set('year', vehicleData.year);
    if (category) params.set('category', category);
    if (subCategory) params.set('subCategory', subCategory);
    
    setSearchParams(params, { replace: true });
  };

  // Update URL on mount
  useEffect(() => {
    if (vehicle.number) {
      updateURLParams(vehicle, selectedCategory, selectedSubCategory);
    }
  }, []);

  const handleServiceClick = (serviceType) => {
    setSelectedService(serviceType);

    navigate("/service-type-products", {
      state: {
        serviceType,
        make: vehicle.make,
        model: vehicle.model,
        category: selectedCategory,
        subCategory: selectedSubCategory,
      },
    });
  };

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
      {searchKey && (
        <div className="vne-search-key-text">
          <span className="srp-search-key-label">Search Key : </span>
          <span className="srp-search-key-value">{searchKey}</span>
        </div>
      )}

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

          {/* SERVICE TYPE PANEL (COMMENTED OUT - NOT NEEDED) */}
          {/* <div className="Vne-right-section">
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
                "Brake Fluid Replacement",
                "Brake Shoe Replacement (Drum Brakes)",
                "Brake Pad Cleaning & Adjustment",
                "Brake Rotor (Disc) Replacement",
              ]}
              onSelectService={handleServiceClick}
              activeService={selectedService}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default VehicleNumberEntry;
