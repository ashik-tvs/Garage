import React, { createContext, useContext, useState, useMemo } from 'react';

const VehicleContext = createContext(null);

export function VehicleContextProvider({ children }) {
  const [vehicle, setVehicle] = useState({
    aggregate: null,
    make: null,
    model: null,
    variant: null,
    fuelType: null,
    year: null,
  });
  
  const [identifiedFields, setIdentifiedFields] = useState([]);
  
  // Computed property: calculate missing fields dynamically
  const missingFields = useMemo(() => {
    return Object.keys(vehicle).filter(key => vehicle[key] === null);
  }, [vehicle]);
  
  const updateField = (field, value) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
    if (value !== null && !identifiedFields.includes(field)) {
      setIdentifiedFields(prev => [...prev, field]);
    }
  };
  
  const updateMultipleFields = (fields) => {
    setVehicle(prev => ({ ...prev, ...fields }));
    const newIdentifiedFields = Object.keys(fields).filter(
      key => fields[key] !== null && !identifiedFields.includes(key)
    );
    setIdentifiedFields(prev => [...prev, ...newIdentifiedFields]);
  };
  
  const resetVehicle = () => {
    setVehicle({
      aggregate: null,
      make: null,
      model: null,
      variant: null,
      fuelType: null,
      year: null,
    });
    setIdentifiedFields([]);
  };
  
  const isComplete = () => {
    // Check if all required fields are filled (year is optional)
    return vehicle.aggregate !== null &&
           vehicle.make !== null &&
           vehicle.model !== null &&
           vehicle.variant !== null &&
           vehicle.fuelType !== null;
  };
  
  const value = {
    vehicle,
    identifiedFields,
    missingFields,
    updateField,
    updateMultipleFields,
    resetVehicle,
    isComplete,
  };
  
  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicleContext() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicleContext must be used within VehicleContextProvider');
  }
  return context;
}
