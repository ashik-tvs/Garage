import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import '../../../styles/search_by/MyOrder/Model.css';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';

// Audi images
import AudiA3 from "../../../assets/Model/Audi - A3.png";
import AudiA4 from "../../../assets/Model/Audi - A4.png";
import AudiA5 from "../../../assets/Model/Audi - A5.png";
import AudiA6 from "../../../assets/Model/Audi - A6.png";
import AudiA7 from "../../../assets/Model/Audi - A7.png";
import AudiA8 from "../../../assets/Model/Audi - A8.png";
import AudiQ3 from "../../../assets/Model/Audi - Q3.png";
import AudiQ5 from "../../../assets/Model/Audi - Q5.png";
import AudiQ7 from "../../../assets/Model/Audi - Q7.png";
import AudiR8 from "../../../assets/Model/Audi - R8.png";
import AudiTT from "../../../assets/Model/Audi - TT.png";

const Model = () => {
  const navigate = useNavigate();
    const { state } = useLocation();
  const make = state?.make;
  const serviceType = state?.serviceType || "";

  const models = [
    { id: 1, name: 'A3', image: AudiA3 },
    { id: 2, name: 'A4', image: AudiA4 },
    { id: 3, name: 'A5', image: AudiA5 },
    { id: 4, name: 'A6', image: AudiA6 },
    { id: 5, name: 'A7', image: AudiA7 },
    { id: 6, name: 'A8', image: AudiA8 },
    { id: 7, name: 'Q3', image: AudiQ3 },
    { id: 8, name: 'Q5', image: AudiQ5 },
    { id: 9, name: 'Q7', image: AudiQ7 },
    { id: 10, name: 'R8', image: AudiR8 },
    { id: 11, name: 'TT', image: AudiTT },
  ];

const handleModelClick = (model) => {
  navigate("/service-type-category", {
    state: {
      make,
      model: model.name,
      serviceType, // forwarded only, not used here
    },
  });
};

  // Chunk array into groups of 9
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const modelRows = chunkArray(models, 9);

  return (
    <div className="model-container">
      <div className="model-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="model-title">Model</h1>
      </div>

      <div className="model-grid-wrapper">
        {modelRows.map((row, rowIndex) => (
          <div key={rowIndex} className="model-row">
            {row.map((model) => (
              <div 
                key={`${rowIndex}-${model.id}`} 
                className="model-card"
                onClick={() => handleModelClick(model)}
              >
                <div className="model-card-content">
                  <img src={model.image} alt={model.name} className="model-image" />
                  <p className="model-name">{model.name}</p>
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
