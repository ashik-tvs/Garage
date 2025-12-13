// src/data.js
// Centralized mock data to simulate API responses.
// Replace the getters with real API calls later.

const vehicles = [
  {
    vehicleNumber: "TN59CS3811",
    brand: "Hyundai",
    model: "Grand i10",
    variant: "Sport",
    fuel: "Petrol",
    year: 2021,
    thumbnail: null
  },
  {
    vehicleNumber: "KA01AA0001",
    brand: "Tata",
    model: "Nexon",
    variant: "XE",
    fuel: "Diesel",
    year: 2020,
    thumbnail: null
  }
];

const categories = [
  { id: 1, name: "Engine", icon: "⚙️" },
  { id: 2, name: "Brakes", icon: "🛑" },
  { id: 3, name: "Battery", icon: "🔋" },
  { id: 4, name: "Steering", icon: "🕹️" },
  { id: 5, name: "Body Parts", icon: "🚗" },
  { id: 6, name: "Filters", icon: "🧼" }
];

const subcategories = [
  { id: 1, name: "Bonnet", icon: "🧷" },
  { id: 2, name: "Bumper", icon: "🪧" },
  { id: 3, name: "Body Bush", icon: "🔩" },
  { id: 4, name: "Body Trim", icon: "🧩" },
  { id: 5, name: "Fog Lamp", icon: "💡" },
  { id: 6, name: "Child Parts", icon: "👶" }
];

const serviceTypes = [
  "Brake Bulb Replacement",
  "Overall Brake System",
  "Front Headlight Replacement",
  "Battery Check & Replacement",
  "Engine Oil & Filter Change",
  "Wheel Alignment & Balancing",
  "AC Cooling & Gas Refill"
];

const productsByVehicle = {
  // keyed by vehicleNumber
  TN59CS3811: {
    recommended: [
      {
        id: "p1",
        title: "TVS Rear Brake Pad",
        price: 425,
        oldPrice: 600,
        vendor: "myTVS",
        eta: "1-2 Days"
      }
    ],
    other: [
      { id: "p2", title: "Denso Brake Pad", price: 495, oldPrice: 640, vendor: "Denso", eta: "2-3 Days" },
      { id: "p3", title: "Bosch Brake Pad (Set of 4)", price: 1200, oldPrice: 1500, vendor: "Bosch", eta: "3-4 Days"}
    ],
    aligned: [
      { id: "p4", title: "Brake Disc Pad", price: 425, oldPrice: 550, vendor: "Valeo", eta: "1-2 Days" },
      { id: "p5", title: "Brake Fluid 1L", price: 299, oldPrice: null, vendor: "Castrol", eta: "1-2 Days" }
    ]
  },
  KA01AA0001: {
    recommended: [
      { id: "p10", title: "Tata OEM Oil Filter", price: 249, oldPrice: 350, vendor: "myTVS", eta: "1-2 Days" }
    ],
    other: [
      { id: "p11", title: "Generic Oil Filter", price: 199, oldPrice: 250, vendor: "Generic", eta: "2-3 Days" }
    ],
    aligned: [
      { id: "p12", title: "Engine Oil 4L", price: 1899, oldPrice: 2200, vendor: "Castrol", eta: "1-2 Days" }
    ]
  }
};

export function getVehicleByNumber(number) {
  // simulate lookup; returns null if not found
  return vehicles.find(v => v.vehicleNumber.toLowerCase() === number.toLowerCase()) || null;
}

export function getCategoriesForVehicle(/*vehicle*/) {
  // for mock, return full list
  return categories;
}

export function getSubcategoriesForVehicle(/*vehicle*/) {
  return subcategories;
}

export function getServiceTypesForVehicle(/*vehicle*/) {
  return serviceTypes;
}

export function getProductsForVehicle(vehicleNumber) {
  return productsByVehicle[vehicleNumber] || { recommended: [], other: [], aligned: [] };
}
