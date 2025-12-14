import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/search_by/MyOrder/Category.css';
import noImage from '../../../assets/No Image.png';

const Category = () => {
  const navigate = useNavigate();

  const firstRowCategories = [
    { id: 1, name: 'Engine' },
    { id: 2, name: 'Brakes' },
    { id: 3, name: 'Battery' },
    { id: 4, name: 'Steering' },
    { id: 5, name: 'Tyres' },
    { id: 6, name: 'Body Parts' },
    { id: 7, name: 'Accessories' },
    { id: 8, name: 'Electricals' },
    { id: 9, name: 'Filters' },
  ];

  const secondRowCategories = [
    { id: 10, name: 'Cables and Wires' },
    { id: 11, name: 'Bearing' },
    { id: 12, name: 'Horns' },
    { id: 13, name: 'Lubes' },
    { id: 14, name: 'FLUIDS AND GREASE' },
    { id: 15, name: 'Glass' },
    { id: 16, name: 'INTERIOR & COMFORTS' },
    { id: 17, name: 'TRANSMISSION' },
    { id: 18, name: 'Rubber and .....' },
  ];

  const thirdRowCategories = [
    { id: 19, name: 'Wiper System' },
    { id: 20, name: 'CLUTCH SYSTEMS' },
    { id: 21, name: 'ELECTRICALS AND ...' },
    { id: 22, name: 'Suspension' },
    { id: 23, name: 'Belt and Tensionor' },
    { id: 24, name: 'HVAC and Thermal' },
    { id: 25, name: 'Lighting' },
    { id: 26, name: 'PAINTS AND CON....' },
    { id: 27, name: 'Child Parts' },
  ];

  const fourthRowCategories = [
    { id: 28, name: 'Fuel Systems' },
  ];

  const handleCategoryClick = (category) => {
    // Navigate to the appropriate page based on category
    console.log('Category clicked:', category.name);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <button className="category-back-button" onClick={handleBackClick}>
          <div className="category-back-icon"></div>
        </button>
        <h1 className="category-title">Category</h1>
      </div>

      <div className="category-grid-wrapper">
        {/* First Row */}
        <div className="category-row">
          <div className="category-row-inner">
            {firstRowCategories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-img-wrapper">
                  <img src={noImage} alt={category.name} className="category-img" />
                </div>
                <div className="category-label-wrapper">
                  <p className="category-label">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Row */}
        <div className="category-row">
          <div className="category-row-inner">
            {secondRowCategories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-img-wrapper">
                  <img src={noImage} alt={category.name} className="category-img" />
                </div>
                <div className="category-label-wrapper">
                  <p className="category-label">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Third Row */}
        <div className="category-row">
          <div className="category-row-inner">
            {thirdRowCategories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-img-wrapper">
                  <img src={noImage} alt={category.name} className="category-img" />
                </div>
                <div className="category-label-wrapper">
                  <p className="category-label">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fourth Row */}
        <div className="category-row">
          <div className="category-row-inner">
            {fourthRowCategories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-img-wrapper">
                  <img src={noImage} alt={category.name} className="category-img" />
                </div>
                <div className="category-label-wrapper">
                  <p className="category-label">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
