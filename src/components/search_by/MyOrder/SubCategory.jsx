import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/home/SubCategory.css';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';
import NoImage from '../../../assets/No Image.png';
import ServiceTypeIcon from '../../../assets/vehicle_search_entry/servicetype.png';

const Sub_Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, model, brand, category } = location.state || {};

  const subCategories = [
    // Row 1
    [
      { id: 1, name: 'Brake Pad', image: NoImage },
      { id: 2, name: 'Brake Disc', image: NoImage },
      { id: 3, name: 'Caliper Pins', image: NoImage },
      { id: 4, name: 'Brake Shoe', image: NoImage },
      { id: 5, name: 'Brake Lining', image: NoImage },
      { id: 6, name: 'Mc, Booster', image: NoImage },
      { id: 7, name: 'Cylinder', image: NoImage },
    ],
    // Row 2
    [
      { id: 8, name: 'Anti Locking', image: NoImage },
      { id: 9, name: 'Brake Hose', image: NoImage },
      { id: 10, name: 'Brake Drum', image: NoImage },
    ],
  ];

  const serviceTypes = [
    'Complete Brake System Inspection',
    'Brake Noise / Vibration Diagnosis',
    'Brake Fluid Level Check',
    'ABS Warning Light Check',
    'Front Brake Pad Replacement',
    'Rear Brake Pad Replacement',
    'Brake Shoe Replacement (Drum Brakes)',
    'Brake Pad Cleaning & Adjustment',
    'Brake Rotor (Disc) Replacement',
    'Brake Rotor Resurfacing',
    'Brake Drum Replacement',
    'Brake Drum Turning / Resurfacing',
    'Brake Caliper Repair / Replacement',
    'Brake Line / Hose Replacement',
    'Brake Bleeding (Air Removal)',
    'Brake Oil Change (Brake Fluid Flush)',
    'Handbrake Cable Adjustment',
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubCategoryClick = (subCategory) => {
    console.log('Selected sub-category:', subCategory);
    // Navigate to products page
    navigate('/vehicle-number-products', {
      state: {
        make: make,
        model: model,
        brand: brand,
        category: category,
        subCategory: subCategory.name
      }
    });
  };

  const handleServiceTypeClick = (serviceType) => {
    console.log('Selected service type:', serviceType);
    // Navigate to products page
    navigate('/vehicle-number-products', {
      state: {
        make: make,
        model: model,
        brand: brand,
        category: category,
        subCategory: serviceType
      }
    });
  };

  return (
    <div className="sub-category-container">
      {/* Header */}
      <div className="sub-category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="sub-category-title">Search by Sub Category</h1>
      </div>

      <div className="sub-category-main">
        {/* Sub Categories Content */}
        <div className="sub-category-content">
          {subCategories.map((row, rowIndex) => (
            <div key={rowIndex} className="sub-category-row">
              {row.map((subCategory) => (
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
                    <span title={subCategory.name}>{subCategory.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Service Type Sidebar */}
        <div className="service-type-sidebar">
          <div className="service-type-header">
            <span>Service Type for Brake</span>
            <div className="service-type-icon">
              <img src={ServiceTypeIcon} alt="Service Type" />
            </div>
          </div>
<ul className="service-type-list">
  {serviceTypes.map((service, index) => (
    <li
      key={index}
      className="service-type-item"
      onClick={() => handleServiceTypeClick(service)}
    >
      {service}
    </li>
  ))}
</ul>

        </div>
      </div>
    </div>
  );
};

export default Sub_Category;
