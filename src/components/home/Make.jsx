import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiservice";
import OciImage from "../oci_image/ociImages.jsx";
import NoImage from "../../assets/No Image.png";
import "../../styles/home/Make.css";
import Maruti from "../../assets/Make/MARUTI SUZUKI.png";
import Tata from "../../assets/Make/TATA.png";
import Hyundai from "../../assets/Make/HYUNDAI.png";
import Mahindra from "../../assets/Make/MAHINDRA.png";
import Abarth from "../../assets/Make/ABARTH.png";
import Audi from "../../assets/Make/AUDI.png";
import Ford from "../../assets/Make/FORD.png";
import Bently from "../../assets/Make/BENTLEY.png";
import Bmw from "../../assets/Make/BMW.png";
import Jeep from "../../assets/Make/JEEP.png";

const Make = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Icon mapping for makes
  const makeIconMap = {
    "MARUTI SUZUKI": Maruti,
    "MARUTI": Maruti,
    "SUZUKI": Maruti,
    "TATA": Tata,
    "HYUNDAI": Hyundai,
    "MAHINDRA": Mahindra,
    "ABARTH": Abarth,
    "AUDI": Audi,
    "FORD": Ford,
    "BENTLEY": Bently,
    "BMW": Bmw,
    "JEEP": Jeep,
  };

  const getIconForMake = (makeName) => {
    const upperName = makeName.toUpperCase();
    return makeIconMap[upperName] || NoImage;
  };

  useEffect(() => {
    // Check if makes are already cached in localStorage
    const cachedMakes = localStorage.getItem('makeCache');
    const cacheTimestamp = localStorage.getItem('makeCacheTimestamp');
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    if (cachedMakes && cacheTimestamp) {
      const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;
      
      if (isCacheValid) {
        console.log('💾 Loading makes from cache...');
        setMakes(JSON.parse(cachedMakes));
        setLoading(false);
        return;
      }
    }

    // If no valid cache, fetch from API
    fetchMakes();
  }, []);

  const fetchMakes = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      console.log("Fetching makes from API...");

      const response = await apiService.post("/vehicle-list", {
        limit: 5000,
        offset: 0,
        sortOrder: "ASC",
        customerCode: "0046",
        brand: null,
        partNumber: null,
        aggregate: null,
        subAggregate: null,
        make: null, // Get all makes
        model: null,
        variant: null,
        fuelType: null,
        vehicle: null,
        year: null,
      });

      console.log("API Response:", response);

      // Response structure: { success: true, message: "...", count: 235485, data: [...] }
      // Since apiService.post() returns res.data, response IS the data object
      const vehicleData = Array.isArray(response?.data) ? response.data : [];

      console.log("Vehicle data count:", vehicleData.length);

      if (vehicleData.length === 0) {
        console.warn("No vehicle data received from API");
        setError("No makes available at the moment.");
        setLoading(false);
        return;
      }

      // Extract unique makes
      const uniqueMakes = [...new Set(
        vehicleData
          .map(item => item.make)
          .filter(make => make && make.trim() !== '') // Remove null/undefined/empty
      )].sort(); // Sort alphabetically

      console.log("Unique makes found:", uniqueMakes.length, uniqueMakes);

      if (uniqueMakes.length === 0) {
        console.warn("No makes found in vehicle data");
        setError("No makes available.");
        setLoading(false);
        return;
      }

      // Format makes with proper title case and icons
      const formattedMakes = uniqueMakes.map((make, index) => ({
        id: index + 1,
        name: make
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        makeName: make,
        icon: getIconForMake(make),
      }));

      console.log("Formatted makes:", formattedMakes);

      // Cache the makes
      localStorage.setItem('makeCache', JSON.stringify(formattedMakes));
      localStorage.setItem('makeCacheTimestamp', Date.now().toString());
      console.log('💾 Makes cached successfully');

      setMakes(formattedMakes);
    } catch (err) {
      console.error("Error fetching makes:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code
      });

      // Handle specific error types
      let errorMessage = "Failed to load makes. ";
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = "⏱️ Request timeout. The API is taking too long to respond. Please try again later.";
      } else if (err.response) {
        const status = err.response.status;
        const errorType = err.response.data?.error;
        
        if (status === 502) {
          errorMessage = "🔌 Bad Gateway (502). The external parts API is currently unavailable. Please try again in a few moments.";
        } else if (status === 503) {
          errorMessage = "⚠️ Service Unavailable (503). The parts API is temporarily down. Please try again later.";
        } else if (status === 504) {
          errorMessage = "⏱️ Gateway Timeout (504). The API request timed out. Please try again.";
        } else if (errorType === 'timeout') {
          errorMessage = "⏱️ API timeout. The external service is slow. Please try again in a moment.";
        } else if (status === 401) {
          errorMessage = "🔒 Authentication failed. Please contact support.";
        } else {
          errorMessage = `❌ Error ${status}: ${err.response.data?.message || err.message || "Unknown error"}`;
        }
      } else if (err.message.includes('Network Error')) {
        errorMessage = "🌐 Network error. Please check your internet connection or ensure the backend server is running.";
      } else {
        errorMessage = `❌ ${err.message || "An unexpected error occurred. Please try again."}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeClick = (make) => {
    console.log('Selected make:', make);
    navigate("/Model", {
      state: {
        make: make.name,
        makeName: make.makeName,
      },
    });
  };

  const visibleMakes = expanded ? makes : makes.slice(0, 8);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Make</h3>
        <span className="see-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      {loading ? (
        <div className="grid-container">
          <p style={{ textAlign: "center", padding: "20px", gridColumn: "1 / -1" }}>
            Loading makes...
          </p>
        </div>
      ) : error ? (
        <div className="grid-container" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}>
          <p style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </p>
          <button
            onClick={fetchMakes}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid-container">
          {visibleMakes.map((make) => (
            <div
              key={make.id}
              className="brand-card"
              onClick={() => handleMakeClick(make)}
            >
              <img src={make.icon} alt={make.name} className="brand-img" />
              <p className="brand-label" title={make.name}>
                {make.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Make;
