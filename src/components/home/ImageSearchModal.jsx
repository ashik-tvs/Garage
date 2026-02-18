import React, { useState, useEffect } from 'react';
import { useVehicleContext } from '../../contexts/VehicleContext';
import apiService from '../../services/apiservice';
import '../../styles/home/ImageSearchModal.css';

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
          <div className="image-search-modal-header-icon">ℹ</div>
          <div className="image-search-modal-header-text">
            <h3>Additional Information Required</h3>
            <p>Please provide the missing vehicle details</p>
          </div>
          <button className="image-search-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Search Query */}
        <div className="image-search-modal-query">
          <label>Search Query</label>
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
              <span className="image-search-modal-section-icon">✓</span>
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
                ✓ 1 part(s) selected (see details under each image below)
              </p>
            </div>

            <div className="image-search-modal-divider">OR</div>

            <div className="image-search-modal-upload">
              <label>Upload Part Image <span className="image-search-modal-upload-count">(up to 5 images)</span></label>
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
              <span className="image-search-modal-section-icon">?</span>
              <h4>Vehicle Details</h4>
            </div>
            <p className="image-search-modal-section-subtitle">
              Please provide vehicle details by entering vehicle number or selecting from dropdowns
            </p>

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
            Continue Search →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSearchModal;
