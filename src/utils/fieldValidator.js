/**
 * Field Validator Utility
 * Uses masterListAPI to validate all field types
 * - aggregate, subAggregate, make, model, variant, fuelType, year
 */

import { masterListAPI } from '../services/api';

// Cache for master data to avoid repeated API calls
const masterDataCache = {
  make: null,
  model: null,
  variant: null,
  fuelType: null,
  year: null,
  aggregate: null,
  subAggregate: null,
};

/**
 * Fetch master data for a specific field type
 * Uses masterListAPI for all field types
 * @param {string} fieldType - Type: "make", "model", "variant", "fuelType", "year", "aggregate", "subAggregate"
 * @param {Object} filters - Optional filters (e.g., { make: "HONDA" } when fetching models)
 * @returns {Array} - Array of valid values for that field
 */
const fetchMasterData = async (fieldType, filters = {}) => {
  try {
    console.log(`🔍 Fetching master data for ${fieldType} with filters:`, filters);
    
    // Use masterListAPI for all field types
    const requestBody = {
      partNumber: null,
      sortOrder: "ASC",
      customerCode: "0046",
      aggregate: filters.aggregate || null,
      brand: null,
      fuelType: filters.fuelType || null,
      limit: 10000,
      make: filters.make || null,
      masterType: fieldType, // lowercase: aggregate, subAggregate, make, model, variant, fuelType, year
      model: filters.model || null,
      offset: 0,
      primary: false,
      subAggregate: filters.subAggregate || null,
      variant: filters.variant || null,
      year: filters.year || null,
    };
    
    console.log(`📤 Master list request for ${fieldType}:`, requestBody);
    
    const response = await masterListAPI(requestBody);
    
    console.log(`📥 Master list response for ${fieldType}:`, response);
    
    if (response?.success && response?.data) {
      const values = response.data.map(item => item.masterName).filter(Boolean);
      const uniqueValues = [...new Set(values)];
      console.log(`✅ Found ${uniqueValues.length} unique ${fieldType} values from masterListAPI`);
      console.log(`📋 Sample ${fieldType} values:`, uniqueValues.slice(0, 10));
      return uniqueValues;
    }
    
    console.log(`⚠️ No data returned from masterListAPI for ${fieldType}`);
    return [];
  } catch (error) {
    console.error(`❌ Error fetching master data for ${fieldType}:`, error);
    return [];
  }
};

/**
 * Check if a value exists in a specific field type
 * @param {string} value - Value to check
 * @param {string} fieldType - Field type: "make", "model", "variant", "fuelType", "year", "aggregate", "subAggregate"
 * @param {Object} context - Context for dependent fields (e.g., { make: "HONDA" } when checking model)
 * @returns {boolean} - True if value exists in that field type
 */
export const isValidFieldValue = async (value, fieldType, context = {}) => {
  if (!value) return false;
  
  const normalizedValue = value.toString().toUpperCase().trim();
  
  // Build filters based on context
  const filters = {};
  if (context.make) filters.make = context.make;
  if (context.model) filters.model = context.model;
  if (context.variant) filters.variant = context.variant;
  if (context.fuelType) filters.fuelType = context.fuelType;
  if (context.aggregate) filters.aggregate = context.aggregate;
  
  // Fetch master data
  const validValues = await fetchMasterData(fieldType, filters);
  
  // Check if value exists (case-insensitive)
  return validValues.some(v => v.toString().toUpperCase().trim() === normalizedValue);
};

/**
 * Identify the correct field type for a given value
 * Checks against all field types to determine what the value actually is
 * @param {string} value - Value to identify
 * @param {Object} knownFields - Already identified fields for context
 * @returns {Object} - { fieldType: string, confidence: number } or null
 */
export const identifyFieldType = async (value, knownFields = {}) => {
  if (!value) return null;
  
  console.log(`🔍 Identifying field type for: "${value}"`);
  console.log(`📋 Known fields:`, knownFields);
  
  const normalizedValue = value.toString().toUpperCase().trim();
  
  // Check order: aggregate, subAggregate, make, model, variant, fuelType, year
  // IMPORTANT: masterType must be lowercase to match API expectations
  const checkOrder = [
    { field: 'aggregate', masterType: 'aggregate', context: {} },
    { field: 'subAggregate', masterType: 'subAggregate', context: { aggregate: knownFields.aggregate } },
    { field: 'make', masterType: 'make', context: {} },
    { field: 'model', masterType: 'model', context: { make: knownFields.make } },
    { field: 'variant', masterType: 'variant', context: { make: knownFields.make, model: knownFields.model } },
    { field: 'fuelType', masterType: 'fuelType', context: {} },
    { field: 'year', masterType: 'year', context: {} },
  ];
  
  for (const { field, masterType, context } of checkOrder) {
    // Skip if this field is already known
    if (knownFields[field]) continue;
    
    // Build filters from context
    const filters = {};
    Object.keys(context).forEach(key => {
      if (context[key]) filters[key] = context[key];
    });
    
    const validValues = await fetchMasterData(masterType, filters);
    const isValid = validValues.some(v => v.toString().toUpperCase().trim() === normalizedValue);
    
    console.log(`🔍 Checking "${value}" against ${field} (${validValues.length} values)`);
    
    if (isValid) {
      console.log(`✅ "${value}" identified as ${field}`);
      return { fieldType: field, confidence: 1.0 };
    } else {
      console.log(`❌ "${value}" not found in ${field} values`);
    }
  }
  
  console.log(`❌ Could not identify field type for: "${value}"`);
  return null;
};

/**
 * Validate and correct extracted fields
 * Takes extracted fields and validates them against master data
 * Returns corrected field mapping
 * @param {Object} extractedFields - Fields extracted from search query
 * @returns {Object} - Corrected field mapping
 */
export const validateAndCorrectFields = async (extractedFields) => {
  console.log(`🔍 Validating extracted fields:`, extractedFields);
  
  const correctedFields = {
    aggregate: null,
    make: null,
    model: null,
    variant: null,
    fuelType: null,
    year: null,
  };
  
  // Collect all non-null values
  const values = [];
  Object.entries(extractedFields).forEach(([key, value]) => {
    if (value && key !== 'subAggregate') { // Skip subAggregate for now
      values.push({ originalField: key, value: value });
    }
  });
  
  console.log(`📋 Values to validate:`, values);
  
  // Track if any field was successfully identified
  let anyFieldIdentified = false;
  
  // Identify each value
  for (const { originalField, value } of values) {
    const identified = await identifyFieldType(value, correctedFields);
    
    if (identified) {
      correctedFields[identified.fieldType] = value;
      anyFieldIdentified = true;
      console.log(`✅ Mapped "${value}" from ${originalField} to ${identified.fieldType}`);
    } else {
      console.log(`⚠️ Could not identify "${value}" (originally ${originalField})`);
    }
  }
  
  // If no fields were identified (API might have failed), return original fields
  if (!anyFieldIdentified) {
    console.log(`⚠️ Validation failed - no fields identified. Returning original fields.`);
    return extractedFields;
  }
  
  console.log(`✅ Corrected fields:`, correctedFields);
  return correctedFields;
};

export default {
  isValidFieldValue,
  identifyFieldType,
  validateAndCorrectFields,
};
