import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { partsmartTextSearchAPI } from "../../../services/api";
import { getAssets, getAsset } from "../../../utils/assets";
import { useVehicleContext } from "../../../contexts/VehicleContext";
import Search from "../../home/Search";
import { useCart } from "../../../context/CartContext";
import NoImage from "../../../assets/No Image.png";
import Product1 from "./Product1";
import "../../../styles/search_by/partnumber/PartNumber.css";
import "../../../styles/skeleton/skeleton.css";

/* ---------------- COMPATIBILITY MODAL ---------------- */
const CompatibilityModal = ({ onClose, partNumber, onVehicleSelect, vehicles = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Handle vehicle row click
  const handleVehicleClick = (vehicle) => {
    console.log("🚗 Vehicle selected:", vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
    onClose();
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter((v) =>
    Object.values(v).join(" ").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="pn-modal-overlay">
      <div className="pn-modal">
        <div className="pn-modal-header">
          <div className="pn-modal-title">
            Compatible Vehicles ({vehicles.length})
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pn-modal-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="pn-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="pn-table-container">
          <div className="pn-modal-table-header">
            <span>Make</span>
            <span>Model</span>
            <span>Variant</span>
            <span>Fuel Type</span>
            <span>Year</span>
          </div>
        </div>

        <div>
          <div className="pn-modal-table-body">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v, i) => (
                <div 
                  key={i} 
                  className="pn-modal-row"
                  onClick={() => handleVehicleClick(v)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{v.vehicleMake || v.make}</span>
                  <span>{v.vehicleModel || v.model}</span>
                  <span>{v.vehicleVariant || v.variant}</span>
                  <span>{v.vehicleFuelType || v.fuelType}</span>
                  <span>{v.vehicleFromYear || v.year}</span>
                </div>
              ))
            ) : (
              <div className="pn-no-results" style={{ padding: "20px", textAlign: "center" }}>
                No vehicles found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
const PartNumber = () => {
  const { state } = useLocation();
  const { vehicle, updateField } = useVehicleContext();
  const [assets, setAssets] = useState({});
  const rawSearchKey = state?.partNumber || "";
  const partsmartResults = state?.partsmartResults || null;
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  const searchKey = rawSearchKey;
  const { cartItems, addToCart, removeFromCart } = useCart();
  
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState("");
  const [selectedPartVehicles, setSelectedPartVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [otherBrandProducts, setOtherBrandProducts] = useState([]);
  const [alignedProducts, setAlignedProducts] = useState([]);
  const [totalPartsCount, setTotalPartsCount] = useState(0);
  const [openFilter, setOpenFilter] = useState(null);

  // Vehicle filter states
  const [selectedMake, setSelectedMake] = useState(vehicle.make || "");
  const [selectedModel, setSelectedModel] = useState(vehicle.model || "");
  const [selectedVariant, setSelectedVariant] = useState(vehicle.variant || "");
  const [selectedFuel, setSelectedFuel] = useState(vehicle.fuelType || "");
  const [selectedYear, setSelectedYear] = useState(vehicle.year || "");

  // Right filters state
  const [rightFilters, setRightFilters] = useState({
    year: "",
    fuelType: "",
    eta: "",
  });

  // Extract vehicle options from products
  const [vehicleOptions, setVehicleOptions] = useState({
    makes: [],
    models: [],
    variants: [],
    fuelTypes: [],
    years: [],
  });

  // Handler for opening compatibility modal
  const handleCompatibilityClick = (product) => {
    setSelectedPartNumber(product.partNumber);
    setSelectedPartVehicles(product.vehicles || []);
    setShowCompatibility(true);
  };

  // Sync with VehicleContext
  useEffect(() => {
    if (vehicle.make) setSelectedMake(vehicle.make);
    if (vehicle.model) setSelectedModel(vehicle.model);
    if (vehicle.variant) setSelectedVariant(vehicle.variant);
    if (vehicle.fuelType) setSelectedFuel(vehicle.fuelType);
    if (vehicle.year) setSelectedYear(vehicle.year.toString());
  }, [vehicle]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openFilter) setOpenFilter(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openFilter]);

  // Transform Unified Search API response to product format
  const transformUnifiedSearchResults = (unifiedResults) => {
    if (!unifiedResults?.data?.tvs) {
      return { myTvsProducts: [], otherProducts: [], totalCount: 0, vehicleOptions: {} };
    }

    const allProducts = [];
    const vehicleSet = {
      makes: new Set(),
      models: new Set(),
      variants: new Set(),
      fuelTypes: new Set(),
      years: new Set(),
    };

    // Process TVS results
    Object.entries(unifiedResults.data.tvs).forEach(([partKey, parts]) => {
      if (Array.isArray(parts)) {
        parts.forEach((part, index) => {
          // Extract vehicle info
          if (part.vehicleMake) vehicleSet.makes.add(part.vehicleMake);
          if (part.vehicleModel) vehicleSet.models.add(part.vehicleModel);
          if (part.vehicleVariant) vehicleSet.variants.add(part.vehicleVariant);
          if (part.vehicleFuelType) vehicleSet.fuelTypes.add(part.vehicleFuelType);
          if (part.vehicleFromYear) vehicleSet.years.add(part.vehicleFromYear);

          allProducts.push({
            id: `${part.partNumber}_${index}`,
            brand: part.brandName || "myTVS",
            partNo: part.partNumber,
            description: part.name || part.itemDescription || partKey,
            price: parseFloat(part.listPrice) || 0,
            mrp: parseFloat(part.mrp) || 0,
            eta: "1-2 Days",
            stock: "In stock",
            vehicles: [], // Will be populated from parts_summary
            imageUrl: NoImage,
            vehicleInfo: {
              make: part.vehicleMake,
              model: part.vehicleModel,
              variant: part.vehicleVariant,
              fuelType: part.vehicleFuelType,
              year: part.vehicleFromYear,
            }
          });
        });
      }
    });

    // Separate myTVS and other brands
    const myTvsProducts = allProducts.filter(p => p.brand.toUpperCase() === "MYTVS");
    const otherProducts = allProducts.filter(p => p.brand.toUpperCase() !== "MYTVS");

    return {
      myTvsProducts,
      otherProducts,
      totalCount: unifiedResults.summary?.results_returned || allProducts.length,
      vehicleOptions: {
        makes: Array.from(vehicleSet.makes),
        models: Array.from(vehicleSet.models),
        variants: Array.from(vehicleSet.variants),
        fuelTypes: Array.from(vehicleSet.fuelTypes),
        years: Array.from(vehicleSet.years).sort((a, b) => b - a),
      }
    };
  };

  // Fetch products using Unified Search API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchKey) {
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
        return;
      }

      // If we already have results from navigation, use them
      if (partsmartResults) {
        console.log("✅ Using existing Unified Search results");
        const transformed = transformUnifiedSearchResults(partsmartResults);
        setRecommendedProducts(transformed.myTvsProducts);
        setOtherBrandProducts(transformed.otherProducts);
        setTotalPartsCount(transformed.totalCount);
        setVehicleOptions(transformed.vehicleOptions);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Fetching products using Unified Search API for:", searchKey);
        
        const response = await partsmartTextSearchAPI({
          query: searchKey,
          sources: ['tvs'],
          limit: 100
        });

        console.log("✅ Unified Search response:", response);

        if (response?.summary?.status === 'incomplete_extraction') {
          setError("Please provide complete vehicle information to see products.");
          setLoading(false);
          return;
        }

        const transformed = transformUnifiedSearchResults(response);
        setRecommendedProducts(transformed.myTvsProducts);
        setOtherBrandProducts(transformed.otherProducts);
        setTotalPartsCount(transformed.totalCount);
        setVehicleOptions(transformed.vehicleOptions);

      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKey, partsmartResults]);

  // Apply compatibility filter using Unified Search API
  const applyCompatibilityFilter = async () => {
    if (!selectedMake && !selectedModel && !selectedVariant && !selectedFuel && !selectedYear) {
      console.log("❌ No filters selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vehicleContext = {};
      if (selectedMake) vehicleContext.make = selectedMake;
      if (selectedModel) vehicleContext.model = selectedModel;
      if (selectedVariant) vehicleContext.variant = selectedVariant;
      if (selectedFuel) vehicleContext.fuelType = selectedFuel;
      if (selectedYear) vehicleContext.year = parseInt(selectedYear);

      console.log("🔍 Applying filter with vehicle context:", vehicleContext);

      const response = await partsmartTextSearchAPI({
        query: searchKey,
        vehicle: vehicleContext,
        sources: ['tvs'],
        limit: 100
      });

      const transformed = transformUnifiedSearchResults(response);
      setRecommendedProducts(transformed.myTvsProducts);
      setOtherBrandProducts(transformed.otherProducts);
      setTotalPartsCount(transformed.totalCount);

    } catch (err) {
      console.error("❌ Error applying filter:", err);
      setError("Failed to apply filter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle vehicle selection from compatibility modal
  const handleVehicleSelection = async (vehicle) => {
    console.log("🚗 Vehicle selected:", vehicle);
    
    const make = vehicle.vehicleMake || vehicle.make;
    const model = vehicle.vehicleModel || vehicle.model;
    const variant = vehicle.vehicleVariant || vehicle.variant;
    const fuelType = vehicle.vehicleFuelType || vehicle.fuelType;
    const year = vehicle.vehicleFromYear || vehicle.year;

    setSelectedMake(make || "");
    setSelectedModel(model || "");
    setSelectedVariant(variant || "");
    setSelectedFuel(fuelType || "");
    setSelectedYear(year || "");

    // Apply filter with selected vehicle
    setLoading(true);
    try {
      const vehicleContext = {};
      if (make) vehicleContext.make = make;
      if (model) vehicleContext.model = model;
      if (variant) vehicleContext.variant = variant;
      if (fuelType) vehicleContext.fuelType = fuelType;
      if (year) vehicleContext.year = parseInt(year);

      const response = await partsmartTextSearchAPI({
        query: searchKey,
        vehicle: vehicleContext,
        sources: ['tvs'],
        limit: 100
      });

      const transformed = transformUnifiedSearchResults(response);
      setRecommendedProducts(transformed.myTvsProducts);
      setOtherBrandProducts(transformed.otherProducts);
      setTotalPartsCount(transformed.totalCount);

    } catch (err) {
      console.error("❌ Error filtering by vehicle:", err);
      setError("Failed to filter products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pn-wrapper">
      <Search />

      <div className="pn-body">
        <div className="pn-search-key">
          Search Key : <b>{searchKey}</b>
          {totalPartsCount > 0 && (
            <span style={{ marginLeft: "10px" }}>
              Compatible with <b>{totalPartsCount.toLocaleString()}</b> items
            </span>
          )}
        </div>

        {/* FILTERS */}
        <div className="pn-top">
          <div className="pn-compatibility">
            <select 
              className="pn-control-dropdown"
              value={selectedMake}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMake(val);
                updateField('make', val || null);
                setSelectedModel("");
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
              }}
            >
              <option value="">Select Make</option>
              {vehicleOptions.makes.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedModel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedModel(val);
                updateField('model', val || null);
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
              }}
              disabled={!selectedMake}
            >
              <option value="">Select Model</option>
              {vehicleOptions.models.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedVariant}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVariant(val);
                updateField('variant', val || null);
                setSelectedFuel("");
                setSelectedYear("");
              }}
              disabled={!selectedModel}
            >
              <option value="">Select Variant</option>
              {vehicleOptions.variants.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedFuel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFuel(val);
                updateField('fuelType', val || null);
                setSelectedYear("");
              }}
              disabled={!selectedVariant}
            >
              <option value="">Select Fuel type</option>
              {vehicleOptions.fuelTypes.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val);
                updateField('year', val ? parseInt(val) : null);
              }}
              disabled={!selectedFuel}
            >
              <option value="">Select Year</option>
              {vehicleOptions.years.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <button
              className="pn-clear-btn"
              onClick={() => {
                setSelectedMake("");
                setSelectedModel("");
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
                setRightFilters({ year: "", fuelType: "", eta: "" });
                // Reload original results
                window.location.reload();
              }}
            >
              X
            </button>

            <button className="pn-search-btn" onClick={applyCompatibilityFilter}>
              Search
            </button>
          </div>

          <div className="pn-right-filters">
            {/* Right filters can be added here if needed */}
          </div>
        </div>

        {/* CONTENT */}
        <div className="pn-content">
          {loading && (
            <div className="pn-loading">Loading products...</div>
          )}

          {!loading && error && (
            <div className="pn-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <Product1
                title="myTVS Recommended Products"
                products={recommendedProducts.map(p => ({
                  ...p,
                  partNumber: p.partNo,
                  name: p.description,
                  image: p.imageUrl,
                  stockStatus: p.stock,
                  deliveryTime: p.eta,
                  compatibleVehicles: p.vehicles.length,
                  cartId: p.id,
                }))}
                layout="horizontal"
                onAddToCart={(product) => {
                  addToCart({
                    partNumber: product.cartId,
                    name: product.name,
                    price: product.price,
                    mrp: product.mrp,
                    brand: product.brand,
                    quantity: 1,
                  });
                }}
                onCompatibilityClick={handleCompatibilityClick}
              />

              <Product1
                title="Other Brand Products"
                products={otherBrandProducts.map(p => ({
                  ...p,
                  partNumber: p.partNo,
                  name: p.description,
                  image: p.imageUrl,
                  stockStatus: p.stock,
                  deliveryTime: p.eta,
                  compatibleVehicles: p.vehicles.length,
                  cartId: p.id,
                }))}
                layout="horizontal"
                onAddToCart={(product) => {
                  addToCart({
                    partNumber: product.cartId,
                    name: product.name,
                    price: product.price,
                    mrp: product.mrp,
                    brand: product.brand,
                    quantity: 1,
                  });
                }}
                onCompatibilityClick={handleCompatibilityClick}
              />
            </>
          )}
        </div>
      </div>

      {showCompatibility && (
        <CompatibilityModal
          onClose={() => setShowCompatibility(false)}
          partNumber={selectedPartNumber}
          vehicles={selectedPartVehicles}
          onVehicleSelect={handleVehicleSelection}
        />
      )}
    </div>
  );
};

export default PartNumber;
