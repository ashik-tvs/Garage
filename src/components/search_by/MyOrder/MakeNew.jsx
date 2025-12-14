import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/search_by/MyOrder/MakeNew.css';
import noImage from '../../../assets/No Image.png';

const MakeNew = () => {
  const navigate = useNavigate();
  const makes = [
    { id: 1, name: 'BMW' },
    { id: 2, name: 'MARUTHI' },
    { id: 3, name: 'HYUNDAI' },
    { id: 4, name: 'TATA' },
    { id: 5, name: 'MAHINDRA' },
    { id: 6, name: 'ABARTH' },
    { id: 7, name: 'ASHOK LEYLAND' },
    { id: 8, name: 'AUDI' },
    { id: 9, name: 'BENTLEY' },
    { id: 10, name: 'DAEWOO' },
    { id: 11, name: 'DATSUN' },
  ];

  const secondRowMakes = [
    { id: 12, name: 'FORCE MOTOR' },
    { id: 13, name: 'FERRARI' },
    { id: 14, name: 'ICML' },
    { id: 15, name: 'ISUZU' },
    { id: 16, name: 'HINDUSTUN' },
    { id: 17, name: 'SONALIKA' },
    { id: 18, name: 'MASERATI' },
    { id: 19, name: 'JAGUAR' },
    { id: 20, name: 'MERCEDES BENZ' },
    { id: 21, name: 'ROLLS ROYALS' },
    { id: 22, name: 'TVS' },
  ];

  const thirdRowMakes = [
    { id: 23, name: 'CITROEN' },
    { id: 24, name: 'SCANIA' },
    { id: 25, name: 'LEXUS' },
    { id: 26, name: 'SSANGYONG' },
    { id: 27, name: 'MITSUBISHI' },
    { id: 28, name: 'BYD' },
    { id: 29, name: 'VOLVO' },
    { id: 30, name: 'KIA' },
    { id: 31, name: 'MAHINDRA' },
    { id: 32, name: 'JEEP' },
    { id: 33, name: 'PEUGEOT' },
  ];

  const handleMakeClick = (make) => {
    navigate('/Model');
  };

  return (
    <div className="make-container">
      <div className="make-header">
        <button className="make-back-button">
          <div className="make-back-icon"></div>
        </button>
        <h1 className="make-title">Make</h1>
      </div>

      <div className="make-grid-wrapper">
        {/* First Row */}
        <div className="make-row">
          <div className="make-row-inner">
            {makes.map((make) => (
              <div 
                key={make.id} 
                className={`make-card ${make.name === 'ASHOK LEYLAND' ? 'make-card-wide' : ''}`}
                onClick={() => handleMakeClick(make)}
              >
                <div className="make-img-wrapper">
                  <img src={noImage} alt={make.name} className="make-img" />
                </div>
                <div className="make-text">
                  <p className="make-name">{make.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Row */}
        <div className="make-row">
          <div className="make-row-inner">
            {secondRowMakes.map((make) => (
              <div 
                key={make.id} 
                className={`make-card ${make.name === 'FORCE MOTOR' ? 'make-card-medium' : make.name === 'MERCEDES BENZ' ? 'make-card-medium' : make.name === 'SONALIKA' ? 'make-card-medium-large' : ''}`}
                onClick={() => handleMakeClick(make)}
              >
                <div className="make-img-wrapper">
                  <img src={noImage} alt={make.name} className="make-img" />
                </div>
                <div className="make-text">
                  <p className="make-name">{make.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Third Row */}
        <div className="make-row">
          <div className="make-row-inner">
            {thirdRowMakes.map((make) => (
              <div 
                key={make.id} 
                className={`make-card ${make.name === 'BYD' ? 'make-card-byd' : ''}`}
                onClick={() => handleMakeClick(make)}
              >
                <div className="make-img-wrapper">
                  <img src={noImage} alt={make.name} className="make-img" />
                </div>
                <div className="make-text">
                  <p className="make-name">{make.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeNew;
