import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/search_by/MyOrder/Model.css';
import noImage from '../../../assets/No Image.png';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';

const Model = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make } = location.state || {};

  const models = [
    { id: 1, name: '1 Series' },
    { id: 2, name: '2 Series' },
    { id: 3, name: '3 Series' },
    { id: 4, name: '4 Series' },
    { id: 5, name: '5 Series' },
    { id: 6, name: '6 Series' },
    { id: 7, name: '7 Series' },
    { id: 8, name: '8 Series' },
    { id: 9, name: '12 Series' },
  ];

  const handleModelClick = (model) => {
    navigate('/Category', { 
      state: { 
        make: make,
        model: model.name 
      } 
    });
  };

  return (
    <div className="model-container">
      <div className="model-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="model-title">Model</h1>
      </div>

      <div className="model-grid-wrapper">
        {[0, 1, 2].map((rowIndex) => (
          <div key={rowIndex} className="model-row">
            {models.map((model) => (
              <div 
                key={`${rowIndex}-${model.id}`} 
                className="model-card"
                onClick={() => handleModelClick(model)}
              >
                <div className="model-card-content">
                  <img src={noImage} alt={model.name} className="model-image" />
                  <p className="model-name" title={model.name}>{model.name}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Model;
