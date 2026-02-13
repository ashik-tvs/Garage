/**
 * Navigation Helper Utilities
 * Provides intelligent navigation state management and breadcrumb generation
 */

/**
 * Creates navigation state for consistent routing
 * @param {Object} baseState - Base state object
 * @param {Object} additionalState - Additional state to merge
 * @returns {Object} Complete navigation state
 */
export const createNavigationState = (baseState = {}, additionalState = {}) => {
  return {
    ...baseState,
    ...additionalState,
    timestamp: Date.now(), // For debugging navigation flow
  };
};

/**
 * Validates required navigation state for a route
 * @param {Object} state - Navigation state
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} { isValid: boolean, missingFields: Array }
 */
export const validateNavigationState = (state, requiredFields) => {
  const missingFields = requiredFields.filter(field => !state?.[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Service Type Navigation Helpers
 */
export const ServiceTypeNavigation = {
  /**
   * Navigate to service type search
   * @param {Function} navigate - React Router navigate function
   * @param {string} serviceType - Service type name
   */
  toSearch: (navigate, serviceType) => {
    navigate("/search-by-service-type", {
      state: createNavigationState({ serviceType })
    });
  },

  /**
   * Navigate to service type model selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - { serviceType, make }
   */
  toModel: (navigate, { serviceType, make }) => {
    navigate("/service-type-model", {
      state: createNavigationState({ serviceType, make })
    });
  },

  /**
   * Navigate to service type category selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - { serviceType, make, model }
   */
  toCategory: (navigate, { serviceType, make, model }) => {
    navigate("/service-type-category", {
      state: createNavigationState({ serviceType, make, model })
    });
  },

  /**
   * Navigate to service type subcategory selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - { serviceType, make, model, category }
   */
  toSubCategory: (navigate, { serviceType, make, model, category }) => {
    navigate("/service-type-sub-category", {
      state: createNavigationState({ serviceType, make, model, category })
    });
  },

  /**
   * Navigate to service type products
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - Complete navigation parameters
   */
  toProducts: (navigate, params) => {
    const { serviceType, make, model, category, subCategory, variant, fuelType, year } = params;
    navigate("/service-type-products", {
      state: createNavigationState({ 
        serviceType, 
        make, 
        model, 
        category, 
        subCategory, 
        variant, 
        fuelType, 
        year 
      })
    });
  }
};

/**
 * Vehicle Number Navigation Helpers
 */
export const VehicleNavigation = {
  /**
   * Navigate to vehicle number products
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - Navigation parameters
   */
  toProducts: (navigate, params) => {
    navigate("/vehicle-number-products", {
      state: createNavigationState(params)
    });
  }
};

/**
 * Standard Navigation Helpers
 */
export const StandardNavigation = {
  /**
   * Navigate to make selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - { featureLabel?, variant? }
   */
  toMake: (navigate, params = {}) => {
    navigate("/MakeNew", {
      state: createNavigationState(params)
    });
  },

  /**
   * Navigate to model selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - { make, featureLabel?, variant?, fromHome? }
   */
  toModel: (navigate, params) => {
    navigate("/Model", {
      state: createNavigationState(params)
    });
  },

  /**
   * Navigate to category selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - Navigation parameters
   */
  toCategory: (navigate, params) => {
    navigate("/CategoryNew", {
      state: createNavigationState(params)
    });
  },

  /**
   * Navigate to subcategory selection
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - Navigation parameters
   */
  toSubCategory: (navigate, params) => {
    navigate("/sub_category", {
      state: createNavigationState(params)
    });
  },

  /**
   * Navigate to home
   * @param {Function} navigate - React Router navigate function
   * @param {Object} params - { variant? }
   */
  toHome: (navigate, params = {}) => {
    navigate("/home", {
      state: createNavigationState(params)
    });
  }
};

/**
 * Navigation Flow Detector
 * Determines the navigation flow type based on current state
 */
export const detectNavigationFlow = (state) => {
  if (!state) return "unknown";

  // Service Type Flow
  if (state.serviceType) {
    return "service-type";
  }

  // Feature-based Flow
  if (state.featureLabel) {
    if (state.featureLabel === "Fast Movers" || state.featureLabel === "High Value") {
      return "feature-category";
    } else if (state.featureLabel === "CNG") {
      return "feature-make-model";
    } else if (state.featureLabel === "Discontinued Model" || state.featureLabel === "Electric") {
      return "feature-model";
    } else if (state.featureLabel === "Only with us") {
      return "feature-brand";
    }
  }

  // Make-Model Flow
  if (state.make && state.model) {
    return "make-model";
  }

  // Direct Category Flow
  if (state.aggregateName || state.category) {
    return "direct-category";
  }

  // Brand Flow
  if (state.brand) {
    return "brand";
  }

  return "unknown";
};

/**
 * Debug Navigation State
 * Logs navigation state for debugging purposes
 */
export const debugNavigationState = (componentName, state, location) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🧭 Navigation Debug: ${componentName}`);
    console.log("📍 Current Path:", location.pathname);
    console.log("📊 Navigation State:", state);
    console.log("🔍 Flow Type:", detectNavigationFlow(state));
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.groupEnd();
  }
};

/**
 * Navigation State Cleaner
 * Removes unnecessary fields from navigation state
 */
export const cleanNavigationState = (state, keepFields = []) => {
  const defaultKeepFields = [
    'make', 'model', 'variant', 'fuelType', 'year',
    'brand', 'category', 'subCategory', 'aggregateName', 'subAggregateName',
    'featureLabel', 'serviceType', 'fromHome', 'isOnlyWithUs'
  ];
  
  const fieldsToKeep = [...defaultKeepFields, ...keepFields];
  
  return Object.keys(state || {})
    .filter(key => fieldsToKeep.includes(key))
    .reduce((cleanState, key) => {
      cleanState[key] = state[key];
      return cleanState;
    }, {});
};