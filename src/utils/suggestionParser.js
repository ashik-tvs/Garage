/**
 * Parse search query strings to extract vehicle fields
 * Example: "ENGINE BMW 3 (E90) DIESEL" -> { aggregate: "ENGINE", make: "BMW", model: "3", variant: "E90", fuelType: "DIESEL", year: null }
 */

const FUEL_TYPES = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC', 'HYBRID'];

export function parseSuggestion(searchQuery) {
  const result = {
    aggregate: null,
    make: null,
    model: null,
    variant: null,
    fuelType: null,
    year: null,
  };
  
  if (!searchQuery || typeof searchQuery !== 'string') {
    return result;
  }
  
  try {
    const trimmed = searchQuery.trim();
    const parts = trimmed.split(/\s+/);
    
    // First word is typically aggregate (all caps)
    if (parts.length > 0 && /^[A-Z]+$/.test(parts[0])) {
      result.aggregate = parts[0];
    }
    
    // Second word is typically make (all caps)
    if (parts.length > 1 && /^[A-Z]+$/.test(parts[1])) {
      result.make = parts[1];
    }
    
    // Extract variant from parentheses: (E90), (B8), etc.
    const variantMatch = trimmed.match(/\(([^)]+)\)/);
    if (variantMatch) {
      result.variant = variantMatch[1];
    }
    
    // Model is between make and variant
    // Pattern: "BMW 3 (E90)" -> model is "3"
    const modelMatch = trimmed.match(/[A-Z]+\s+([A-Z0-9]+)\s*\(/);
    if (modelMatch) {
      result.model = modelMatch[1];
    } else if (parts.length > 2 && !variantMatch) {
      // If no variant in parentheses, third word might be model
      result.model = parts[2];
    }
    
    // Fuel type is typically last word (if not a year)
    const lastWord = parts[parts.length - 1];
    
    if (!isNaN(lastWord) && lastWord.length === 4) {
      // Last word is a year
      result.year = parseInt(lastWord);
      // Check second-to-last for fuel type
      if (parts.length > 1) {
        const secondLast = parts[parts.length - 2].toUpperCase();
        if (FUEL_TYPES.includes(secondLast)) {
          result.fuelType = secondLast;
        }
      }
    } else {
      // Last word might be fuel type
      const lastUpper = lastWord.toUpperCase();
      if (FUEL_TYPES.includes(lastUpper)) {
        result.fuelType = lastUpper;
      }
    }
    
    // Handle cases where variant is in parentheses but model is not extracted
    // Example: "ENGINE BMW (E90) DIESEL" - need to handle missing model
    if (result.variant && !result.model && parts.length > 2) {
      // Look for word before parentheses
      const beforeParenMatch = trimmed.match(/[A-Z]+\s+([A-Z0-9]+)\s*\(/);
      if (beforeParenMatch) {
        result.model = beforeParenMatch[1];
      }
    }
  } catch (error) {
    console.error('Suggestion parsing error:', error);
    // Return result with nulls on parsing failure
  }
  
  return result;
}
