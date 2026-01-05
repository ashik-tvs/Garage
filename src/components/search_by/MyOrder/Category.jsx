import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/search_by/MyOrder/Category.css";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import apiService from "../../../services/apiservice";

// Category Images
import BrakeSystem from "../../../assets/Categories/BRAKE SYSTEM.png";
import Accessories from "../../../assets/Categories/ACCESSORIES.png";
import Battery from "../../../assets/Categories/BATTERY.png";
import Bearing from "../../../assets/Categories/BEARING.png";
import Belts from "../../../assets/Categories/BELTS AND TENSIONER.png";
import BodyParts from "../../../assets/Categories/BODY PARTS.png";
import Cables from "../../../assets/Categories/CABLES AND WIRES.png";
import ChildParts from "../../../assets/Categories/CHILD PARTS.png";
import Clutch from "../../../assets/Categories/CLUTCH SYSTEMS.png";
import Comfort from "../../../assets/Categories/GLASS.png";
import Electricals from "../../../assets/Categories/ELECTRICALS AND ELECTRONICS.png";
import Engine from "../../../assets/Categories/ENGINE.png";
import Filters from "../../../assets/Categories/FILTERS.png";
import Fluids from "../../../assets/Categories/FLUIDS COOLANT AND GREASE.png";
import Horns from "../../../assets/Categories/HORNS.png";
import Lubes from "../../../assets/Categories/LUBES.png";
import Lights from "../../../assets/Categories/LIGHTING.png";

const Category = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { make, model, brand, variant, featureLabel, isOnlyWithUs } = location.state || {};
  
  console.log('Category component - Received state:', { make, model, brand, variant, featureLabel, isOnlyWithUs });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine if we're coming from Make/Model flow, Discontinued flow, Electric flow, or Features flow
  const isFromMakeModel = make && model;
  const isFromDiscontinued = model && (variant === 'wide' || featureLabel === 'Discontinued Model');
  const isFromElectric = model && (variant === 'e' || featureLabel === 'Electric');
  const isFromOnlyWithUs = isOnlyWithUs || (brand && (variant === 'logo' || featureLabel === 'Only with us'));

  // Determine API endpoint based on source
  const getApiEndpoint = () => {
    if (isFromOnlyWithUs) {
      return 'parts-list'; // Use parts-list API for Only with us brand flow
    }
    if (isFromMakeModel || isFromDiscontinued || isFromElectric) {
      return 'parts-list'; // Use parts-list API for Make/Model, Discontinued, or Electric flow
    }
    // For Features flow (Fast Movers, High Value, etc.)
    switch(variant) {
      case 'fm': // Fast Movers
        return '/fastmovers/categories';
      case 'hv': // High Value
        return '/highvalue/categories';
      default:
        return '/fastmovers/categories';
    }
  };

  // Determine cache key based on source
  const getCacheKey = () => {
    if (isFromOnlyWithUs && brand) {
      return `categories_onlywithus_${brand}`;
    }
    if (isFromDiscontinued) {
      return `categories_discontinued_${model}`;
    }
    if (isFromElectric) {
      return `categories_electric_${model}`;
    }
    if (isFromMakeModel) {
      return `categories_${make}_${model}`;
    }
    return `categories_${variant || 'fm'}`;
  };

  // Icon mapping based on category name
  const iconMap = {
    "ENGINE": Engine,
    "BRAKE SYSTEM": BrakeSystem,
    "BATTERY": Battery,
    "BODY PARTS": BodyParts,
    "ACCESSORIES": Accessories,
    "ELECTRICALS & ELECTRONICS": Electricals,
    "ELECTRICALS AND ELECTRONICS": Electricals,
    "FILTERS": Filters,
    "CABLES & WIRES": Cables,
    "CABLES AND WIRES": Cables,
    "BEARING": Bearing,
    "HORNS": Horns,
    "LUBES": Lubes,
    "FLUIDS, COOLANT & GREASE": Fluids,
    "FLUIDS COOLANT AND GREASE": Fluids,
    "GLASS / COMFORT": Comfort,
    "GLASS": Comfort,
    "CLUTCH SYSTEMS": Clutch,
    "BELTS & TENSIONER": Belts,
    "BELTS AND TENSIONER": Belts,
    "LIGHTING": Lights,
    "CHILD PARTS": ChildParts,
    "CHILDPARTS": ChildParts,
  };

  const getIconForCategory = (categoryName) => {
    const upperName = categoryName.toUpperCase();
    return iconMap[upperName] || Engine; // Default to Engine icon if not found
  };

  useEffect(() => {
    fetchCategories();
  }, [variant, make, model, brand]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = getCacheKey();
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (cachedData && cacheTimestamp) {
        const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;
        
        if (isCacheValid) {
          console.log(`Loading categories from cache...`);
          setCategories(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      // Fetch from API based on source
      const endpoint = getApiEndpoint();
      console.log(`Fetching categories from ${endpoint}...`);
      
      let response;
      
      if (isFromOnlyWithUs && brand) {
        // Use parts-list API with brand filter for "Only with us" flow
        const requestPayload = {
          brandPriority: [brand.toUpperCase()],
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: null,
          customerCode: "0046",
          partNumber: null,
          model: null,
          brand: "mytvs",
          subAggregate: null,
          aggregate: null,
          make: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null
        };
        
        console.log('Parts-list API request for Only with us brand:', requestPayload);
        response = await apiService.post('/parts-list', requestPayload);

        console.log('Parts-list API Response:', response);

        // Handle response structure
        let partsData = [];
        if (Array.isArray(response)) {
          partsData = response;
        } else if (response && Array.isArray(response.data)) {
          partsData = response.data;
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        // Extract unique aggregates (categories) for the selected brand
        const uniqueCategories = [...new Set(
          partsData
            .map(item => item.aggregate)
            .filter(aggregate => aggregate)
        )];

        console.log('Unique categories for brand:', uniqueCategories);

        if (uniqueCategories.length === 0) {
          const errorMsg = `No categories found for brand ${brand}.`;
          setError(errorMsg);
          setCategories([]);
          setLoading(false);
          return;
        }

        const formattedCategories = uniqueCategories.map((categoryName, index) => ({
          id: index + 1,
          name: categoryName,
          image: getIconForCategory(categoryName)
        }));

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(formattedCategories));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        console.log(`Categories cached successfully`);

        setCategories(formattedCategories);
      } else if (isFromMakeModel || isFromDiscontinued || isFromElectric) {
        // Use parts-list API with model filter (and make if available)
        const requestPayload = {
          brandPriority: ["VALEO"],
          limit: 5000,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: null,
          customerCode: "0046",
          partNumber: null,
          model: model,
          brand: null,
          subAggregate: null,
          aggregate: null,
          make: (isFromDiscontinued || isFromElectric) ? null : make, // No make for discontinued/electric
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null
        };
        
        console.log('Parts-list API request:', requestPayload);
        response = await apiService.post('/parts-list', requestPayload);

        console.log('Parts-list API Response:', response);

        // Handle response structure
        let partsData = [];
        if (Array.isArray(response)) {
          partsData = response;
        } else if (response && Array.isArray(response.data)) {
          partsData = response.data;
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        // Extract unique aggregates (categories)
        const uniqueCategories = [...new Set(
          partsData
            .map(item => item.aggregate)
            .filter(aggregate => aggregate)
        )];

        console.log('Unique categories:', uniqueCategories);

        if (uniqueCategories.length === 0) {
          const errorMsg = isFromDiscontinued 
            ? `No categories found for discontinued model ${model}.`
            : (isFromElectric 
              ? `No categories found for electric model ${model}.`
              : `No categories found for ${make} ${model}.`);
          setError(errorMsg);
          setCategories([]);
          setLoading(false);
          return;
        }

        const formattedCategories = uniqueCategories.map((categoryName, index) => ({
          id: index + 1,
          name: categoryName,
          image: getIconForCategory(categoryName)
        }));

        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(formattedCategories));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        console.log(`Categories cached successfully`);

        setCategories(formattedCategories);
      } else {
        // Use fastmovers or highvalue API
        response = await apiService.get(endpoint);
        
        if (response.success && Array.isArray(response.data)) {
          const formattedCategories = response.data.map((categoryName, index) => ({
            id: index + 1,
            name: categoryName,
            image: getIconForCategory(categoryName)
          }));
          
          // Cache the results
          localStorage.setItem(cacheKey, JSON.stringify(formattedCategories));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          console.log(`Categories cached successfully`);
          
          setCategories(formattedCategories);
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(-1);

  const handleCategoryClick = (category) => {
    navigate("/sub_category", {
      state: {
        make,
        model,
        brand,
        category: category.name,
        aggregateName: category.name, // Pass the aggregate name for API filtering
        variant,
        featureLabel,
        isOnlyWithUs
      },
    });
  };

  return (
    <div className="category-container">
      {/* Header */}
      <div className="category-header">
        <button className="back-button" onClick={handleBack}>
          <img src={LeftArrow} alt="Back" />
        </button>
        <h1 className="category-title">
          {featureLabel && `${featureLabel} - `}
          {isFromOnlyWithUs && brand && `${brand} - `}
          {isFromDiscontinued && model && `${model} - `}
          {isFromElectric && model && `${model} - `}
          {isFromMakeModel && `${make} ${model} - `}
          Search by Category
        </h1>
      </div>

      {/* Category Grid */}
      <div className="category-content">
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            <p>Loading categories...</p>
          </div>
        ) : error ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "red" }}>
            <p>{error}</p>
            <button onClick={fetchCategories} style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
            <p>No categories available</p>
          </div>
        ) : (
          categories.map((category) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default Category;
