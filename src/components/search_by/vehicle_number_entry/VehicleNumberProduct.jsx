import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/vehicle_number_entry/VehicleNumberProduct.css";
import apiService, { fetchMasterList, fetchVehicleListByPartNumber } from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import Navigation from "../../Navigation/Navigation";
import Product1 from "../partnumber/Product1";

/* ---------------- COMPATIBILITY MODAL ---------------- */
const CompatibilityModal = ({ onClose, partNumber, onVehicleSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const observerTarget = useRef(null);

  // Handle vehicle row click
  const handleVehicleClick = (vehicle) => {
    console.log("🚗 Vehicle selected:", vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
    onClose(); // Close modal after selection
  };

  // Fetch vehicles with pagination
  const fetchVehicles = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    try {
      const response = await fetchVehicleListByPartNumber(partNumber, 50, currentOffset);
      const newVehicles = response?.data || [];
      const count = response?.count || 0;

      setTotalCount(count);

      if (reset) {
        setVehicles(newVehicles);
        setOffset(50);
      } else {
        setVehicles(prev => [...prev, ...newVehicles]);
        setOffset(prev => prev + 50);
      }

      // Check if there are more vehicles to load
      setHasMore(currentOffset + newVehicles.length < count);
    } catch (err) {
      console.error("❌ Error fetching vehicles:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVehicles(true);
  }, [partNumber]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchVehicles();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, offset]);

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter((v) =>
    Object.values(v).join(" ").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="vnp-modal-overlay">
      <div className="vnp-modal">
        {/* Header */}
        <div className="vnp-modal-header">
          <div className="vnp-modal-title">
            Compatible Vehicles ({totalCount})
          </div>
          <input
            type="text"
            placeholder="Search"
            className="vnp-modal-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="vnp-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Table Header */}
        <div className="vnp-table-container">
          <div className="vnp-modal-table-header">
            <span>Make</span>
            <span>Model</span>
            <span>Variant</span>
            <span>Fuel Type</span>
            <span>Year</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          <div className="vnp-modal-table-body">
            {filteredVehicles.length > 0 ? (
              <>
                {filteredVehicles.map((v, i) => (
                  <div 
                    key={i} 
                    className="vnp-modal-row"
                    onClick={() => handleVehicleClick(v)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{v.make}</span>
                    <span>{v.model}</span>
                    <span>{v.variant}</span>
                    <span>{v.fuelType}</span>
                    <span>{v.year}</span>
                  </div>
                ))}
                {/* Infinite scroll trigger */}
                {hasMore && !searchTerm && (
                  <div 
                    ref={observerTarget} 
                    style={{ height: '20px', padding: '10px', textAlign: 'center' }}
                  >
                    {loading && <span>Loading more...</span>}
                  </div>
                )}
              </>
            ) : loading && vehicles.length === 0 ? (
              <div
                className="vnp-no-results"
                style={{ padding: "20px", textAlign: "center" }}
              >
                Loading vehicles...
              </div>
            ) : (
              <div
                className="vnp-no-results"
                style={{ padding: "20px", textAlign: "center" }}
              >
                No vehicles found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- COMPONENT ---------------- */
const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFilter, setOpenFilter] = useState(null);
  const [uiAssets, setUiAssets] = useState({});

  // Fetch UI assets
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data); // backend returns {success: true, data: {...}}
      } catch (err) {
        console.error("❌ Failed to load UI assets", err);
      }
    };
    fetchUiAssets();
  }, []);

  // Helper to get full URL
  const getAssetUrl = (tagName) => {
    if (!uiAssets[tagName]) return "";
    return apiService.getAssetUrl(uiAssets[tagName]);
  };

  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showPopup, setShowPopup] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [vehicleCompatibilityList, setVehicleCompatibilityList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [vehicleCounts, setVehicleCounts] = useState({}); // Store count per partNumber
  const [loadingCounts, setLoadingCounts] = useState(true); // Loading state for vehicle counts

  // Product states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState({}); // Store stock info by partNumber

  // Backup states for restoring after vehicle selection
  const [previousProducts, setPreviousProducts] = useState([]);
  const [previousSearchFilters, setPreviousSearchFilters] = useState(null);
  const [isVehicleFiltered, setIsVehicleFiltered] = useState(false);

  const isInCart = (partNumber) =>
    cartItems.some((item) => item.partNumber === partNumber);

  // Get navigation flow data from state
  const {
    vehicle,
    make,
    model,
    brand,
    category,
    subCategory,
    aggregateName,
    subAggregateName,
    featureLabel, // Track which feature flow (Fast Movers, CNG, etc.)
    variant,
  } = location.state || {};

  // Generate cache key based on navigation context
  const cacheKey = `vnp_cache_${aggregateName}_${subAggregateName}_${make}_${model}`;

  // Initialize state from cache if available
  const getCachedState = () => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.error("❌ Error reading cache:", err);
      return null;
    }
  };

  const cachedState = getCachedState();

  const [filters, setFilters] = useState(cachedState?.filters || {
    year: "",
    fuelType: "",
    eta: "",
  });

  // Main search filter states (vnp-search-main)
  const [searchFilters, setSearchFilters] = useState(cachedState?.searchFilters || {
    make: "",
    model: "",
    variant: "",
    fuelType: "",
    year: "",
  });

  // Dropdown options for main search filters
  const [dropdownOptions, setDropdownOptions] = useState({
    makes: [],
    models: [],
    variants: [],
    fuelTypes: [],
    years: [],
  });

  // Loading states for dropdowns
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    makes: false,
    models: false,
    variants: false,
    fuelTypes: false,
    years: false,
  });

  const filterOptions = {
    brakeSystem: ["Disc Brake", "Drum Brake", "ABS", "Non-ABS"],
    price: ["Low to High", "High to Low"],
    eta: ["Same Day", "1-2 Days", "3-5 Days"],
    // sortBy: ["Relevance", "Price", "Brand"],
  };

  // Fetch products based on category and subcategory
  useEffect(() => {
    if (aggregateName && subAggregateName) {
      // Check if we have valid cached data (less than 5 minutes old)
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      if (cachedState && cachedState.timestamp && (Date.now() - cachedState.timestamp < CACHE_DURATION)) {
        console.log("✅ Using cached data");
        setProducts(cachedState.products || []);
        setStockData(cachedState.stockData || {});
        setVehicleCounts(cachedState.vehicleCounts || {});
        setLoadingCounts(false); // Counts already loaded from cache
        setLoading(false);
      } else {
        console.log("🔄 Fetching fresh data");
        fetchProducts();
      }
    }
  }, [aggregateName, subAggregateName]);

  // Initialize main search filters based on breadcrumb flow (only once on mount)
  useEffect(() => {
    if (!cachedState) {
      initializeSearchFilters();
    }
  }, []);

  // Initialize search filters based on breadcrumb navigation flow
  const initializeSearchFilters = async () => {
    console.log("🔄 Initializing search filters...");
    console.log("📍 Breadcrumb context:", { make, model, aggregateName, subAggregateName });

    // Always start with empty search filters and fetch all makes
    // Don't pre-fill from breadcrumbs - let user select from all available options
    if (aggregateName && subAggregateName) {
      console.log("✅ Fetching all makes for category (ignoring breadcrumb make/model)");
      
      // Reset all search filters
      setSearchFilters({
        make: "",
        model: "",
        variant: "",
        fuelType: "",
        year: "",
      });

      // Fetch all makes for the selected category and subcategory
      await fetchMakes(aggregateName, subAggregateName);
    }
  };

  // Fetch Makes (for Flow 2: Category -> SubCategory)
  const fetchMakes = async (aggregate, subAggregate) => {
    try {
      setLoadingDropdowns(prev => ({ ...prev, makes: true }));
      console.log("🔍 Fetching makes for:", { aggregate, subAggregate });

      const response = await fetchMasterList({
        masterType: "make",
        aggregate,
        subAggregate,
        limit: 0,
      });

      console.log("✅ Makes response:", response);

      const makes = response?.data?.map(item => item.masterName) || [];
      setDropdownOptions(prev => ({ ...prev, makes }));
      console.log("📋 Makes loaded:", makes.length);

    } catch (error) {
      console.error("❌ Error fetching makes:", error);
      setDropdownOptions(prev => ({ ...prev, makes: [] }));
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, makes: false }));
    }
  };

  // Fetch Models (for selected Make)
  const fetchModels = async (selectedMake) => {
    try {
      setLoadingDropdowns(prev => ({ ...prev, models: true }));
      console.log("🔍 Fetching models for make:", selectedMake);

      const response = await fetchMasterList({
        masterType: "model",
        make: selectedMake,
        aggregate: aggregateName,
        subAggregate: subAggregateName,
        limit: 0,
      });

      console.log("✅ Models response:", response);

      const models = response?.data?.map(item => item.masterName) || [];
      setDropdownOptions(prev => ({ ...prev, models }));
      console.log("📋 Models loaded:", models.length);

    } catch (error) {
      console.error("❌ Error fetching models:", error);
      setDropdownOptions(prev => ({ ...prev, models: [] }));
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, models: false }));
    }
  };

  // Fetch Variants (for selected Make and Model)
  const fetchVariants = async (selectedMake, selectedModel) => {
    try {
      setLoadingDropdowns(prev => ({ ...prev, variants: true }));
      console.log("🔍 Fetching variants for:", { selectedMake, selectedModel });

      const response = await fetchMasterList({
        masterType: "variant",
        make: selectedMake,
        model: selectedModel,
        aggregate: aggregateName || null,
        subAggregate: subAggregateName || null,
        limit: 0,
      });

      console.log("✅ Variants response:", response);

      const variants = response?.data?.map(item => item.masterName) || [];
      setDropdownOptions(prev => ({ ...prev, variants }));
      console.log("📋 Variants loaded:", variants.length);

    } catch (error) {
      console.error("❌ Error fetching variants:", error);
      setDropdownOptions(prev => ({ ...prev, variants: [] }));
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, variants: false }));
    }
  };

  // Fetch Fuel Types (for selected Variant)
  const fetchFuelTypes = async (selectedMake, selectedModel, selectedVariant) => {
    try {
      setLoadingDropdowns(prev => ({ ...prev, fuelTypes: true }));
      console.log("🔍 Fetching fuel types for:", { selectedMake, selectedModel, selectedVariant });

      const response = await fetchMasterList({
        masterType: "fuelType",
        make: selectedMake,
        model: selectedModel,
        variant: selectedVariant,
        aggregate: aggregateName || null,
        subAggregate: subAggregateName || null,
        limit: 0,
      });

      console.log("✅ Fuel Types response:", response);

      const fuelTypes = response?.data?.map(item => item.masterName) || [];
      setDropdownOptions(prev => ({ ...prev, fuelTypes }));
      console.log("📋 Fuel Types loaded:", fuelTypes.length);

    } catch (error) {
      console.error("❌ Error fetching fuel types:", error);
      setDropdownOptions(prev => ({ ...prev, fuelTypes: [] }));
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, fuelTypes: false }));
    }
  };

  // Fetch Years (for selected Fuel Type)
  const fetchYears = async (selectedMake, selectedModel, selectedVariant, selectedFuelType) => {
    try {
      setLoadingDropdowns(prev => ({ ...prev, years: true }));
      console.log("🔍 Fetching years for:", { selectedMake, selectedModel, selectedVariant, selectedFuelType });

      const response = await fetchMasterList({
        masterType: "year",
        make: selectedMake,
        model: selectedModel,
        variant: selectedVariant,
        aggregate: aggregateName || null,
        subAggregate: subAggregateName || null,
        limit: 0,
      });

      console.log("✅ Years response:", response);

      const years = response?.data?.map(item => item.masterName) || [];
      setDropdownOptions(prev => ({ ...prev, years }));
      console.log("📋 Years loaded:", years.length);

    } catch (error) {
      console.error("❌ Error fetching years:", error);
      setDropdownOptions(prev => ({ ...prev, years: [] }));
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, years: false }));
    }
  };

  // Handle Make selection (cascading)
  const handleMakeChange = async (selectedMake) => {
    console.log("🔄 Make changed:", selectedMake);
    setSearchFilters({
      make: selectedMake,
      model: "",
      variant: "",
      fuelType: "",
      year: "",
    });

    // Reset dependent dropdowns
    setDropdownOptions(prev => ({
      ...prev,
      models: [],
      variants: [],
      fuelTypes: [],
      years: [],
    }));

    if (selectedMake) {
      await fetchModels(selectedMake);
    }
  };

  // Handle Model selection (cascading)
  const handleModelChange = async (selectedModel) => {
    console.log("🔄 Model changed:", selectedModel);
    setSearchFilters(prev => ({
      ...prev,
      model: selectedModel,
      variant: "",
      fuelType: "",
      year: "",
    }));

    // Reset dependent dropdowns
    setDropdownOptions(prev => ({
      ...prev,
      variants: [],
      fuelTypes: [],
      years: [],
    }));

    if (selectedModel && searchFilters.make) {
      await fetchVariants(searchFilters.make, selectedModel);
    }
  };

  // Handle Variant selection (cascading)
  const handleVariantChange = async (selectedVariant) => {
    console.log("🔄 Variant changed:", selectedVariant);
    setSearchFilters(prev => ({
      ...prev,
      variant: selectedVariant,
      fuelType: "",
      year: "",
    }));

    // Reset dependent dropdowns
    setDropdownOptions(prev => ({
      ...prev,
      fuelTypes: [],
      years: [],
    }));

    if (selectedVariant && searchFilters.make && searchFilters.model) {
      await fetchFuelTypes(searchFilters.make, searchFilters.model, selectedVariant);
    }
  };

  // Handle Fuel Type selection (cascading)
  const handleFuelTypeChange = async (selectedFuelType) => {
    console.log("🔄 Fuel Type changed:", selectedFuelType);
    setSearchFilters(prev => ({
      ...prev,
      fuelType: selectedFuelType,
      year: "",
    }));

    // Reset dependent dropdowns
    setDropdownOptions(prev => ({
      ...prev,
      years: [],
    }));

    if (selectedFuelType && searchFilters.make && searchFilters.model && searchFilters.variant) {
      await fetchYears(searchFilters.make, searchFilters.model, searchFilters.variant, selectedFuelType);
    }
  };

  // Handle Year selection
  const handleYearChange = (selectedYear) => {
    console.log("🔄 Year changed:", selectedYear);
    setSearchFilters(prev => ({
      ...prev,
      year: selectedYear,
    }));
  };

  // Handle Search button click
  const handleSearch = () => {
    console.log("🔍 Search initiated with filters:", searchFilters);
    
    // Clear vehicle filtered state when new search is performed
    setIsVehicleFiltered(false);
    setPreviousProducts([]);
    setPreviousSearchFilters(null);
    
    // Refetch products with the new search filters
    if (aggregateName && subAggregateName) {
      fetchProductsWithFilters();
    }
  };

  // Restore previous state (back functionality)
  const handleRestorePreviousState = () => {
    console.log("↩️ Restoring previous state");
    
    if (previousProducts.length > 0 && previousSearchFilters) {
      setProducts(previousProducts);
      setSearchFilters(previousSearchFilters);
      setIsVehicleFiltered(false);
      setPreviousProducts([]);
      setPreviousSearchFilters(null);
      
      console.log("✅ Previous state restored");
    }
  };

  // Fetch products with search filters applied
  const fetchProductsWithFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching products with filters:", {
        aggregateName,
        subAggregateName,
        ...searchFilters,
      });

      const response = await apiService.post("/parts-list", {
        brandPriority: ["VALEO"],
        limit: 100,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: "0046",
        partNumber: null,
        model: searchFilters.model || null,
        brand: null,
        subAggregate: subAggregateName,
        aggregate: aggregateName,
        make: searchFilters.make || null,
        variant: searchFilters.variant || null,
        fuelType: searchFilters.fuelType || null,
        vehicle: null,
        year: searchFilters.year || null,
      });

      console.log("✅ Filtered Products API Response:", response);

      const partsData = Array.isArray(response?.data) ? response.data : [];

      const formattedProducts = partsData.map((item, index) => ({
        partNumber: item.partNumber || `PART-${index}`,
        name: item.itemDescription || "Product Name",
        brand: item.brandName || "Brand",
        price: parseFloat(item.listPrice) || 0,
        mrp: parseFloat(item.mrp) || 0,
        stockQty: 10,
        eta: "1-2 Days",
        image: getRandomImage(),
        originalData: item,
      }));

      console.log("📦 Filtered products:", formattedProducts);
      setProducts(formattedProducts);

      fetchStockForProducts(formattedProducts);
      fetchVehicleCountsForProducts(formattedProducts); // Non-blocking
    } catch (err) {
      console.error("❌ Error fetching filtered products:", err);
      setError(`Failed to load products: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching products for:", {
        aggregateName,
        subAggregateName,
        make,
        model,
      });

      const response = await apiService.post("/parts-list", {
        brandPriority: ["VALEO"],
        limit: 100,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: "0046",
        partNumber: null,
        model: model || null, // Include model from navigation state
        brand: null,
        subAggregate: subAggregateName, // From SubCategory selection
        aggregate: aggregateName, // From Category selection
        make: make || null, // Include make from navigation state
        variant: null,
        fuelType: null,
        vehicle: null,
        year: null,
      });

      console.log("Products API Response:", response);

      // Response structure: { success: true, message: "...", data: [...] }
      // Since apiService.post() returns res.data, response IS the data object
      const partsData = Array.isArray(response?.data) ? response.data : [];

      // Transform API data to match component structure
      const formattedProducts = partsData.map((item, index) => ({
        partNumber: item.partNumber || `PART-${index}`,
        name: item.itemDescription || "Product Name",
        brand: item.brandName || "Brand",
        price: parseFloat(item.listPrice) || 0,
        mrp: parseFloat(item.mrp) || 0,
        stockQty: 10, // Static
        eta: "1-2 Days", // Static
        image: getRandomImage(), // Static random image
        // Keep original data for reference
        originalData: item,
      }));

      console.log("Formatted products:", formattedProducts);
      setProducts(formattedProducts);

      // Fetch stock status for all products
      fetchStockForProducts(formattedProducts);
      
      // Fetch vehicle compatibility counts for all products (non-blocking)
      fetchVehicleCountsForProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          `Failed to load products: ${err.message || "Please try again."}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicle compatibility count for each product (in batches)
  const fetchVehicleCountsForProducts = async (productsList) => {
    setLoadingCounts(true);
    console.log("🔍 Fetching vehicle counts for", productsList.length, "products");
    
    const BATCH_SIZE = 5; // Fetch 5 at a time
    const batches = [];
    
    // Split into batches
    for (let i = 0; i < productsList.length; i += BATCH_SIZE) {
      batches.push(productsList.slice(i, i + BATCH_SIZE));
    }
    
    // Fetch batches progressively
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`🔄 Fetching batch ${i + 1}/${batches.length}`);
      
      const countPromises = batch.map(async (product) => {
        try {
          const response = await fetchVehicleListByPartNumber(product.partNumber, 1, 0);
          return {
            partNumber: product.partNumber,
            count: response?.count || 0,
          };
        } catch (err) {
          console.error(`❌ Error fetching vehicle count for ${product.partNumber}:`, err);
          return {
            partNumber: product.partNumber,
            count: 0,
          };
        }
      });
      
      try {
        const countResults = await Promise.all(countPromises);
        
        // Update state incrementally after each batch
        setVehicleCounts(prev => {
          const updated = { ...prev };
          countResults.forEach((result) => {
            updated[result.partNumber] = result.count;
          });
          return updated;
        });
        
        console.log(`✅ Batch ${i + 1} completed:`, countResults);
      } catch (err) {
        console.error("❌ Error fetching batch:", err);
      }
    }
    
    setLoadingCounts(false);
    console.log("🎉 All vehicle counts fetched");
  };

  // Fetch vehicle compatibility for a specific part number
  const fetchVehicleCompatibility = async (partNumber) => {
    try {
      console.log("🔍 Fetching vehicle compatibility for:", partNumber);
      
      const response = await apiService.post("/vehicle-list", {
        partNumber: partNumber,
        customerCode: "0046",
      });

      console.log("✅ Vehicle compatibility response:", response);

      const vehicleData = Array.isArray(response?.data) ? response.data : [];
      const formattedVehicles = vehicleData.map((v) => ({
        make: v.makeName || "",
        model: v.modelName || "",
        variant: v.variantName || "",
        fuelType: v.fuelType || "",
        year: v.year || "",
      }));

      setVehicleCompatibilityList(formattedVehicles);
      return formattedVehicles.length;
    } catch (error) {
      console.error("❌ Error fetching vehicle compatibility:", error);
      setVehicleCompatibilityList([]);
      return 0;
    }
  };

  // Handle compatibility click
  const handleCompatibilityClick = async (product) => {
    setSelectedProduct(product);
    await fetchVehicleCompatibility(product.partNumber);
    setShowCompatibility(true);
  };

  // Handle vehicle selection from compatibility modal
  const handleVehicleSelection = async (vehicle) => {
    console.log("🔍 Fetching products for selected vehicle:", vehicle);
    
    // Backup current state before filtering
    setPreviousProducts(products);
    setPreviousSearchFilters(searchFilters);
    setIsVehicleFiltered(true);
    
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        brandPriority: null,
        limit: 5000,
        offset: 0,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: "0046",
        partNumber: null,
        model: vehicle.model?.toUpperCase() || null,
        brand: null,
        subAggregate: null,
        aggregate: null,
        make: vehicle.make?.toUpperCase() || null,
        variant: vehicle.variant || null,
        fuelType: vehicle.fuelType?.toUpperCase() || null,
        vehicle: null,
        year: vehicle.year || null,
      };

      console.log("📤 Request body:", requestBody);

      const response = await apiService.post("/parts-list", requestBody);
      console.log("✅ Response:", response);

      const partsData = response?.data || [];
      const totalCount = response?.count || partsData.length;

      console.log("📦 Parts Data Count:", partsData.length);
      console.log("📊 Total Count:", totalCount);

      // Transform to component structure
      const transformedProducts = partsData.map((part, index) => ({
        id: index + 1,
        partNumber: part.partNumber,
        name: part.itemDescription,
        brand: part.brandName || "Unknown",
        price: parseFloat(part.listPrice) || 0,
        mrp: parseFloat(part.mrp) || 0,
        image: NoImage,
        eta: "1-2 Days",
        lineCode: part.lineCode,
        hsnCode: part.hsnCode,
        aggregate: part.aggregate,
        subAggregate: part.subAggregate,
        taxPercent: part.taxpercent,
      }));

      console.log("🔄 Transformed Products:", transformedProducts.length);

      // Separate myTVS and other products
      const myTvsProducts = transformedProducts.filter(
        (item) => item.brand.toUpperCase() === "MYTVS"
      );
      const otherProducts = transformedProducts.filter(
        (item) => item.brand.toUpperCase() !== "MYTVS"
      );

      console.log("✅ myTVS Products:", myTvsProducts.length);
      console.log("✅ Other Products:", otherProducts.length);

      setProducts(transformedProducts);
      
      // Auto-fill search controls with selected vehicle
      setSearchFilters({
        make: vehicle.make || "",
        model: vehicle.model || "",
        variant: vehicle.variant || "",
        fuelType: vehicle.fuelType || "",
        year: vehicle.year || "",
      });
      
      console.log("✅ Search controls auto-filled:", {
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        fuelType: vehicle.fuelType,
        year: vehicle.year,
      });

      // Fetch stock and vehicle counts in background
      fetchStockForProducts(transformedProducts);
      fetchVehicleCountsForProducts(transformedProducts);

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching products for vehicle:", err);
      setError("Failed to load products for selected vehicle. Please try again.");
      setProducts([]);
      setLoading(false);
    }
  };

  // Fetch stock status for all products
  const fetchStockForProducts = async (productsList) => {
    const stockPromises = productsList.map(async (product) => {
      try {
        const response = await apiService.post("/stock-list", {
          customerCode: "0046",
          partNumber: product.partNumber,
          inventoryName: null,
          entity: null,
          software: null,
          limit: 2,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: "lotAgeDate",
        });

        // Check if stock data exists and has quantity
        const stockItems = Array.isArray(response?.data) ? response.data : [];
        const totalQty = stockItems.reduce(
          (sum, item) => sum + (item.qty || 0),
          0,
        );

        return {
          partNumber: product.partNumber,
          inStock: totalQty > 0,
          quantity: totalQty,
        };
      } catch (err) {
        console.error(`Error fetching stock for ${product.partNumber}:`, err);
        return {
          partNumber: product.partNumber,
          inStock: false,
          quantity: 0,
        };
      }
    });

    try {
      const stockResults = await Promise.all(stockPromises);
      const stockMap = {};
      stockResults.forEach((result) => {
        stockMap[result.partNumber] = result;
      });
      setStockData(stockMap);
      console.log("Stock data fetched:", stockMap);
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  // Helper function to get random product image
  const getRandomImage = () => {
    const images = [NoImage];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Split products into categories based on brand
  // myTVS Recommended Products: Only myTVS brand products
  const recommendedProducts = products.filter(
    (product) =>
      product.brand?.toUpperCase().includes("MYTVS") ||
      product.brand?.toUpperCase().includes("MY TVS"),
  );

  // Other Products: All brands except myTVS
  const otherProducts = products.filter(
    (product) =>
      !(
        product.brand?.toUpperCase().includes("MYTVS") ||
        product.brand?.toUpperCase().includes("MY TVS")
      ),
  );

  // Aligned Products: Static data similar to PartNumber.jsx
  const alignedProducts = [
    {
      id: 3,
      partNumber: "A6732S233132",
      brand: "Valeo",
      name: "Brake Disc Pad",
      description: "Brake Disc Pad",
      price: 4205,
      mrp: 4080,
      image: NoImage,
      eta: "1-2 Days",
    },
    {
      id: 4,
      partNumber: "SA233663824",
      brand: "Mobil",
      name: "Brake Fluid",
      description: "Brake Fluid",
      price: 315,
      mrp: 468,
      image: NoImage,
      eta: "1-2 Days",
    },
    {
      id: 5,
      partNumber: "YD323S5632",
      brand: "Valeo",
      name: "Brake Fitting Kit",
      description: "Brake Fitting Kit",
      price: 5650,
      mrp: 6000,
      image: NoImage,
      eta: "1-2 Days",
    },
  ];

  useEffect(() => {
    const close = () => setOpenFilter(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Cache state when products or filters change
  useEffect(() => {
    if (products.length > 0) {
      const stateToCache = {
        products,
        filters,
        searchFilters,
        stockData,
        vehicleCounts,
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(stateToCache));
      } catch (err) {
        console.error("❌ Error caching state:", err);
      }
    }
  }, [products, filters, searchFilters, stockData, vehicleCounts, cacheKey]);

  // Restore scroll position on mount if coming from cache
  useEffect(() => {
    if (cachedState) {
      const scrollPos = sessionStorage.getItem(`${cacheKey}_scroll`);
      if (scrollPos) {
        setTimeout(() => window.scrollTo(0, parseInt(scrollPos)), 100);
      }
    }
  }, []);

  // Save scroll position before unmount
  useEffect(() => {
    return () => {
      sessionStorage.setItem(`${cacheKey}_scroll`, window.scrollY.toString());
    };
  }, [cacheKey]);

  const handleToggleCart = (product) => {
    if (isInCart(product.partNumber)) {
      removeFromCart(product.partNumber);
    } else {
      addToCart({
        partNumber: product.partNumber,
        itemDescription: product.name,
        listPrice: product.price,
        stockQty: product.stockQty,
        imageUrl: product.image || NoImage,
      });
    }
  };
  const SkeletonCard = () => (
    <div className="vnp-card vnp-skeleton-card">
      <div className="vnp-details">
        <div className="vnp-skeleton-line small"></div>
        <div className="vnp-skeleton-line medium"></div>
        <div className="vnp-skeleton-line large"></div>
        <div className="vnp-skeleton-line medium"></div>
      </div>

      <div className="vnp-image-placeholder">
        <div className="vnp-skeleton-img"></div>
        <div className="vnp-skeleton-btn"></div>
      </div>
    </div>
  );

  const SkeletonAlignedCard = () => (
    <div className="vnp-aligned-card vnp-skeleton-card">
      <div className="vnp-skeleton-img small"></div>
      <div style={{ flex: 1 }}>
        <div className="vnp-skeleton-line medium"></div>
        <div className="vnp-skeleton-line large"></div>
        <div className="vnp-skeleton-line small"></div>
      </div>
    </div>
  );

  const renderProductCard = (product) => {
    const stockInfo = stockData[product.partNumber];
    const isInStock = stockInfo?.inStock ?? true; // Default to true while loading

    return (
      <div className="vnp-card" key={product.partNumber}>
        <div className="vnp-details">
          <div className="vnp-badges">
            <span
              className={`vnp-badge vnp-badge-${product.brand.toLowerCase()}`}
              title={product.brand}
            >
              {product.brand}
            </span>
            <span
              className="vnp-badge vnp-badge-stock"
              style={{
                backgroundColor: isInStock ? "#e7f7ee" : "#f2d5d7",
                color: isInStock ? "#16a34a" : "#c3111e",
              }}
            >
              {isInStock ? "In Stock" : "Out of Stock"}
            </span>
            <span className="vnp-badge vnp-badge-eta">{product.eta}</span>
          </div>

          <p className="vnp-code">{product.partNumber}</p>
          <p className="vnp-name" title={product.name}>
            {product.name}
          </p>

          <div className="vnp-price-row">
            <span className="vnp-price-current">₹ {product.price}.00</span>
            <span className="vnp-price-original">₹ {product.mrp}.00</span>
          </div>
        </div>
        <div className="vnp-image-placeholder">
          <div className="vnp-image-wrapper">
            <img
              src={product.image || NoImage}
              alt={product.name}
              className="vnp-product-image"
            />
          </div>
          <div className="vnp-btn-wrapper">
            <button
              className={`vnp-btn-add ${
                isInCart(product.partNumber) ? "added" : ""
              }`}
              onClick={() => handleToggleCart(product)}
            >
              {isInCart(product.partNumber) ? "Added" : "Add"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vnp-container">
      {/* ---------- TOP SECTION ---------- */}
      <div className="vnp-top-row">
        {/* Navigation component auto-generates breadcrumbs based on route and state */}
        <Navigation />

        <div className="vnp-search-controls">
          <div className="vnp-search-main">
            <select 
              className="vnp-control-dropdown"
              value={searchFilters.make}
              onChange={(e) => handleMakeChange(e.target.value)}
              disabled={loadingDropdowns.makes}
            >
              <option value="">
                {loadingDropdowns.makes ? "Loading Makes..." : "Select Make"}
              </option>
              {dropdownOptions.makes.map((makeOption, index) => (
                <option key={index} value={makeOption}>
                  {makeOption}
                </option>
              ))}
            </select>

            <select 
              className="vnp-control-dropdown"
              value={searchFilters.model}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!searchFilters.make || loadingDropdowns.models}
            >
              <option value="">
                {loadingDropdowns.models ? "Loading Models..." : "Select Model"}
              </option>
              {dropdownOptions.models.map((modelOption, index) => (
                <option key={index} value={modelOption}>
                  {modelOption}
                </option>
              ))}
            </select>

            <select 
              className="vnp-control-dropdown"
              value={searchFilters.variant}
              onChange={(e) => handleVariantChange(e.target.value)}
              disabled={!searchFilters.model || loadingDropdowns.variants}
            >
              <option value="">
                {loadingDropdowns.variants ? "Loading Variants..." : "Select Variant"}
              </option>
              {dropdownOptions.variants.map((variantOption, index) => (
                <option key={index} value={variantOption}>
                  {variantOption}
                </option>
              ))}
            </select>

            <select 
              className="vnp-control-dropdown"
              value={searchFilters.fuelType}
              onChange={(e) => handleFuelTypeChange(e.target.value)}
              disabled={!searchFilters.variant || loadingDropdowns.fuelTypes}
            >
              <option value="">
                {loadingDropdowns.fuelTypes ? "Loading Fuel Types..." : "Select Fuel type"}
              </option>
              {dropdownOptions.fuelTypes.map((fuelOption, index) => (
                <option key={index} value={fuelOption}>
                  {fuelOption}
                </option>
              ))}
            </select>

            <select 
              className="vnp-control-dropdown"
              value={searchFilters.year}
              onChange={(e) => handleYearChange(e.target.value)}
              disabled={!searchFilters.fuelType || loadingDropdowns.years}
            >
              <option value="">
                {loadingDropdowns.years ? "Loading Years..." : "Select Year"}
              </option>
              {dropdownOptions.years.map((yearOption, index) => (
                <option key={index} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>

            <button 
              className="vnp-search-btn" 
              onClick={handleSearch}
            >
              Search
            </button>
            
            {isVehicleFiltered && (
              <button 
                className="vnp-search-btn" 
                onClick={handleRestorePreviousState}
                style={{ backgroundColor: "#ff6b6b", marginLeft: "0px" }}
              >
                Back
              </button>
            )}
          </div>

          <div className="vnp-search-filters">
            <div
              className="vnp-filter-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="vnp-filter-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFilter(openFilter === "year" ? null : "year");
                }}
              >
                <span>{filters.year || "Year"}</span>
                <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
              </div>
              {openFilter === "year" && (
                <div
                  className="vnp-filter-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["2024", "2023", "2022", "2021", "2020"].map((option) => (
                    <div
                      key={option}
                      className="vnp-filter-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters((prev) => ({ ...prev, year: option }));
                        setOpenFilter(null);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="vnp-filter-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="vnp-filter-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFilter(openFilter === "fuelType" ? null : "fuelType");
                }}
              >
                <span>{filters.fuelType || "Fuel type"}</span>
                <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
              </div>
              {openFilter === "fuelType" && (
                <div
                  className="vnp-filter-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["Petrol", "Diesel", "CNG", "Electric"].map((option) => (
                    <div
                      key={option}
                      className="vnp-filter-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters((prev) => ({ ...prev, fuelType: option }));
                        setOpenFilter(null);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="vnp-filter-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="vnp-filter-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFilter(openFilter === "eta" ? null : "eta");
                }}
              >
                <span>{filters.eta || "ETA"}</span>
                <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
              </div>
              {openFilter === "eta" && (
                <div
                  className="vnp-filter-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["Same Day", "1-2 Days", "3-5 Days"].map((option) => (
                    <div
                      key={option}
                      className="vnp-filter-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters((prev) => ({ ...prev, eta: option }));
                        setOpenFilter(null);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      {loading ? (
        <div className="vnp-loading">Loading products...</div>
      ) : error ? (
        <div className="vnp-error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="vnp-retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <div className="vnp-content-wrapper">
          <div className="vnp-left-section">
            {/* myTVS Recommended Products */}
            <Product1
              title="myTVS Recommended Products"
              products={recommendedProducts.map((product, index) => ({
                id: product.partNumber,
                partNumber: product.partNumber,
                cartId: `${product.partNumber}_${product.brand}_${index}`, // Unique cart identifier
                name: product.name,
                image: product.image || NoImage,
                brand: product.brand,
                price: product.price,
                mrp: product.mrp,
                stockStatus: stockData[product.partNumber]?.inStock ? "in stock" : "out of stock",
                deliveryTime: product.eta,
                compatibleVehicles: vehicleCounts[product.partNumber] || 0,
              }))}
              layout="horizontal"
              onAddToCart={(product) => {
                addToCart({
                  partNumber: product.cartId, // Use unique cartId
                  itemDescription: product.name,
                  listPrice: product.price,
                  imageUrl: product.image,
                  brand: product.brand,
                  mrp: product.mrp,
                  actualPartNumber: product.partNumber, // Keep original for reference
                });
              }}
              onCompatibilityClick={handleCompatibilityClick}
              isLoadingCounts={loadingCounts}
            />

            {/* Other Products */}
            <Product1
              title="Other Products"
              products={otherProducts.map((product, index) => ({
                id: product.partNumber,
                partNumber: product.partNumber,
                cartId: `${product.partNumber}_${product.brand}_${index}`, // Unique cart identifier
                name: product.name,
                image: product.image || NoImage,
                brand: product.brand,
                price: product.price,
                mrp: product.mrp,
                stockStatus: stockData[product.partNumber]?.inStock ? "in stock" : "out of stock",
                deliveryTime: product.eta,
                compatibleVehicles: vehicleCounts[product.partNumber] || 0,
              }))}
              layout="horizontal"
              onAddToCart={(product) => {
                addToCart({
                  partNumber: product.cartId, // Use unique cartId
                  itemDescription: product.name,
                  listPrice: product.price,
                  imageUrl: product.image,
                  brand: product.brand,
                  mrp: product.mrp,
                  actualPartNumber: product.partNumber, // Keep original for reference
                });
              }}
              onCompatibilityClick={handleCompatibilityClick}
              isLoadingCounts={loadingCounts}
            />
          </div>

          <div className="vnp-right-section">
            {/* Aligned Products */}
            <Product1
              title="Aligned Products"
              products={alignedProducts.map((product, index) => ({
                id: product.partNumber,
                partNumber: product.partNumber,
                cartId: `${product.partNumber}_${product.brand}_${index}`, // Unique cart identifier
                name: product.name,
                image: product.image || NoImage,
                brand: product.brand,
                price: product.price,
                mrp: product.mrp,
                stockStatus: stockData[product.partNumber]?.inStock ? "in stock" : "out of stock",
                deliveryTime: product.eta,
              }))}
              layout="vertical"
              onAddToCart={(product) => {
                addToCart({
                  partNumber: product.cartId, // Use unique cartId
                  itemDescription: product.name,
                  listPrice: product.price,
                  imageUrl: product.image,
                  brand: product.brand,
                  mrp: product.mrp,
                  actualPartNumber: product.partNumber, // Keep original for reference
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Compatibility Modal */}
      {showCompatibility && selectedProduct && (
        <CompatibilityModal
          onClose={() => setShowCompatibility(false)}
          partNumber={selectedProduct.partNumber}
          onVehicleSelect={handleVehicleSelection}
        />
      )}
    </div>
  );
};

export default Product;
