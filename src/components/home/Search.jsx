import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { HiOutlineMicrophone } from "react-icons/hi";
import { AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiservice";
import SearchIcon from "../../assets/search/search.png";
import ImageUpload from "./ImageUpload";
import "../../styles/home/Search.css";

const Search = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [bannerUrl, setBannerUrl] = useState(""); // Only banner
  const [searchValue, setSearchValue] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Vehicle number validation
  const isVehicleNumber = (value) => /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(value);
  const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9]+$/i.test(value);
  const isServiceType = (value) => /^[A-Z\s]+$/i.test(value);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (searchKey) => {
    if (searchKey.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post("/search", {
        customerCode: "0046",
        searchKey: searchKey
      });

      console.log("Search API Response:", response);

      // Handle API response structure: { success, message, data: [...] }
      let data = [];
      if (response?.success && response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      console.log("Parsed suggestions:", data);

      if (data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Search suggestions error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    fetchSuggestions(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion, e) => {
    console.log('=== SUGGESTION CLICKED ===');
    console.log('Full suggestion object:', suggestion);
    
    // Priority: partNumber > searchValue > itemName
    const searchTerm = suggestion.partNumber || suggestion.searchValue || suggestion.itemName;
    console.log('Setting search value to:', searchTerm);
    
    // Set the value immediately
    setSearchValue(searchTerm);
    
    // Hide suggestions immediately
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Calculate dropdown position
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;

    // Hide suggestions when Enter is pressed
    setShowSuggestions(false);
    setSuggestions([]);

    const rawValue = searchValue.trim();
    if (!rawValue) return;
    const noSpaceValue = rawValue.replace(/\s+/g, "").toUpperCase();

    if (isVehicleNumber(noSpaceValue)) {
      navigate("/search-by-vehicle-number", { state: { vehicleNumber: noSpaceValue } });
    } else if (isPartNumber(noSpaceValue)) {
      navigate("/search-by-part-number", { state: { partNumber: noSpaceValue } });
    } else {
      navigate("/search-by-service-type", { state: { serviceType: rawValue.toLowerCase() } });
    }
  };

  // 📸 Image search
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    navigate("/search-by-image", {
      state: { imageFile: file, previewUrl: URL.createObjectURL(file) },
    });
  };

  const handleImageUploadSelect = (file) => {
    if (!file) return;

    navigate("/search-by-image", {
      state: { imageFile: file, previewUrl: URL.createObjectURL(file) },
    });
    setShowImageUpload(false);
  };

  // ===============================
  // Fetch only banner from backend
  // ===============================
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        if (assets?.data?.BANNER) {
          setBannerUrl(apiService.getAssetUrl(assets.data.BANNER));
        }
      } catch (err) {
        console.error("❌ Failed to load banner", err);
      }
    };

    fetchBanner();
  }, []);

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div
        className="search-banner-container"
        style={{
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="search-content">
          <h2 className="search-title">
            Looking for parts? Just enter your vehicle number to get started
          </h2>

          <div className="search-box-wrapper">
            <div className="search-box" ref={inputRef}>
              <img src={SearchIcon} className="search-s-icon" alt="search" />

              <input
                type="text"
                placeholder="Search in Garage"
                className="search-s-input"
                ref={searchInputRef}
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleSearch}
              />

              {loading && <div className="search-loader">...</div>}

              <HiOutlineMicrophone
                className="search-mic"
                onClick={() => alert("Voice search coming soon")}
              />

              <AiOutlineCamera
                className="search-upload"
                onClick={() => setShowImageUpload(true)}
              />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />
            </div>
          </div>
        </div>
      </div>

      {showImageUpload && (
        <ImageUpload
          onClose={() => setShowImageUpload(false)}
          onImageSelect={handleImageUploadSelect}
        />
      )}

      {showSuggestions && suggestions.length > 0 && ReactDOM.createPortal(
        <div 
          className="search-suggestions-portal"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 999999
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="search-suggestion-item"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion, e);
              }}
            >
              <div className="suggestion-part-number">
                {suggestion.partNumber || suggestion.searchValue}
              </div>
              {(suggestion.itemName || suggestion.aggregate || suggestion.subAggregate) && (
                <div className="suggestion-item-name">
                  {suggestion.itemName || 
                   (suggestion.aggregate && suggestion.subAggregate ? 
                    `${suggestion.aggregate} - ${suggestion.subAggregate}` : 
                    suggestion.aggregate || suggestion.subAggregate)}
                </div>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Search;
