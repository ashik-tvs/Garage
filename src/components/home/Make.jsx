import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

      console.log("Fetching makes from API...");

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Please login to view makes");
      }

      const response = await axios.post(
        "http://localhost:5000/api/catalog/vehicle-list",
        {
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 90000,
        }
      );

      console.log("API Response:", response.data);

      // Handle different response structures
      let vehicleData = [];
      if (Array.isArray(response.data)) {
        vehicleData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        vehicleData = response.data.data;
      } else if (response.data && Array.isArray(response.data.vehicles)) {
        vehicleData = response.data.vehicles;
      }

      console.log("Vehicle data:", vehicleData);

      // Extract unique makes
      const uniqueMakes = [...new Set(
        vehicleData
          .map(item => item.make)
          .filter(make => make) // Remove null/undefined/empty
      )];

      console.log("Unique makes:", uniqueMakes);

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
        status: err.response?.status
      });

      // Handle authentication errors
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("Request timeout. The external API is slow or unreachable. Please try again later.");
      } else if (err.response?.data?.error?.includes('timeout')) {
        setError("External API timeout. Please try again in a moment.");
      } else {
        setError(`Failed to load makes: ${err.message || "Please try again."}`);
      }
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
