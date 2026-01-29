import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiservice";
import OciImage from "../oci_image/ociImages.jsx";
import NoImage from "../../assets/No Image.png";
import MakeSkeleton from "../skeletonLoading/MakeSkeleton";
import "../../styles/home/Make.css";

const Make = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const getIconForMake = (makeName) => {
    // No longer needed - will use OciImage component
    return makeName;
  };

  useEffect(() => {
    // Check if makes are already cached in localStorage
    const cachedMakes = localStorage.getItem("makeCache");
    const cacheTimestamp = localStorage.getItem("makeCacheTimestamp");
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    if (cachedMakes && cacheTimestamp) {
      const isCacheValid = Date.now() - parseInt(cacheTimestamp) < cacheExpiry;

      if (isCacheValid) {
        console.log("💾 Loading makes from cache...");
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

      console.log("✨ Fetching makes from masterType API...");

      const BATCH_SIZE = 500; // Larger batch for masterType API
      const MAX_BATCHES = 50; // Enough batches
      const uniqueMakes = new Set();
      let offset = 0; 
      let batchCount = 0;
      let consecutiveEmptyBatches = 0;
      let consecutiveErrors = 0;

      // Fetch in batches until we stop finding new makes
      while (batchCount < MAX_BATCHES && consecutiveErrors < 3) {
        console.log(`📦 Fetching batch ${batchCount + 1} (offset: ${offset})...`);

        try {
          const response = await apiService.post("/filter", {
            partNumber: null,
            sortOrder: "ASC",
            customerCode: "0046",
            aggregate: null,
            brand: null,
            fuelType: null,
            limit: BATCH_SIZE,
            make: null,
            masterType: "make", // Get all makes
            model: null,
            offset: offset,
            primary: false,
            subAggregate: null,
            variant: null,
            year: null,
          });

          console.log(`📥 Batch ${batchCount + 1} response:`, {
            success: response?.success,
            message: response?.message,
            count: response?.count,
            dataLength: response?.data?.length,
          });

          // Extract master data
          const masterData = Array.isArray(response?.data) ? response.data : [];

          // If no data returned, we've reached the end
          if (!masterData || masterData.length === 0) {
            console.log("✅ No more data in this batch");
            consecutiveEmptyBatches++;
            if (consecutiveEmptyBatches >= 3) break;
          } else {
            consecutiveEmptyBatches = 0;
            consecutiveErrors = 0; // Reset error counter on success
          }

          // Count makes before adding new ones
          const previousSize = uniqueMakes.size;

          // Extract makes from this batch using masterName field
          masterData.forEach((item) => {
            if (item.masterName && item.masterName.trim() !== "") {
              uniqueMakes.add(item.masterName.trim());
            }
          });

          const newMakesFound = uniqueMakes.size - previousSize;
          console.log(`📊 Found ${newMakesFound} new makes (total: ${uniqueMakes.size})`);

          // If no new makes found in last 3 batches, stop
          if (newMakesFound === 0 && batchCount > 2) {
            console.log("✅ No new makes found, stopping...");
            break;
          }
        } catch (batchError) {
          console.error(`❌ Error in batch ${batchCount + 1}:`, {
            message: batchError.message,
            status: batchError.response?.status,
            data: batchError.response?.data,
          });
          consecutiveErrors++;
          
          // If it's a timeout, stop immediately and use what we have
          if (batchError.code === "ECONNABORTED" || batchError.response?.status === 504 || batchError.response?.status === 500) {
            console.error("⏱️ Timeout/Server error - stopping batch fetch");
            if (uniqueMakes.size > 0) {
              console.log(`💡 Using ${uniqueMakes.size} makes found so far`);
              break; // Use what we have
            } else {
              console.error("⚠️ Failed on first batch");
              throw batchError;
            }
          }
          
          if (consecutiveErrors >= 3) {
            console.error("⚠️ Too many consecutive errors");
            throw batchError;
          }
        }

        offset += BATCH_SIZE;
        batchCount++;
      }

      console.log(`✅ Total unique makes found: ${uniqueMakes.size}`);

      if (uniqueMakes.size === 0) {
        setError("No makes available at the moment.");
        setLoading(false);
        return;
      }

      // Convert Set to sorted Array and format makes
      const makesArray = Array.from(uniqueMakes).sort();
      const formattedMakes = makesArray.map((make, index) => ({
        id: index + 1,
        name: make
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        makeName: make,
      }));

      console.log("✅ Formatted makes:", formattedMakes);

      // Cache the makes
      localStorage.setItem("makeCache", JSON.stringify(formattedMakes));
      localStorage.setItem("makeCacheTimestamp", Date.now().toString());
      console.log("💾 Makes cached successfully");

      setMakes(formattedMakes);
    } catch (err) {
      console.error("❌ Error fetching makes:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
      });

      // Handle specific error types
      let errorMessage = "Failed to load makes. ";

      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        errorMessage = "⏱️ Request timeout. The API is slow. Please try again later.";
      } else if (err.response?.status === 504) {
        errorMessage = "⏱️ Gateway timeout. The external API is taking too long. Please try again later.";
      } else if (
        err.response?.data?.message &&
        err.response.data.message.includes("Query execution was interrupted")
      ) {
        errorMessage = "Database timeout. Please try again in a few moments.";
      } else if (err.response) {
        const status = err.response.status;
        const errorType = err.response.data?.error;

        if (status === 502) {
          errorMessage =
            "🔌 Bad Gateway (502). The external parts API is currently unavailable. Please try again in a few moments.";
        } else if (status === 503) {
          errorMessage =
            "⚠️ Service Unavailable (503). The parts API is temporarily down. Please try again later.";
        } else if (status === 504) {
          errorMessage =
            "⏱️ Gateway Timeout (504). The API request timed out. Please try again.";
        } else if (errorType === "timeout") {
          errorMessage =
            "⏱️ API timeout. The external service is slow. Please try again in a moment.";
        } else if (status === 401) {
          errorMessage = "🔒 Authentication failed. Please contact support.";
        } else {
          errorMessage = `❌ Error ${status}: ${err.response.data?.message || err.message || "Unknown error"}`;
        }
      } else if (err.message.includes("Network Error")) {
        errorMessage =
          "🌐 Network error. Please check your internet connection or ensure the backend server is running.";
      } else {
        errorMessage = `❌ ${err.message || "An unexpected error occurred. Please try again."}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeClick = (make) => {
    console.log("Selected make:", make);
    navigate("/Model", {
      state: {
        make: make.name,
        makeName: make.makeName,
      },
    });
  };

  const visibleMakes = expanded ? makes : makes.slice(0, 9);

  return (
    <section className="section-container">
      <div className="section-header">
        <h3>Search by Make</h3>
        <span className="see-more" onClick={() => setExpanded(!expanded)}>
          {expanded ? "See Less" : "See More"}
        </span>
      </div>

      {loading ? (
        <MakeSkeleton count={9} />
      ) : error ? (
        <div
          className="grid-container"
          style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}
        >
          <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          <button
            onClick={fetchMakes}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
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
              <OciImage
                partNumber={make.makeName}
                folder="make"
                fallbackImage={NoImage}
                className="brand-img"
                alt={make.name}
              />
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
