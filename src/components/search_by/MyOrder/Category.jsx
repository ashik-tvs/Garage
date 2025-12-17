import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/search_by/MyOrder/Category.css';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';

// Category images - using No Image placeholder for now
import NoImage from '../../../assets/No Image.png';

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, model, brand } = location.state || {};

  const categories = [
    { id: 1, name: 'Engine', image: NoImage },
    { id: 2, name: 'Brakes', image: NoImage },
    { id: 3, name: 'Battery', image: NoImage },
    { id: 4, name: 'Steering', image: NoImage },
    { id: 5, name: 'Tyres', image: NoImage },
    { id: 6, name: 'Body Parts', image: NoImage },
    { id: 7, name: 'Accessories', image: NoImage },
    { id: 8, name: 'Electricals', image: NoImage },
    { id: 9, name: 'Filters', image: NoImage },
    { id: 10, name: 'Cables and Wires', image: NoImage },
    { id: 11, name: 'Bearing', image: NoImage },
    { id: 12, name: 'Horns', image: NoImage },
    { id: 13, name: 'Lubes', image: NoImage },
    { id: 14, name: 'FLUIDS AND GREASE', image: NoImage },
    { id: 15, name: 'Glass', image: NoImage },
    { id: 16, name: 'INTERIOR & COMFORTS', image: NoImage },
    { id: 17, name: 'TRANSMISSION', image: NoImage },
    { id: 18, name: 'Rubber and .....', image: NoImage },
    { id: 19, name: 'Wiper System', image: NoImage },
    { id: 20, name: 'CLUTCH SYSTEMS', image: NoImage },
    { id: 21, name: 'ELECTRICALS AND ...', image: NoImage },
    { id: 22, name: 'Suspension', image: NoImage },
    { id: 23, name: 'Belt and Tensionor', image: NoImage },
    { id: 24, name: 'HVAC and Thermal', image: NoImage },
    { id: 25, name: 'Lighting', image: NoImage },
    { id: 26, name: 'PAINTS AND CON....', image: NoImage },
    { id: 27, name: 'Child Parts', image: NoImage },
    { id: 28, name: 'Fuel Systems', image: NoImage },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleCategoryClick = (category) => {
    console.log('Selected category:', category);
    // Navigate to Sub Category page
    navigate('/sub_category', {
      state: {
        make: make,
        model: model,
        brand: brand,
        category: category.name
      }
    });
  };

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="category-title">Search by Category</h1>
      </div>

      {/* Category Grid */}
      <div className="category-content">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-item"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="category-card">
              <div className="category-image-wrapper">
                <img
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                />
              </div>
              <div className="category-label">
                <span title={category.name}>{category.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
