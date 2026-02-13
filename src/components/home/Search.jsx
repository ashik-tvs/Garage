import { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { HiOutlineMicrophone } from "react-icons/hi";
import { AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { generalSearchAPI, labourAPI } from "../../services/api";
import { getAssets, getAsset } from "../../utils/assets";
import SearchIcon from "../../assets/search/search.png";
import ImageUpload from "./ImageUpload";
import "../../styles/home/Search.css";
import "../../styles/skeleton/skeleton.css";

const Search = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState({});
  const fileInputRef = useRef(null);
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);
  const [searchValue, setSearchValue] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Vehicle number validation
  const isVehicleNumber = (value) =>
    /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(value);
  // Part number: alphanumeric with optional hyphens, must contain at least one digit
  const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9\-]+$/i.test(value);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (searchKey) => {
    if (searchKey.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch both parts and labour search using centralized API functions
      const [partsResponse, labourResponse] = await Promise.allSettled([
        // Parts search - Use generalSearchAPI with correct request body
        generalSearchAPI({
          customerCode: "0046",
          searchKey: searchKey.trim()
        }),
        // Labour search - Use labourAPI with correct request body
        labourAPI()
      ]);

      console.log("Parts API Response:", partsResponse);
      console.log("Labour API Response:", labourResponse);

      let allSuggestions = [];

      // Process parts suggestions
      if (partsResponse.status === 'fulfilled' && partsResponse.value) {
        const response = partsResponse.value;
        let partsData = [];
        if (response?.success && response?.data && Array.isArray(response.data)) {
          partsData = response.data;
        } else if (response?.data && Array.isArray(response.data)) {
          partsData = response.data;
        } else if (Array.isArray(response)) {
          partsData = response;
        }

        // Mark parts suggestions
        const partsSuggestions = partsData.map(item => ({
          ...item,
          type: 'part'
        }));
        allSuggestions.push(...partsSuggestions);
      }

      // Process labour suggestions
      if (labourResponse.status === 'fulfilled' && labourResponse.value) {
        const labourData = labourResponse.value;
        
        if (labourData?.requestSuccessful && labourData?.labourSubcategory) {
          const searchLower = searchKey.toLowerCase();
          const labourSuggestions = [];

          // Search through all labour subcategories
          Object.entries(labourData.labourSubcategory).forEach(([categoryId, subcategoryArray]) => {
            if (Array.isArray(subcategoryArray)) {
              subcategoryArray.forEach((item) => {
                const itemKeys = Object.keys(item);
                if (itemKeys.length > 0) {
                  const subcategoryData = item[itemKeys[0]];
                  
                  if (subcategoryData?.LabourSubcategoryName) {
                    const serviceName = subcategoryData.LabourSubcategoryName.trim();
                    
                    // Check if service name matches search query
                    if (serviceName.toLowerCase().includes(searchLower)) {
                      labourSuggestions.push({
                        id: itemKeys[0],
                        partNumber: serviceName,
                        itemName: serviceName,
                        searchValue: serviceName,
                        categoryId: categoryId,
                        type: 'labour'
                      });
                    }
                  }
                }
              });
            }
          });

          // Limit labour suggestions to avoid overwhelming the dropdown
          allSuggestions.push(...labourSuggestions.slice(0, 5));
        }
      }

      console.log("All suggestions:", allSuggestions);

      if (allSuggestions.length > 0) {
        setSuggestions(allSuggestions);
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
  const handleSuggestionClick = (suggestion) => {
    console.log("=== SUGGESTION CLICKED ===");
    console.log("Full suggestion object:", suggestion);

    // Check if this is a labour service suggestion
    if (suggestion.type === 'labour') {
      console.log("Labour service selected:", suggestion.itemName);
      
      // Set the search value
      setSearchValue(suggestion.itemName);
      
      // Hide suggestions
      setShowSuggestions(false);
      setSuggestions([]);
      
      // Navigate to service type page
      navigate("/search-by-service-type", { 
        state: { 
          serviceType: suggestion.itemName,
          categoryId: suggestion.categoryId
        } 
      });
      return;
    }

    // Handle parts suggestions (existing logic)
    // Determine if the typed search value looks like a part number
    const typedValue = searchValue.trim().replace(/\s+/g, "");
    const isTypedPartNumber = /^(?=.*\d)[A-Z0-9\-]+$/i.test(typedValue);
    
    // Use partNumber if search looks like part number, otherwise use itemName
    const searchTerm = isTypedPartNumber
      ? suggestion.partNumber || suggestion.searchValue || suggestion.itemName
      : suggestion.itemName || suggestion.partNumber || suggestion.searchValue;

    console.log("Setting search value to:", searchTerm);

    // Set the value immediately
    setSearchValue(searchTerm);

    // Hide suggestions immediately
    setShowSuggestions(false);
    setSuggestions([]);

    // Navigate to PartNumber page with the search term
    navigate("/search-by-part-number", { state: { partNumber: searchTerm } });
  };

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    updateDropdownPosition();
  }, [showSuggestions]);

  // Update position on scroll
  useEffect(() => {
    if (showSuggestions) {
      const handleScroll = () => {
        updateDropdownPosition();
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
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
    
    // For vehicle numbers, remove spaces. For part numbers, keep hyphens
    const noSpaceValue = rawValue.replace(/\s+/g, "");

    if (isVehicleNumber(noSpaceValue.toUpperCase())) {
      navigate("/search-by-vehicle-number", {
        state: { vehicleNumber: noSpaceValue.toUpperCase() },
      });
    } else if (isPartNumber(noSpaceValue)) {
      // Keep original case and hyphens for part numbers like 8502KPA1MFSU-TR0118
      navigate("/search-by-part-number", {
        state: { partNumber: noSpaceValue },
      });
    } else {
      // Check if the search term might be a service type
      // If it contains service-related keywords, try service type search first
      const serviceKeywords = ['r&r', 'repair', 'replace', 'service', 'maintenance', 'belt', 'gas', 'blower', 'compressor', 'filter', 'brake', 'door', 'glass', 'seat', 'engine', 'oil'];
      const isLikelyService = serviceKeywords.some(keyword => 
        rawValue.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isLikelyService) {
        // Try service type search first
        navigate("/search-by-service-type", { 
          state: { 
            serviceType: rawValue,
            searchQuery: rawValue
          } 
        });
      } else {
        // Item name search - navigate to PartNumber page with item name
        navigate("/search-by-part-number", { state: { partNumber: rawValue } });
      }
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

  // Detect if current search is a part number search
  const isPartNumberSearch = /^(?=.*\d)[A-Z0-9\-]+$/i.test(
    searchValue.trim().replace(/\s+/g, "")
  );

  return (
    <div className="search-wrapper" ref={searchRef}>
      <div
        className="search-banner-container"
        style={{
          backgroundImage: `url(${getAsset('BANNER', assets)})`,
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

              {loading && (
                <div className="skeleton-list" style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  zIndex: 1000,
                  padding: '8px'
                }}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="skeleton-card" style={{ 
                      padding: '8px',
                      marginBottom: '4px'
                    }}>
                      <div className="skeleton skeleton-text medium"></div>
                    </div>
                  ))}
                </div>
              )}

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

      {showSuggestions &&
        suggestions.length > 0 &&
        ReactDOM.createPortal(
          <div
            className="search-suggestions-portal"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`search-suggestion-item ${suggestion.type === 'labour' ? 'labour-suggestion' : 'part-suggestion'}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
              >
                {suggestion.type === 'labour' ? (
                  // Labour service suggestion
                  <div className="suggestion-labour-service">
                    <div className="suggestion-service-name">
                      🔧 {suggestion.itemName}
                    </div>
                    <div className="suggestion-service-type">
                      Service Type
                    </div>
                  </div>
                ) : (
                  // Parts suggestion (existing layout)
                  <>
                    <div className="suggestion-part-number">
                      {suggestion.partNumber || suggestion.searchValue}
                    </div>
                    {!isPartNumberSearch && (
                      <div className="suggestion-item-name">
                        {suggestion.itemName ||
                          (suggestion.aggregate && suggestion.subAggregate
                            ? `${suggestion.aggregate} - ${suggestion.subAggregate}`
                            : suggestion.aggregate || suggestion.subAggregate)}
                      </div>
                    )}
                  </>
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
