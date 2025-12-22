import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';
import NoImage from '../../../assets/No Image.png';
import '../../../styles/search_by/MyOrder/Brand.css';
import myTVS from "../../../assets/Brands/MYTVS.png"
import Filtron from "../../../assets/Brands/FILTRON.png"
import MFC from "../../../assets/Brands/MFC.png"
const Brand = () => {
  const navigate = useNavigate();

  const brands = [
    { id: 1, name: 'FILTRON', image: Filtron },
    { id: 2, name: 'MFC', image: MFC },
    { id: 3, name: 'MYTVS', image: myTVS },
  ];

  const handleBrandClick = (brand) => {
    navigate('/Category', { state: { brand: brand.name } });
  };

  return (
    <div className="brand-container">
      {/* Top Section with Back Button and Title */}
      <div className="brand-top-section">
        <button className="brand-back-button" onClick={() => navigate(-1)}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="brand-title">Brand</h1>
      </div>

      {/* Brands Grid */}
      <div className="brands-grid">
        {brands.map((brand) => (
          <div 
            key={brand.id} 
            className="brand-card"
            onClick={() => handleBrandClick(brand)}
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-image-wrapper">
              <img src={brand.image} alt={brand.name} className="brand-image" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brand;
