import { useState, useEffect } from "react";
import { useVehicleContext } from "../../contexts/VehicleContext";
import { partsmartTextSearchAPI } from "../../services/api";
import apiService from "../../services/apiservice";
import "../../styles/home/VehicleContextModal.css";

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

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1L1 16H17L9 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M9 7V10M9 13H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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

const VehicleContextModal = ({ isOpen, onClose, searchQuery, missingFields: propMissingFields, extractedFields, onSearchComplete }) => {
  const { vehicle, updateField } = useVehicleContext();
  
  // Use missing fields from props (from PartSmart API response)
  const [localMissingFields, setLocalMissingFields] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  const [dropdownOptions, setDropdownOptions] = useState({
    make: [],
    model: [],
    variant: [],
    fuelType: [],
    year: [],
  });
  
  const [loading, setLoading] = useState({
    make: false,
    model: false,
    variant: false,
    fuelType: false,
    year: false,
  });
  
  const [errors, setErrors] = useState({
    api: null,
  });
  
  const [validationWarning, setValidationWarning] = useState(null);
  
  const [searching, setSearching] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(null);

  // Initialize local missing fields from props (filter out non-vehicle fields)
  useEffect(() => {
    if (isOpen && propMissingFields) {
      console.log("🔍 Modal opened with missing fields from PartSmart:", propMissingFields);
      console.log("🔍 Extracted fields:", extractedFields);
      
      // Only keep vehicle fields (exclude 'aggregate', 'part', etc.)
      const vehicleFieldsOnly = ['make', 'model', 'variant', 'fuelType', 'year'];
      const filteredMissingFields = propMissingFields.filter(field => 
        vehicleFieldsOnly.includes(field)
      );
      
      console.log("🔍 Filtered missing fields (vehicle only):", filteredMissingFields);
      setLocalMissingFields(filteredMissingFields);
      
      // Clear validation warning when modal opens
      setValidationWarning(null);
      setVehicleFound(null);
    }
  }, [isOpen, propMissingFields]);

  // Fetch options for missing fields when modal opens
  useEffect(() => {
    if (isOpen && localMissingFields.length > 0) {
      // Only fetch the FIRST missing field to start the cascade
      const firstMissingField = localMissingFields[0];
      fetchOptionsForField(firstMissingField);
    }
  }, [isOpen, localMissingFields.length]);

  const fetchOptionsForField = async (field, updatedValues = {}) => {
    setLoading(prev => ({ ...prev, [field]: true }));
    setErrors({ api: null });
    
    try {
      console.log(`🔍 Fetching ${field} options using Partsmart Lookup API...`);
      
      // Build vehicle context with already-filled fields ONLY
      // Don't include the field we're trying to fetch or fields after it in the hierarchy
      const vehicleContext = {};
      const hierarchy = ['make', 'model', 'variant', 'fuelType', 'year'];
      const currentFieldIndex = hierarchy.indexOf(field);
      
      // Only include fields that come BEFORE the current field in hierarchy
      const fieldsToInclude = hierarchy.slice(0, currentFieldIndex);
      
      fieldsToInclude.forEach(fieldName => {
        const value = updatedValues[fieldName] || extractedFields?.[fieldName] || vehicle[fieldName];
        if (value) {
          vehicleContext[fieldName] = value;
        }
      });
      
      const requestBody = {
        search_type: "lookup",
        lookup_type: "vehicle",
        limit: 50
      };
      
      // Only add vehicle context if we have fields
      if (Object.keys(vehicleContext).length > 0) {
        requestBody.vehicle = vehicleContext;
      }
      
      console.log(`📡 Partsmart Lookup API request for ${field}:`, requestBody);
      console.log(`📋 Using context (fields before ${field}):`, vehicleContext);
      
      // Call the backend proxy
      let response = await apiService.post('/partsmart/search', requestBody);
      
      console.log(`📥 Partsmart Lookup API response for ${field}:`, response);
      
      // Extract the actual data from response (axios wraps in .data, then API has .data)
      let apiData = response?.data?.data || response?.data;
      
      // Smart fallback: If no results, progressively remove fields from the end
      // This handles cases where variant/fuelType names don't match exactly in database
      if (apiData && Object.keys(vehicleContext).length > 0) {
        // Check if we got empty results
        const fieldDataKey = {
          'make': 'makes',
          'model': 'models',
          'variant': 'variants',
          'fuelType': 'fuel_types',
          'year': 'years'
        }[field];
        
        const hasResults = apiData[fieldDataKey] && apiData[fieldDataKey].length > 0;
        
        if (!hasResults) {
          console.log(`⚠️ No results for ${field} with context:`, vehicleContext);
          
          // Try progressive fallback: remove fields from the end one by one
          const contextFields = Object.keys(vehicleContext);
          
          for (let i = contextFields.length - 1; i >= 0; i--) {
            const fallbackContext = {};
            // Keep only the first i fields
            for (let j = 0; j < i; j++) {
              const fieldName = hierarchy[j];
              if (vehicleContext[fieldName]) {
                fallbackContext[fieldName] = vehicleContext[fieldName];
              }
            }
            
            console.log(`🔄 Fallback attempt ${contextFields.length - i}: trying with context:`, fallbackContext);
            
            const fallbackRequestBody = {
              search_type: "lookup",
              lookup_type: "vehicle",
              limit: 50
            };
            
            if (Object.keys(fallbackContext).length > 0) {
              fallbackRequestBody.vehicle = fallbackContext;
            }
            
            response = await apiService.post('/partsmart/search', fallbackRequestBody);
            console.log(`📥 Fallback response:`, response);
            
            // Update apiData with fallback response
            apiData = response?.data?.data || response?.data;
            
            // Check if this fallback gave us results
            const fallbackHasResults = apiData[fieldDataKey] && apiData[fieldDataKey].length > 0;
            
            if (fallbackHasResults) {
              console.log(`✅ Fallback successful with context:`, fallbackContext);
              break;
            }
          }
        }
      }
      
      if (apiData) {
        let options = [];
        
        // Map the response data to options based on field
        if (field === 'make' && apiData.makes) {
          options = apiData.makes.map(value => ({ value, label: value }));
        } else if (field === 'model' && apiData.models) {
          options = apiData.models.map(value => ({ value, label: value }));
        } else if (field === 'variant' && apiData.variants) {
          options = apiData.variants.map(value => ({ value, label: value }));
        } else if (field === 'fuelType' && apiData.fuel_types) {
          options = apiData.fuel_types.map(value => ({ value, label: value }));
        } else if (field === 'year' && apiData.years) {
          options = apiData.years.map(value => ({ value: value.toString(), label: value.toString() }));
        }
        
        console.log(`✅ Parsed ${field} options:`, options.length, options.slice(0, 5));
        setDropdownOptions(prev => ({ ...prev, [field]: options }));
      } else {
        console.warn(`⚠️ No data returned for ${field}`);
        setDropdownOptions(prev => ({ ...prev, [field]: [] }));
      }
    } catch (error) {
      console.error(`❌ Error fetching ${field} options:`, error);
      setErrors({ api: `Failed to load ${field} options` });
    } finally {
      setLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleFieldChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    updateField(field, value);
    
    // Remove this field from local missing fields
    setLocalMissingFields(prev => prev.filter(f => f !== field));
    
    // Clear dependent dropdowns based on hierarchy
    const hierarchy = ['make', 'model', 'variant', 'fuelType', 'year'];
    const currentIndex = hierarchy.indexOf(field);
    
    if (currentIndex >= 0) {
      const dependentFields = hierarchy.slice(currentIndex + 1);
      dependentFields.forEach(depField => {
        updateField(depField, null);
        setDropdownOptions(prev => ({ ...prev, [depField]: [] }));
      });
      
      // Fetch options for next field in hierarchy
      const nextField = hierarchy[currentIndex + 1];
      if (nextField) {
        // Pass the updated value so fetchOptionsForField uses the latest data
        const updatedValues = { [field]: value };
        setTimeout(() => fetchOptionsForField(nextField, updatedValues), 100);
      }
    }
  };

  const handleVehicleNumberLookup = async () => {
    if (!vehicleNumber || vehicleNumber.length < 6) {
      setErrors({ api: "Please enter a valid vehicle number" });
      return;
    }

    setLoading(prev => ({ ...prev, make: true }));
    setErrors({ api: null });
    setVehicleFound(null);

    try {
      console.log("🔍 Looking up vehicle number:", vehicleNumber);

      // Build query: include part name from original search + vehicle number
      // This matches Postman format: "oil filter for TN12AU9523"
      const partName = extractedFields?.part || searchQuery || "parts";
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

      // Response structure: { success, received, data, summary, meta }
      // summary is at top level, not inside data
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
          setLocalMissingFields(prev => prev.filter(f => f !== 'make'));
        }
        if (vehicleData.model) {
          updateField('model', vehicleData.model);
          setLocalMissingFields(prev => prev.filter(f => f !== 'model'));
        }
        if (vehicleData.variant) {
          updateField('variant', vehicleData.variant);
          setLocalMissingFields(prev => prev.filter(f => f !== 'variant'));
        }
        if (vehicleData.fuelType) {
          updateField('fuelType', vehicleData.fuelType);
          setLocalMissingFields(prev => prev.filter(f => f !== 'fuelType'));
        }
        if (vehicleData.year) {
          updateField('year', vehicleData.year.toString());
          setLocalMissingFields(prev => prev.filter(f => f !== 'year'));
        }

        // Clear all missing fields if all data is present
        if (vehicleData.make && vehicleData.model && vehicleData.variant && vehicleData.fuelType && vehicleData.year) {
          setLocalMissingFields([]);
        }
      } else {
        setErrors({ api: "Vehicle not found. Please enter details manually." });
      }
    } catch (error) {
      console.error("❌ Error looking up vehicle number:", error);
      setErrors({ api: "Failed to lookup vehicle number. Please try again." });
    } finally {
      setLoading(prev => ({ ...prev, make: false }));
    }
  };

  const handleContinue = async () => {
    if (localMissingFields.length > 0) {
      console.log("⚠️ Cannot continue - missing fields:", localMissingFields);
      return;
    }
    
    console.log("✅ All fields filled, calling PartSmart search API...");
    
    setSearching(true);
    setErrors({ api: null });
    
    try {
      // Build complete query with all vehicle fields
      // Pass data as-is to API - let API handle validation
      const vehicleContext = {
        make: vehicle.make || extractedFields?.make,
        model: vehicle.model || extractedFields?.model,
        variant: vehicle.variant || extractedFields?.variant,
        fuelType: vehicle.fuelType || extractedFields?.fuelType,
      };
      
      // Add year if present
      const yearValue = vehicle.year || extractedFields?.year;
      if (yearValue) {
        vehicleContext.year = yearValue;
      }
      
      // Extract part name from search query or use aggregate
      const partName = extractedFields?.part || vehicle.aggregate || searchQuery;
      
      console.log("📡 Calling PartSmart with vehicle context:", {
        query: partName,
        vehicle: vehicleContext
      });
      
      // Call PartSmart search API with complete vehicle context
      let result = await partsmartTextSearchAPI({
        query: partName,
        vehicle: vehicleContext,
        sources: ['tvs'],
        limit: 10
      });
      
      console.log("✅ PartSmart search result:", result);
      
      // Check if search was successful - navigate regardless of results count
      if (result?.summary?.status === 'incomplete_extraction') {
        // Still missing fields - update modal
        console.log("⚠️ Still missing fields:", result.summary.missing_fields);
        setLocalMissingFields(result.summary.missing_fields || []);
        setErrors({ api: "Some fields are still missing. Please complete all fields." });
      } else if (result?.summary?.status === 'error' && result?.error?.code === 'VALIDATION_ERROR') {
        // Handle validation error - retry with NLP only (no vehicle object)
        console.log("⚠️ Validation error detected:", result.error);
        console.log("🔄 Retrying search with NLP only (no vehicle object)");
        
        // Build a natural language query with all vehicle info
        const nlpQuery = `${partName} for ${vehicleContext.make} ${vehicleContext.model} ${vehicleContext.variant || ''} ${vehicleContext.fuelType || ''} ${vehicleContext.year || ''}`.trim();
        
        console.log("📝 NLP Query:", nlpQuery);
        
        // Retry search with just the query - let NLP extract vehicle info
        result = await partsmartTextSearchAPI({
          query: nlpQuery,
          sources: ['tvs'],
          limit: 10
        });
        
        console.log("✅ Retry search result (NLP only):", result);
        
        // Navigate to results page
        onSearchComplete(result, vehicleContext);
      } else {
        // Navigate to results page (even if 0 results, let the page handle it)
        console.log("✅ Search completed, navigating to results");
        // Pass both result AND the complete vehicle context used for search
        onSearchComplete(result, vehicleContext);
      }
    } catch (error) {
      console.error("❌ Error searching with complete vehicle context:", error);
      setErrors({ api: "Failed to search. Please try again." });
    } finally {
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  // Show all vehicle fields, not just missing ones
  const allVehicleFields = [
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'variant', label: 'Variant' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'year', label: 'Year' }
  ];

  // Check if all required fields are filled
  const allFieldsFilled = localMissingFields.length === 0;

  return (
    <div className="vehicle-modal-overlay" onClick={onClose}>
      <div className="vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vehicle-modal-header">
          <div className="header-left">
            <div className="info-icon">
              <InfoIcon />
            </div>
            <div className="header-text">
              <h2>Additional Information Required</h2>
              <p>Please provide the missing vehicle details</p>
            </div>
          </div>
          <button className="vehicle-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="vehicle-modal-body">
          <div className="search-query-section">
            <label>
              <SearchIcon />
              <span>Search Query</span>
            </label>
            <div className="search-query-display">{searchQuery}</div>
          </div>

          {errors.api && (
            <div className="vehicle-modal-error">
              <AlertIcon />
              <span>{errors.api}</span>
            </div>
          )}
          
          {validationWarning && (
            <div className="vehicle-modal-warning">
              <InfoIcon />
              <span>{validationWarning}</span>
            </div>
          )}

          <div className="vehicle-details-section">
            <div className="section-header">
              <div className={`check-icon ${allFieldsFilled ? 'filled' : 'empty'}`}>
                <CheckIcon />
              </div>
              <h3>Vehicle Details</h3>
            </div>
            <p className="section-description">
              Please provide vehicle details by entering vehicle number or selecting from dropdowns
            </p>

            {/* Vehicle Number Input */}
            <div className="vehicle-number-section">
              <label>
                <CarIcon />
                <span>Vehicle Number (Auto-fills all details)</span>
              </label>
              <div className="vehicle-number-input-wrapper">
                <div className="vehicle-number-plate">
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="TN01AZ2345"
                    maxLength={10}
                  />
                </div>
                <button 
                  className="btn-lookup" 
                  onClick={handleVehicleNumberLookup}
                  disabled={loading.make || !vehicleNumber}
                >
                  {loading.make ? (
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

            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* Display already extracted fields */}
            {(extractedFields?.make || extractedFields?.model || extractedFields?.variant || extractedFields?.fuelType) && (
              <div className="extracted-fields-section">
                <label>
                  <CheckIcon />
                  <span>Extracted from search query</span>
                </label>
                <div className="extracted-fields-display">
                  {extractedFields?.make && <span className="extracted-field"><strong>Make:</strong> {extractedFields.make}</span>}
                  {extractedFields?.model && <span className="extracted-field"><strong>Model:</strong> {extractedFields.model}</span>}
                  {extractedFields?.variant && <span className="extracted-field"><strong>Variant:</strong> {extractedFields.variant}</span>}
                  {extractedFields?.fuelType && <span className="extracted-field"><strong>Fuel Type:</strong> {extractedFields.fuelType}</span>}
                </div>
              </div>
            )}

            {/* Manual Selection Dropdowns - Only show missing fields */}
            <div className="manual-selection-grid">
              {allVehicleFields.map((field) => {
                const fieldKey = field.key;
                const isRequired = localMissingFields.includes(fieldKey);
                const currentValue = extractedFields?.[fieldKey] || vehicle[fieldKey] || "";
                
                // Don't show dropdown if field is already extracted (shown in "Extracted from search query" section)
                if (extractedFields && extractedFields[fieldKey]) {
                  return null;
                }
                
                // Determine if field should be enabled
                let isEnabled = true;
                if (fieldKey === 'model') {
                  isEnabled = !!(extractedFields?.make || vehicle.make);
                } else if (fieldKey === 'variant') {
                  isEnabled = !!(extractedFields?.model || vehicle.model);
                } else if (fieldKey === 'fuelType' || fieldKey === 'year') {
                  isEnabled = !!(extractedFields?.variant || vehicle.variant);
                }
                
                return (
                  <div key={fieldKey} className="dropdown-group">
                    <label>
                      {field.label} {isRequired && <span className="required">*</span>}
                    </label>
                    <select
                      value={currentValue}
                      onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                      disabled={!isEnabled || loading[fieldKey]}
                      className={!isEnabled ? 'disabled' : ''}
                    >
                      <option value="">Select {field.label}</option>
                      {dropdownOptions[fieldKey]?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {loading[fieldKey] && <span className="loading-spinner">Loading...</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="vehicle-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-continue"
            onClick={handleContinue}
            disabled={localMissingFields.length > 0 || searching}
          >
            {searching ? (
              <>
                <span className="spinner"></span>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Continue Search</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleContextModal;
