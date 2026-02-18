import { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { HiOutlineMicrophone } from "react-icons/hi";
import { AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { labourAPI, partsmartTextSearchAPI, partsmartSuggestionsAPI, partsmartImageSearchAPI } from "../../services/api";
import { getAssets, getAsset } from "../../utils/assets";
import { useVehicleContext } from "../../contexts/VehicleContext";
import SearchIcon from "../../assets/search/search.png";
import ImageUpload from "./ImageUpload";
import VehicleContextModal from "./VehicleContextModal";
import ImageSearchModal from "./ImageSearchModal";
import "../../styles/home/Search.css";
import "../../styles/skeleton/skeleton.css";

const Search = () => {
  const navigate = useNavigate();
  const { vehicle, missingFields, updateMultipleFields, resetVehicle, isComplete } = useVehicleContext();
  const [assets, setAssets] = useState({});
  const fileInputRef = useRef(null);
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  // Initialize Web Speech API for voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎤 Voice transcribed:", transcript);
        setSearchValue(transcript);
        setIsRecording(false);
        
        // Auto-trigger suggestions for the transcribed text
        fetchSuggestions(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error !== 'no-speech') {
          alert(`Voice recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  const [searchValue, setSearchValue] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [vehicleModal, setVehicleModal] = useState({
    isOpen: false,
    searchQuery: "",
    missingFields: [],
    extractedFields: {},
  });
  
  const [imageSearchModal, setImageSearchModal] = useState({
    isOpen: false,
    imageFile: null,
    imagePreview: null,
    detectedPart: "",
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close suggestions when vehicle modal opens
  useEffect(() => {
    if (vehicleModal.isOpen) {
      setShowSuggestions(false);
    }
  }, [vehicleModal.isOpen]);

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
      setSuggestionsLoading(true);
      
      // Fetch both Partsmart suggestions and labour search
      const [partsmartResponse, labourResponse] = await Promise.allSettled([
        // Partsmart Unified Search - Autocomplete suggestions
        partsmartSuggestionsAPI(searchKey.trim(), 5),
        // Labour search - Use labourAPI
        labourAPI()
      ]);

      console.log("Partsmart Suggestions Response:", partsmartResponse);
      console.log("Labour API Response:", labourResponse);

      let allSuggestions = [];

      // Process Partsmart suggestions
      if (partsmartResponse.status === 'fulfilled' && partsmartResponse.value) {
        const response = partsmartResponse.value;
        
        // Partsmart suggestions response format: { success: true, data: { suggestions: [...] } }
        if (response?.success && response?.data?.suggestions && Array.isArray(response.data.suggestions)) {
          const partsmartSuggestions = response.data.suggestions.map(suggestion => ({
            partNumber: suggestion.part_number || suggestion.text || suggestion,
            itemName: suggestion.description || suggestion.text || suggestion,
            searchValue: suggestion.text || suggestion,
            source: 'partsmart',
            type: 'part'
          }));
          allSuggestions.push(...partsmartSuggestions);
        }
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
      setSuggestionsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSelectedSuggestionIndex(-1);
    fetchSuggestions(value);
  };

  // Handle suggestion click - ONLY fill input, don't navigate
  const handleSuggestionClick = (suggestion) => {
    console.log("=== SUGGESTION CLICKED ===");
    console.log("Full suggestion object:", suggestion);

    // Determine the value to fill
    const typedValue = searchValue.trim().replace(/\s+/g, "");
    const isTypedPartNumber = /^(?=.*\d)[A-Z0-9\-]+$/i.test(typedValue);
    
    const fillValue = isTypedPartNumber
      ? suggestion.partNumber || suggestion.searchValue || suggestion.itemName
      : suggestion.itemName || suggestion.partNumber || suggestion.searchValue;

    console.log("Filling input with:", fillValue);

    // Set the value in input
    setSearchValue(fillValue);

    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);
    
    // Focus back on input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
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
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Autocomplete with first suggestion or selected suggestion
      const suggestionToUse = selectedSuggestionIndex >= 0 
        ? suggestions[selectedSuggestionIndex] 
        : suggestions[0];
      
      if (suggestionToUse) {
        const typedValue = searchValue.trim().replace(/\s+/g, "");
        const isTypedPartNumber = /^(?=.*\d)[A-Z0-9\-]+$/i.test(typedValue);
        
        const fillValue = isTypedPartNumber
          ? suggestionToUse.partNumber || suggestionToUse.searchValue || suggestionToUse.itemName
          : suggestionToUse.itemName || suggestionToUse.partNumber || suggestionToUse.searchValue;
        
        setSearchValue(fillValue);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSearch = async (e) => {
    if (e.key !== "Enter") return;

    // Hide suggestions when Enter is pressed
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSuggestionIndex(-1);

    const rawValue = searchValue.trim();
    if (!rawValue) return;
    
    // Reset vehicle context for new search
    resetVehicle();
    
    // All searches now use Unified Search API
    console.log("🔍 Unified Search for:", rawValue);
    
    try {
      setLoading(true);
      const partsmartResult = await partsmartTextSearchAPI({
        query: rawValue,
        sources: ['tvs'],
        limit: 10
      });
      
      console.log("✅ Unified Search result:", partsmartResult);
      
      // Check for incomplete extraction
      if (partsmartResult?.summary?.status === 'incomplete_extraction') {
        // Extract fields from Partsmart response
        const extractedFields = partsmartResult.summary.extracted_fields || {};
        
        // Update VehicleContext with extracted fields
        updateMultipleFields(extractedFields);
        
        setVehicleModal({
          isOpen: true,
          searchQuery: rawValue,
          missingFields: partsmartResult.summary.missing_fields || [],
          extractedFields: extractedFields,
        });
        return;
      }
      
      // Navigate to results page with Unified Search results
      navigate("/search-by-part-number", {
        state: { 
          partNumber: rawValue,
          partsmartResults: partsmartResult
        },
      });
    } catch (error) {
      console.error("❌ Unified Search error:", error);
      // Navigate without results on error
      navigate("/search-by-part-number", {
        state: { partNumber: rawValue },
      });
    } finally {
      setLoading(false);
    }
  };

  // 📸 Image search - Updated to use modal
  const handleImageUploadSelect = async (file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setShowImageUpload(false);
    
    // Show loading state
    setLoading(true);
    
    try {
      console.log("🖼️ Analyzing uploaded image...");
      
      // Call Partsmart Image Search API to detect part
      const result = await partsmartImageSearchAPI({
        image: file,
        limit: 5
      });
      
      console.log("✅ Image analysis result:", result);
      
      // Extract detected part from AI analysis
      const detectedPart = result?.data?.ai_analysis?.detected_part || 
                          result?.summary?.detected_part || 
                          "Unknown Part";
      
      console.log("🎯 Detected part:", detectedPart);
      
      // Open the image search modal with detected part
      setImageSearchModal({
        isOpen: true,
        imageFile: file,
        imagePreview: previewUrl,
        detectedPart: detectedPart
      });
      
    } catch (error) {
      console.error("❌ Error analyzing image:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🎤 Voice search handler
  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        setIsRecording(true);
        recognitionRef.current.start();
        console.log("🎤 Voice recording started...");
      } catch (error) {
        console.error("❌ Error starting voice recognition:", error);
        setIsRecording(false);
        alert("Failed to start voice recording. Please try again.");
      }
    }
  };
  
  const handleImageSearchComplete = async (searchData) => {
    console.log("🔍 Image search complete:", searchData);
    
    // Close the modal
    setImageSearchModal(prev => ({ ...prev, isOpen: false }));
    
    setLoading(true);
    
    try {
      // Use multipart NLP extraction with detected part + vehicle context
      console.log("📡 Calling multipart API with NLP extraction...");
      console.log("🎯 Detected part:", searchData.detectedPart);
      console.log("🚗 Vehicle context:", searchData.vehicle);
      
      // Build query in format: MAKE MODEL VARIANT FUELTYPE YEAR PARTNAME
      // This matches the other application's format for better results
      const queryParts = [
        searchData.vehicle.make,
        searchData.vehicle.model,
        searchData.vehicle.variant,
        searchData.vehicle.fuelType,
        searchData.vehicle.year,
        searchData.detectedPart
      ].filter(Boolean); // Remove null/undefined values
      
      const nlpQuery = queryParts.join(' ').toUpperCase();
      
      console.log("💬 NLP Query:", nlpQuery);
      
      const { partsmartMultipartSearchAPI } = await import("../../services/api");
      
      let multipartResult = await partsmartMultipartSearchAPI({
        query: nlpQuery,
        vehicle: {
          make: searchData.vehicle.make,
          model: searchData.vehicle.model,
          variant: searchData.vehicle.variant,
          fuelType: searchData.vehicle.fuelType,
          year: searchData.vehicle.year ? Number(searchData.vehicle.year) : undefined
        },
        sources: ['tvs', 'boodmo','smart'],
        limit: 10 // Use higher limit for better results
      });
      
      console.log("✅ Multipart search result:", multipartResult);
      
      // Check if there's a validation error - retry WITHOUT vehicle object (NLP only)
      if (!multipartResult?.success && multipartResult?.error?.code === 'VALIDATION_ERROR') {
        console.warn("⚠️ Validation error detected:", multipartResult.error);
        console.log("🔄 Retrying search with NLP query only (no vehicle object)");
        
        // Retry with just the query - let NLP extract vehicle info
        multipartResult = await partsmartMultipartSearchAPI({
          query: nlpQuery,
          sources: ['tvs', 'boodmo','smart'],
          limit: 10
        });
        
        console.log("✅ Retry search result (NLP only):", multipartResult);
      }
      
      // Navigate to search results page with multipart results
      navigate("/search-by-image", {
        state: {
          imageFile: searchData.imageFile,
          previewUrl: searchData.imageFile ? URL.createObjectURL(searchData.imageFile) : null,
          detectedPart: searchData.detectedPart,
          vehicle: searchData.vehicle,
          multipartResults: multipartResult
        }
      });
    } catch (error) {
      console.error("❌ Multipart search error:", error);
      
      // Fallback: Navigate with basic data if multipart fails
      navigate("/search-by-image", {
        state: {
          imageFile: searchData.imageFile,
          previewUrl: searchData.imageFile ? URL.createObjectURL(searchData.imageFile) : null,
          detectedPart: searchData.detectedPart,
          vehicle: searchData.vehicle
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Detect if current search is a part number search
  const isPartNumberSearch = /^(?=.*\d)[A-Z0-9\-]+$/i.test(
    searchValue.trim().replace(/\s+/g, "")
  );

  const handleVehicleModalComplete = (results, vehicleContextFromModal) => {
    console.log("Vehicle modal search complete:", results);
    console.log("Vehicle context from modal:", vehicleContextFromModal);
    
    // Close the modal
    setVehicleModal(prev => ({ ...prev, isOpen: false }));
    
    // Extract ONLY the part name from results (not the full search query)
    // The modal already searched with just the part name, so use that
    const partName = results?.summary?.extracted_fields?.part || 
                     results?.summary?.extracted_fields?.aggregate || 
                     vehicleModal.extractedFields?.part ||
                     vehicleModal.extractedFields?.aggregate ||
                     vehicle.aggregate ||
                     vehicleModal.searchQuery;
    
    console.log("🔍 Extracted part name:", partName);
    
    // Use the vehicle context from modal (which has the complete, corrected values including year)
    // This is more reliable than trying to reconstruct from results or vehicle context
    const vehicleDetails = vehicleContextFromModal || {
      make: vehicle.make || results?.summary?.extracted_fields?.make,
      model: vehicle.model || results?.summary?.extracted_fields?.model,
      variant: vehicle.variant || results?.summary?.extracted_fields?.variant,
      fuelType: vehicle.fuelType || results?.summary?.extracted_fields?.fuelType,
      year: vehicle.year || results?.summary?.extracted_fields?.year,
    };
    
    console.log("📡 Navigating to PartNumber with:", {
      partNumber: partName,
      vehicle: vehicleDetails,
      searchQuery: vehicleModal.searchQuery
    });
    
    // Navigate to part number page with complete context
    navigate("/search-by-part-number", {
      state: {
        partNumber: partName,  // Use ONLY the part name, not the full search query
        searchQuery: vehicleModal.searchQuery,  // Keep original for display
        vehicle: vehicleDetails,
        partsmartResults: results
      }
    });
  };

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
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  handleSearch(e);
                }}
              />

              {(suggestionsLoading || loading) && (
                <div className="search-input-loading-spinner">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}

              <HiOutlineMicrophone
                className={`search-mic ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceSearch}
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
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleImageUploadSelect(file);
                }}
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

      <VehicleContextModal
        isOpen={vehicleModal.isOpen}
        onClose={() => setVehicleModal(prev => ({ ...prev, isOpen: false }))}
        searchQuery={vehicleModal.searchQuery}
        missingFields={vehicleModal.missingFields}
        extractedFields={vehicleModal.extractedFields}
        onSearchComplete={handleVehicleModalComplete}
      />

      <ImageSearchModal
        isOpen={imageSearchModal.isOpen}
        onClose={() => setImageSearchModal(prev => ({ ...prev, isOpen: false }))}
        imageFile={imageSearchModal.imageFile}
        imagePreview={imageSearchModal.imagePreview}
        detectedPart={imageSearchModal.detectedPart}
        onSearchComplete={handleImageSearchComplete}
      />

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
                className={`search-suggestion-item ${suggestion.type === 'labour' ? 'labour-suggestion' : 'part-suggestion'} ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                data-source={suggestion.source || ''}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
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
                      {/* {suggestion.source === 'partsmart' && (
                        <span className="suggestion-source-badge partsmart">
                          Partsmart
                        </span>
                      )} */}
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
