import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/MakeNew.css";
import apiService from "../../../services/apiservice";
import OciImage from "../../oci_image/ociImages";
import noImage from "../../../assets/No Image.png";
import Navigation from "../../Navigation/Navigation";
import Maruti from "../../../assets/Make/MARUTI SUZUKI.png";
import Tata from "../../../assets/Make/TATA.png";
import Hyundai from "../../../assets/Make/HYUNDAI.png";
import Mahindra from "../../../assets/Make/MAHINDRA.png";
import Abarth from "../../../assets/Make/ABARTH.png";
import Audi from "../../../assets/Make/AUDI.png";
import Ford from "../../../assets/Make/FORD.png";
import Bently from "../../../assets/Make/BENTLEY.png";
import Bmw from "../../../assets/Make/BMW.png";
import Jeep from "../../../assets/Make/JEEP.png";

const MakeNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { variant, featureLabel } = location.state || {};
  
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uiAssets, setUiAssets] = useState({});

  // Icon mapping for make images
  const makeIconMap = {
    "MARUTI SUZUKI": Maruti,
    "MARUTI": Maruti,
    "HYUNDAI": Hyundai,
    "TATA": Tata,
    "MAHINDRA": Mahindra,
    "ABARTH": Abarth,
    "AUDI": Audi,
    "FORD": Ford,
    "BENTLEY": Bently,
    "BMW": Bmw,
    "JEEP": Jeep,
  };

  const getMakeIcon = (makeName) => {
    const upperName = makeName.toUpperCase();
    return makeIconMap[upperName] || noImage;
  };

  /* ===============================
     FETCH UI ASSETS
     =============================== */
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data);
      } catch (error) {
        console.error("❌ Error fetching UI assets:", error);
      }
    };
    fetchUiAssets();
  }, []);

  const getAssetUrl = (tagName) => {
    if (!uiAssets[tagName]) return "";
    return apiService.getAssetUrl(uiAssets[tagName]);
  };

  useEffect(() => {
    fetchMakes();
  }, [variant]);

  const fetchMakes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine cache key based on variant
      const cacheKey = variant ? `makes_${variant}` : 'makes_list';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (cachedData && cacheTimestamp) {
        const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;
        
        if (isCacheValid) {
          console.log(`Loading makes for ${variant || 'default'} from cache...`);
          setMakes(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      let response;
      let uniqueMakes = [];

      // Fetch based on variant
      if (variant === 'cng') {
        // Fetch from CNG API
        console.log('Fetching makes from CNG API...');
        response = await apiService.get('/cng');
        
        console.log('CNG API Response:', response);

        // Handle response structure
        let cngData = [];
        if (response.success && Array.isArray(response.data)) {
          cngData = response.data;
        } else if (Array.isArray(response)) {
          cngData = response;
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        // Extract unique makes from CNG data
        uniqueMakes = [...new Set(
          cngData
            .map(item => item.make)
            .filter(make => make)
        )];

      } else if (variant === 'e') {
        // Fetch from Electric API
        console.log('Fetching makes from Electric API...');
        response = await apiService.get('/electric');
        
        console.log('Electric API Response:', response);

        // Handle response structure
        let electricData = [];
        if (response.success && Array.isArray(response.data)) {
          electricData = response.data;
        } else if (Array.isArray(response)) {
          electricData = response;
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        // Extract unique makes from Electric data
        uniqueMakes = [...new Set(
          electricData
            .map(item => item.make)
            .filter(make => make)
        )];

      } else {
        // Default: Fetch from vehicle-list API
        console.log('Fetching makes from vehicle-list API...');
        response = await apiService.post('/vehicle-list', {
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          customerCode: "0046",
          brand: null,
          partNumber: null,
          aggregate: null,
          subAggregate: null,
          make: null,
          model: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null
        });

        console.log('Vehicle-list API Response:', response);

        // Handle different response structures
        let vehicleData = [];
        if (Array.isArray(response)) {
          vehicleData = response;
        } else if (response && Array.isArray(response.data)) {
          vehicleData = response.data;
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        // Extract unique makes
        uniqueMakes = [...new Set(
          vehicleData
            .map(item => item.make)
            .filter(make => make)
        )];
      }

      console.log('Unique makes:', uniqueMakes);

      if (uniqueMakes.length === 0) {
        setError(`No makes found for ${featureLabel || 'this category'}.`);
        setMakes([]);
        setLoading(false);
        return;
      }

      // Format makes with icons
      const formattedMakes = uniqueMakes.map((makeName, index) => ({
        id: index + 1,
        name: makeName,
        image: getMakeIcon(makeName)
      }));

      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify(formattedMakes));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      console.log(`Makes for ${variant || 'default'} cached successfully`);

      setMakes(formattedMakes);
    } catch (err) {
      console.error("Error fetching makes:", err);
      setError("Failed to load makes. Please try again.");
    } finally {
      setLoading(false);
    }
  };  const handleMakeClick = (make) => {
    console.log("🚗 Make clicked:", make.name);
    // Normalize make name to uppercase for API consistency
    const normalizedMake = make.name.toUpperCase();
    console.log("🚗 Normalized make:", normalizedMake);
    
    navigate("/Model", { 
      state: { 
        make: normalizedMake,
        variant,
        featureLabel
      } 
    });
  };

  return (
    <div className="make-container">
      <div className="make-header">
        <Navigation breadcrumbs={[]} />
      </div>

      <div className="make-grid-wrapper">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading makes...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
            <p>{error}</p>
            <button 
              onClick={fetchMakes} 
              style={{ 
                marginTop: "10px", 
                padding: "8px 16px", 
                cursor: "pointer",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Retry
            </button>
          </div>
        ) : makes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No makes available</p>
          </div>
        ) : (
          <div className="make-row">
            <div className="make-row-inner">
              {makes.map((make) => (
                <div
                  key={make.id}
                  className="make-card"
                  onClick={() => handleMakeClick(make)}
                >
                  <div className="make-img-wrapper">
                    <OciImage
                      partNumber={make.name}
                      folder="make"
                      fallbackImage={make.image}
                      className="make-img"
                      alt={make.name}
                    />
                  </div>
                  <div className="make-text">
                    <p className="make-name" title={make.name}>
                      {make.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeNew;
