import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LeftArrow from '../../../assets/Product/Left_Arrow.png';
import NoImage from '../../../assets/No Image.png';
import '../../../styles/search_by/MyOrder/Brand.css';
import apiService from '../../../services/apiservice';

// Brand Images
import myTVS from "../../../assets/Brands/MYTVS.png";
import Filtron from "../../../assets/Brands/FILTRON.png";
import MFC from "../../../assets/Brands/MFC.png";

const Brand = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { variant, featureLabel } = location.state || {};
  
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Brand image mapping
  const brandImageMap = {
    'FILTRON': Filtron,
    'MFC': MFC,
    'MYTVS': myTVS,
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if coming from "Only with us" feature
      const isOnlyWithUs = variant === 'logo' || featureLabel === 'Only with us';

      if (isOnlyWithUs) {
        // Fetch brands from only-with-us API
        console.log('Fetching brands from only-with-us API...');
        const response = await apiService.get('/only-with-us');
        
        console.log('Only-with-us API Response:', response);

        // Handle response structure
        let onlyWithUsData = [];
        if (Array.isArray(response)) {
          onlyWithUsData = response;
        } else if (response && Array.isArray(response.data)) {
          onlyWithUsData = response.data;
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        // Extract unique brands
        const uniqueBrands = [...new Set(
          onlyWithUsData
            .map(item => item.brand)
            .filter(brand => brand)
        )];

        console.log('Unique brands:', uniqueBrands);

        if (uniqueBrands.length === 0) {
          setError('No brands found for "Only with us".');
          setBrands([]);
          setLoading(false);
          return;
        }

        // Format brands with images
        const formattedBrands = uniqueBrands.map((brandName, index) => ({
          id: index + 1,
          name: brandName,
          image: brandImageMap[brandName.toUpperCase()] || NoImage
        }));

        setBrands(formattedBrands);
      } else {
        // Default brands for other flows
        setBrands([
          { id: 1, name: 'FILTRON', image: Filtron },
          { id: 2, name: 'MFC', image: MFC },
          { id: 3, name: 'MYTVS', image: myTVS },
        ]);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to load brands. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    navigate('/Category', { 
      state: { 
        brand: brand.name,
        variant,
        featureLabel,
        isOnlyWithUs: variant === 'logo' || featureLabel === 'Only with us'
      } 
    });
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

      {/* Loading State */}
      {loading && (
        <div className="brands-loading">
          <p>Loading brands...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="brands-error">
          <p>{error}</p>
        </div>
      )}

      {/* Brands Grid */}
      {!loading && !error && (
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
      )}
    </div>
  );
};

export default Brand;
