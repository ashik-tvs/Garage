import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Category.css";
import Accessories from "../../assets/Categories/ACCESSORIES.png"
import Battery from "../../assets/Categories/BATTERY.png"
import Bearing from "../../assets/Categories/BEARING.png"
import Belts from "../../assets/Categories/BELTS AND TENSIONER.png"
import BodyParts from "../../assets/Categories/BODY PARTS.png"
import BrakeSystem from "../../assets/Categories/BRAKE SYSTEM.png"
import Cables from "../../assets/Categories/CABLES AND WIRES.png"
import ChildParts from "../../assets/Categories/CHILD PARTS.png"
import Filters from "../../assets/Categories/FILTERS.png"


const Category = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping based on aggregate name
  const iconMap = {
    "ACCESSORIES": Accessories,
    "BEARING": Bearing,
    "BATTERY": Battery,
    "BELTS AND TENSIONER": Belts,
    "BEALTS & TENSIONER": Belts,
    "BRAKE SYSTEM": BrakeSystem,
    "BODY PARTS": BodyParts,
    "CABLES": Cables,
    "CABLES AND WIRES": Cables,
    "CHILD PARTS": ChildParts,
    "CHILDPARTS": ChildParts,
    "FILTERS": Filters,
  };

  const getIconForCategory = (aggregateName) => {
    const upperName = aggregateName.toUpperCase();
    return iconMap[upperName] || NoImage;
  };

  useEffect(() => {
    // Check if categories are already cached in localStorage
    const cachedCategories = localStorage.getItem('categoryCache');
    const cacheTimestamp = localStorage.getItem('categoryCacheTimestamp');
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cachedCategories && cacheTimestamp) {
      const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;
      
      if (isCacheValid) {
        console.log('Loading categories from cache...');
        setCategories(JSON.parse(cachedCategories));
        setLoading(false);
        return;
      }
    }

    // If no valid cache, fetch from API
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching categories from API...");

      const response = await axios.post("http://localhost:5000/api/parts-list", {
        brandPriority: ["VALEO"],
        limit: 1000,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: "0046",
        partNumber: null,
        model: null,
        brand: null,
        subAggregate: null,
        aggregate: null,
        make: null,
        variant: null,
        fuelType: null,
        vehicle: null,
        year: null,
      });

      console.log("API Response:", response);
      console.log("Response data:", response.data);

      // Handle different response structures
      let partsData = [];
      if (Array.isArray(response.data)) {
        partsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        partsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.parts)) {
        partsData = response.data.parts;
      } else {
        console.error("Unexpected response structure:", response.data);
        throw new Error("Invalid response format");
      }

      console.log("Parts data:", partsData);

      // Extract unique aggregates from the response
      const uniqueAggregates = [...new Set(partsData.map(item => item.aggregate))];
      console.log("Unique aggregates:", uniqueAggregates);
      
      // Format categories with proper title case and icons
      const formattedCategories = uniqueAggregates
        .filter(aggregate => aggregate) // Remove null/undefined
        .map((aggregate, index) => ({
          id: index + 1,
          label: aggregate.charAt(0).toUpperCase() + aggregate.slice(1).toLowerCase(),
          aggregateName: aggregate,
          icon: getIconForCategory(aggregate),
        }));

      console.log("Formatted categories:", formattedCategories);
      
      // Cache the categories in localStorage
      localStorage.setItem('categoryCache', JSON.stringify(formattedCategories));
      localStorage.setItem('categoryCacheTimestamp', Date.now().toString());
      console.log('Categories cached successfully');
      
      setCategories(formattedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to load categories: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryClick = (category) => {
    console.log('Selected category:', category);
    // Navigate to Sub Category page with category data
    navigate('/sub_category', {
      state: {
        category: category.label,
        aggregateName: category.aggregateName,
      },
    });
  };

  const visibleCategories = expanded ? categories : categories.slice(0, 8);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Category</h3>
        <span className="see-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      {loading ? (
        <div className="grid-container">
          <p style={{ textAlign: "center", padding: "20px", gridColumn: "1 / -1" }}>
            Loading categories...
          </p>
        </div>
      ) : error ? (
        <div className="grid-container">
          <p style={{ textAlign: "center", padding: "20px", color: "red", gridColumn: "1 / -1" }}>
            {error}
          </p>
        </div>
      ) : (
        <div className="grid-container">
          {visibleCategories.map((cat) => (
            <div key={cat.id} className="cat-card" onClick={() => handleCategoryClick(cat)}>
              <div className="cat-img-box">
                <img src={cat.icon} alt={cat.label} className="cat-img" />
              </div>
              <p className="cat-label" title={cat.label}>{cat.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Category;
