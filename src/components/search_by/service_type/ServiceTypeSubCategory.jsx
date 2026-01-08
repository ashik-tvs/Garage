import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/home/SubCategory.css";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import ServiceTypeIcon from "../../../assets/vehicle_search_entry/servicetype.png";
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

const Sub_Category = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { serviceType, make, model, category } = state || {};

  const subCategories = [
    { id: 1, name: "Brake Pad", image: BrakePad },
    { id: 2, name: "Brake Disc", image: BrakeDisc },
    { id: 3, name: "Caliper Pins", image: Caliper },
    { id: 4, name: "Brake Shoe", image: BrakeShoe },
    { id: 5, name: "Brake Lining", image: BrakeLining },
    { id: 6, name: "MC / Booster", image: MC },
    { id: 7, name: "Cylinder", image: Cylinder },
    { id: 8, name: "Anti Locking (ABS)", image: Anti },
    { id: 9, name: "Brake Hose", image: BrakeHose },
    { id: 10, name: "Brake Drum", image: BrakeDrum },
    { id: 11, name: "Brake Cable", image: BrakeCable },
  ];

  const serviceTypes = [
    "Complete Brake System Inspection",
    "Brake Noise / Vibration Diagnosis",
    "Brake Fluid Level Check",
    "ABS Warning Light Check",
    "Front Brake Pad Replacement",
    "Rear Brake Pad Replacement",
    "Brake Shoe Replacement (Drum Brakes)",
    "Brake Pad Cleaning & Adjustment",
    "Brake Rotor (Disc) Replacement",
    "Brake Rotor Resurfacing",
    "Brake Drum Replacement",
    "Brake Drum Turning / Resurfacing",
    "Brake Caliper Repair / Replacement",
    "Brake Line / Hose Replacement",
    "Brake Bleeding (Air Removal)",
    "Brake Oil Change (Brake Fluid Flush)",
    "Handbrake Cable Adjustment",
  ];

  const handleBack = () => {
    navigate(-1);
  };

const handleSubCategoryClick = (subCategory) => {
  navigate("/service-type-products", {
    state: {
      serviceType,
      make,
      model,
      category,
      subCategory: subCategory.name,
    },
  });
};


const handleServiceTypeClick = (serviceType) => {
  console.log("Selected service type:", serviceType);
  navigate("/search-by-service-type", { state: { serviceType } });
};


  return (
    <div className="sub-category-container">
      {/* Header */}
      <div className="sub-category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/home')}>
            Home
          </span>
          <span className="breadcrumb-separator">&gt;</span>
          <span 
            className="breadcrumb-link" 
            onClick={() => navigate('/service-type-category', { 
              state: { serviceType, make, model } 
            })}
          >
            {category || 'Category'}
          </span>
          <span className="breadcrumb-separator">&gt;</span>
        </div>
      </div>

      <div className="sub-category-main">
        {/* Sub Categories Content */}
        <div className="sub-category-content">
          <div className="sub-category-row">
            {subCategories.map((subCategory) => (
              <div
                key={subCategory.id}
                className="sub-category-item"
                onClick={() => handleSubCategoryClick(subCategory)}
              >
                <div className="sub-category-image-wrapper">
                  <img
                    src={subCategory.image}
                    alt={subCategory.name}
                    className="sub-category-image"
                  />
                </div>
                <div className="sub-category-label">
                  <span>{subCategory.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Type Sidebar */}
        <div className="service-type-sidebar">
          <div className="service-type-header">
            <span>Service Type for Brake</span>
            <div className="service-type-icon">
              <img src={ServiceTypeIcon} alt="Service Type" />
            </div>
          </div>
          <div className="service-type-list">
            {serviceTypes.map((service, index) => (
              <div
                key={index}
                className="service-type-item"
                onClick={() => handleServiceTypeClick(service)}
              >
                {service}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sub_Category;
