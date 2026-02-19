import React, { useState, useEffect } from 'react';
import { useVehicleContext } from '../../contexts/VehicleContext';
import apiService from '../../services/apiservice';
import '../../styles/home/ImageSearchModal.css';

// Icon components
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2"/>
    <path d="M11 11L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10L5 4H15L17 10M3 10V16H5V14H15V16H17V10M3 10H17M6 14C5.44772 14 5 13.5523 5 13C5 12.4477 5.44772 12 6 12C6.55228 12 7 12.4477 7 13C7 13.5523 6.55228 14 6 14ZM14 14C13.4477 14 13 13.5523 13 13C13 12.4477 13.4477 12 14 12C14.5523 12 15 12.4477 15 13C15 13.5523 14.5523 14 14 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 14L6 10L10 14L14 10L18 14V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M7.5 7.5C7.5 5.84315 8.84315 4.5 10.5 4.5C12.1569 4.5 13.5 5.84315 13.5 7.5C13.5 9.15685 12.1569 10.5 10.5 10.5V12M10.5 15H10.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ImageSearchModal = ({ 
  isOpen, 
  onClose, 
  imageFile, 
  imagePreview,
  detectedPart,
  onSearchComplete 
}) => {
  const { vehicle, updateField, resetVehicle } = useVehicleContext();
  
  const [loading, setLoading] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleFound, setVehicleFound] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({
    makes: [],
    models: [],
    variants: [],
    fuelTypes: [],
    years: [],
  });
  
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    makes: false,
    models: false,
    variants: false,
    fuelTypes: false,
    years: false,
  });

  // Fetch makes on modal open
  useEffect(() => {
    if (isOpen) {
      fetchMakes();
    }
  }, [isOpen]);

  const fetchMakes = async () => {
    setLoadingDropdowns(prev => ({ ...prev, makes: true }));
    try {
      const response = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        limit: 50
      });
      
      console.log("📡 Makes response:", response);
      
      // Partsmart returns: { success: true, data: { makes: [...] } }
      if (response?.data?.data?.makes) {
        setDropdownOptions(prev => ({
          ...prev,
          makes: response.data.data.makes
        }));
      } else if (response?.data?.makes) {
        // Fallback if data is at root level
        setDropdownOptions(prev => ({
          ...prev,
          makes: response.data.makes
        }));
      }
    } catch (error) {
      console.error("Error fetching makes:", error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, makes: false }));
    }
  };

  const fetchModels = async (make) => {
    setLoadingDropdowns(prev => ({ ...prev, models: true }));
    try {
      const response = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        vehicle: { make },
        limit: 50
      });
      
      console.log("📡 Models response:", response);
      
      // Partsmart returns: { success: true, data: { models: [...] } }
      if (response?.data?.data?.models) {
        setDropdownOptions(prev => ({
          ...prev,
          models: response.data.data.models,
          variants: [],
          fuelTypes: [],
          years: []
        }));
      } else if (response?.data?.models) {
        // Fallback if data is at root level
        setDropdownOptions(prev => ({
          ...prev,
          models: response.data.models,
          variants: [],
          fuelTypes: [],
          years: []
        }));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, models: false }));
    }
  };

  const fetchVariantsAndDetails = async (make, model) => {
    setLoadingDropdowns(prev => ({ 
      ...prev, 
      variants: true, 
      fuelTypes: true, 
      years: true 
    }));
    
    try {
      const response = await apiService.post('/partsmart/search', {
        search_type: "lookup",
        lookup_type: "vehicle",
        vehicle: { make, model },
        limit: 50
      });
      
      console.log("📡 Variants/Details response:", response);
      
      // Try different response structures
      const apiData = response?.data?.data || response?.data;
      
      if (apiData) {
        setDropdownOptions(prev => ({
          ...prev,
          variants: apiData.variants || [],
          fuelTypes: apiData.fuel_types || apiData.fuelTypes || [],
          years: apiData.years?.map(y => y.toString()) || []
        }));
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
    } finally {
      setLoadingDropdowns(prev => ({ 
        ...prev, 
        variants: false, 
        fuelTypes: false, 
        years: false 
      }));
    }
  };

  const handleFieldChange = (field, value) => {
    updateField(field, value);
    
    if (field === 'make' && value) {
      fetchModels(value);
      updateField('model', null);
      updateField('variant', null);
      updateField('fuelType', null);
      updateField('year', null);
    } else if (field === 'model' && value && vehicle.make) {
      fetchVariantsAndDetails(vehicle.make, value);
      updateField('variant', null);
      updateField('fuelType', null);
      updateField('year', null);
    }
  };

  const handleVehicleNumberLookup = async () => {
    if (!vehicleNumber || vehicleNumber.length < 6) {
      alert("Please enter a valid vehicle number");
      return;
    }

    setLoading(true);
    setVehicleFound(null);

    try {
      console.log("🔍 Looking up vehicle number:", vehicleNumber);

      // Build query: include part name + vehicle number
      const partName = detectedPart || "parts";
      const lookupQuery = `${partName} for ${vehicleNumber}`;

      const requestBody = {
        search_type: "text",
        query: lookupQuery,
        sources: ["tvs","boodmo","smart"],
        limit: 1
      };

      console.log("📡 Vehicle lookup request:", requestBody);

      const response = await apiService.post('/partsmart/search', requestBody);
      console.log("📥 Vehicle number lookup response:", response);

      console.log("🔍 Summary:", response?.summary);
      console.log("🔍 Vehicle Context:", response?.summary?.vehicle_context);

      // Check if vehicle_context exists in summary
      if (response && response.summary && response.summary.vehicle_context) {
        const vehicleData = response.summary.vehicle_context;
        console.log("✅ Vehicle found:", vehicleData);

        // Build display message
        const displayParts = [
          vehicleData.make,
          vehicleData.model,
          vehicleData.variant,
          vehicleData.fuelType,
          vehicleData.year
        ].filter(Boolean);
        
        setVehicleFound(displayParts.join(' | '));

        // Auto-fill all fields
        if (vehicleData.make) {
          updateField('make', vehicleData.make);
          await fetchModels(vehicleData.make);
        }
        if (vehicleData.model && vehicleData.make) {
          updateField('model', vehicleData.model);
          await fetchVariantsAndDetails(vehicleData.make, vehicleData.model);
        }
        if (vehicleData.variant) {
          updateField('variant', vehicleData.variant);
        }
        if (vehicleData.fuelType) {
          updateField('fuelType', vehicleData.fuelType);
        }
        if (vehicleData.year) {
          updateField('year', vehicleData.year.toString());
        }
      } else {
        alert("Vehicle not found. Please enter details manually.");
      }
    } catch (error) {
      console.error("❌ Error looking up vehicle number:", error);
      alert("Failed to lookup vehicle number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSearch = () => {
    if (!vehicle.make || !vehicle.model) {
      alert("Please select at least Make and Model");
      return;
    }
    
    // Pass data back to parent
    if (onSearchComplete) {
      onSearchComplete({
        imageFile,
        detectedPart,
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          variant: vehicle.variant,
          fuelType: vehicle.fuelType,
          year: vehicle.year
        }
      });
    }
  };

  const handleClose = () => {
    resetVehicle();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="image-search-modal-overlay">
      <div className="image-search-modal">
        {/* Header */}
        <div className="image-search-modal-header">
          <div className="image-search-modal-header-icon">
            <InfoIcon />
          </div>
          <div className="image-search-modal-header-text">
            <h3>Additional Information Required</h3>
            <p>Please provide the missing vehicle details</p>
          </div>
          <button className="image-search-modal-close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search Query */}
        <div className="image-search-modal-query">
          <label>
            <SearchIcon />
            <span>Search Query</span>
          </label>
          <input 
            type="text" 
            value={detectedPart || ""} 
            readOnly 
            className="image-search-modal-query-input"
          />
        </div>

        {/* Two Column Layout */}
        <div className="image-search-modal-content">
          {/* Left: Part Information */}
          <div className="image-search-modal-section">
            <div className="image-search-modal-section-header">
              <span className="image-search-modal-section-icon">
                <CheckIcon />
              </span>
              <h4>Part Information</h4>
            </div>
            <p className="image-search-modal-section-subtitle">
              Please provide part name, part number, or upload a part image
            </p>

            <div className="image-search-modal-part-name">
              <label>Part Name <span className="image-search-modal-part-count">(Select up to 5 parts)</span></label>
              <div className="image-search-modal-part-tag">
                {detectedPart || "BRAKE PAD SET"}
              </div>
              <p className="image-search-modal-part-selected">
                <CheckIcon />
                <span>1 part(s) selected (see details under each image below)</span>
              </p>
            </div>

            <div className="image-search-modal-divider">
              <span>OR</span>
            </div>

            <div className="image-search-modal-upload">
              <label>
                <ImageIcon />
                <span>Upload Part Image <span className="image-search-modal-upload-count">(up to 5 images)</span></span>
              </label>
              <div className="image-search-modal-image-preview">
                <img src={imagePreview} alt="Uploaded part" />
                <div className="image-search-modal-image-label">
                  <span className="image-search-modal-image-badge">1</span>
                  <span className="image-search-modal-image-name">{detectedPart || "BRAKE PAD SET"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Vehicle Details */}
          <div className="image-search-modal-section">
            <div className="image-search-modal-section-header">
              <span className="image-search-modal-section-icon vehicle-icon">
                <CarIcon />
              </span>
              <h4>Vehicle Details</h4>
            </div>
            <p className="image-search-modal-section-subtitle">
              Please provide vehicle details by entering vehicle number or selecting from dropdowns
            </p>

            {/* Vehicle Number Input */}
            <div className="image-search-modal-field">
              <label>
                <CarIcon />
                <span>Vehicle Number (Auto-fills all details)</span>
              </label>
              <div className="vehicle-number-input-wrapper">
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="TN01AZ2345"
                  maxLength={10}
                  className="image-search-modal-select vehicle-number-input"
                />
                <button 
                  onClick={handleVehicleNumberLookup}
                  disabled={loading || !vehicleNumber}
                  className="image-search-modal-lookup-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Looking up...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon />
                      <span>Lookup</span>
                    </>
                  )}
                </button>
              </div>
              {vehicleFound && (
                <div className="vehicle-found-message">
                  <CheckIcon />
                  <span>Vehicle Found: {vehicleFound}</span>
                </div>
              )}
            </div>

            <div className="image-search-modal-divider">
              <span>OR</span>
            </div>

            {/* Make */}
            <div className="image-search-modal-field">
              <label>Make <span className="image-search-modal-required">*</span></label>
              <select
                value={vehicle.make || ""}
                onChange={(e) => handleFieldChange('make', e.target.value)}
                disabled={loadingDropdowns.makes}
                className="image-search-modal-select"
              >
                <option value="">Select Make</option>
                {dropdownOptions.makes.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="image-search-modal-field">
              <label>Model <span className="image-search-modal-required">*</span></label>
              <select
                value={vehicle.model || ""}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                disabled={!vehicle.make || loadingDropdowns.models}
                className="image-search-modal-select"
              >
                <option value="">Select Model (choose Make first)</option>
                {dropdownOptions.models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Variant */}
            <div className="image-search-modal-field">
              <label>Variant <span className="image-search-modal-required">*</span></label>
              <select
                value={vehicle.variant || ""}
                onChange={(e) => handleFieldChange('variant', e.target.value)}
                disabled={!vehicle.model || loadingDropdowns.variants}
                className="image-search-modal-select"
              >
                <option value="">Select Variant (choose Model first)</option>
                {dropdownOptions.variants.map((variant) => (
                  <option key={variant} value={variant}>{variant}</option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div className="image-search-modal-field">
              <label>Fuel Type <span className="image-search-modal-required">*</span></label>
              <select
                value={vehicle.fuelType || ""}
                onChange={(e) => handleFieldChange('fuelType', e.target.value)}
                disabled={!vehicle.model || loadingDropdowns.fuelTypes}
                className="image-search-modal-select"
              >
                <option value="">Select Fuel Type (choose Model first)</option>
                {dropdownOptions.fuelTypes.map((fuelType) => (
                  <option key={fuelType} value={fuelType}>{fuelType}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="image-search-modal-field">
              <label>Year <span className="image-search-modal-required">*</span></label>
              <select
                value={vehicle.year || ""}
                onChange={(e) => handleFieldChange('year', e.target.value)}
                disabled={!vehicle.model || loadingDropdowns.years}
                className="image-search-modal-select"
              >
                <option value="">Select Year (choose Model first)</option>
                {dropdownOptions.years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="image-search-modal-footer">
          <button 
            className="image-search-modal-cancel" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            className="image-search-modal-continue" 
            onClick={handleContinueSearch}
            disabled={!vehicle.make || !vehicle.model}
          >
            <span>Continue Search</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSearchModal;
