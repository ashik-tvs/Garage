import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../../services/apiservice";
import { masterListAPI } from "../../../services/api";
import OciImage from "../../oci_image/ociImages";
import Navigation from "../../Navigation/Navigation";
import NoImage from "../../../assets/No Image.png";
import "../../../styles/search_by/MyOrder/Model.css";
import "../../../styles/skeleton/skeleton.css";

const BASE_PAYLOAD = {
  partNumber: null,
  sortOrder: "ASC",
  customerCode: "0046",
  aggregate: null,
  brand: null,
  fuelType: null,
  limit: 100,
  make: null,
  masterType: "model",
  model: null,
  offset: 0,
  primary: false,
  subAggregate: null,
  variant: null,
  year: null,
};

const Model = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const make = state?.make;
  const serviceType = state?.serviceType || "";

  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===================== FETCH MODELS ===================== */
  useEffect(() => {
    if (!make) return;

    const fetchModels = async () => {
      try {
        setLoading(true);

        const response = await masterListAPI({
          ...BASE_PAYLOAD,
          make,
        });

        if (response?.success && Array.isArray(response.data)) {
          const formattedModels = response.data.map((item, index) => ({
            id: index + 1,
            name: item.masterName,
          }));

          setModels(formattedModels);
        } else {
          setModels([]);
        }
      } catch (error) {
        console.error("❌ Model API Error:", error);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [make]);

  /* ===================== NAVIGATION ===================== */
  const handleModelClick = (model) => {
    navigate("/service-type-category", {
      state: {
        make,
        model: model.name,
        serviceType, // forwarded only
      },
    });
  };

  /* ===================== CHUNK (UNCHANGED LOGIC) ===================== */
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const modelRows = chunkArray(models, 9);

  /* ===================== JSX (STRUCTURE UNCHANGED) ===================== */
  return (
    <div className="model-container">
      <div className="model-header">
      <Navigation />
      </div>

      <div className="model-grid-wrapper">
        {loading ? (
          <div className="model-row">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="skeleton-model-item skeleton-card">
                <div className="skeleton skeleton-model-image"></div>
                <div className="skeleton skeleton-model-text"></div>
              </div>
            ))}
          </div>
        ) : (
          modelRows.map((row, rowIndex) => (
            <div key={rowIndex} className="model-row">
              {row.map((model) => (
                <div
                  key={`${rowIndex}-${model.id}`}
                  className="model-card"
                  onClick={() => handleModelClick(model)}
                >
                  <div className="model-card-content">
                    <OciImage
                      partNumber={model.name}
                      folder="model"
                      fallbackImage={NoImage}
                      className="model-image"
                      alt={model.name}
                    />
                    <p className="model-name">{model.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Model;
