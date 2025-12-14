import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';
import NoImage from '../../../assets/No Image.png';
import '../../../styles/search_by/MyOrder/Brand.css';

const Brand = () => {
  const navigate = useNavigate();

  const brands = [
    { id: 1, name: 'HELLA', image: NoImage },
    { id: 2, name: 'LUK', image: NoImage },
    { id: 3, name: 'BOSCH', image: NoImage },
    { id: 4, name: 'CONTITECH', image: NoImage },
    { id: 5, name: 'Ashok Leyland', image: NoImage },
    { id: 6, name: 'Lucas TVS Limited', image: NoImage },
    { id: 7, name: 'UG', image: NoImage },
    { id: 8, name: 'Valeo', image: NoImage },
    { id: 9, name: 'Jaico Auto Industries Ltd', image: NoImage },
    { id: 10, name: 'INA', image: NoImage },
    { id: 11, name: 'Finolex', image: NoImage },
    { id: 12, name: 'JK Pioneer', image: NoImage },
    { id: 13, name: 'SCHAEFFLER', image: NoImage },
    { id: 14, name: 'SPICER', image: NoImage },
    { id: 15, name: 'LUMAX', image: NoImage },
    { id: 16, name: 'SKF', image: NoImage },
    { id: 17, name: 'AutoKoi', image: NoImage },
    { id: 18, name: 'myTVS', image: NoImage },
    { id: 19, name: 'CHAMPION', image: NoImage },
    { id: 20, name: 'Delphi Technologies', image: NoImage },
    { id: 21, name: '3M', image: NoImage },
    { id: 22, name: 'PHC', image: NoImage },
    { id: 23, name: 'elofic', image: NoImage },
    { id: 24, name: 'BEHR', image: NoImage },
    { id: 25, name: 'SACHS', image: NoImage },
    { id: 26, name: 'MEC', image: NoImage },
    { id: 27, name: 'Castrol', image: NoImage },
    { id: 28, name: 'MAHLE', image: NoImage },
    { id: 29, name: 'EXEDY', image: NoImage },
    { id: 30, name: 'DENSO', image: NoImage },
    { id: 31, name: 'NGK', image: NoImage },
    { id: 32, name: 'Rane', image: NoImage },
    { id: 33, name: 'MP', image: NoImage },
    { id: 34, name: 'SMIC', image: NoImage },
    { id: 35, name: 'JK Tyre', image: NoImage },
    { id: 36, name: 'GOODYEAR', image: NoImage }
  ];

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
          <div key={brand.id} className="brand-card">
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
