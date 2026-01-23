import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/vehicle_number_entry/VehicleNumberProduct.css";
import apiService, { fetchMasterList } from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";

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

  // Product states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState({}); // Store stock info by partNumber

  // See More/Less states
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const [showAllOther, setShowAllOther] = useState(false);

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
  } = location.state || {};

  const [filters, setFilters] = useState({
    year: "",
    fuelType: "",
    eta: "",
    // sortBy: "",
  });

  // Main search filter states (vnp-search-main)
  const [searchFilters, setSearchFilters] = useState({
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
      fetchProducts();
    }
  }, [aggregateName, subAggregateName, make, model]);

  // Initialize main search filters based on breadcrumb flow
  useEffect(() => {
    initializeSearchFilters();
  }, [make, model, aggregateName, subAggregateName]);

  // Initialize search filters based on breadcrumb navigation flow
  const initializeSearchFilters = async () => {
    console.log("🔄 Initializing search filters...");
    console.log("📍 Breadcrumb context:", { make, model, aggregateName, subAggregateName });

    // Flow 1: Make -> Model -> Category -> SubCategory (Vehicle-based navigation)
    if (make && model) {
      console.log("✅ Flow 1: Vehicle-based navigation (Make + Model)");
      
      // Set make and model from breadcrumbs
      setSearchFilters(prev => ({
        ...prev,
        make: make,
        model: model,
      }));

      // Fetch variants for the selected make and model
      await fetchVariants(make, model);
    }
    // Flow 2: Category -> SubCategory (Category-based navigation)
    else if (aggregateName && subAggregateName) {
      console.log("✅ Flow 2: Category-based navigation (Aggregate + SubAggregate)");
      
      // Reset all search filters
      setSearchFilters({
        make: "",
        model: "",
        variant: "",
        fuelType: "",
        year: "",
      });

      // Fetch makes for the selected category and subcategory
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
    
    // Refetch products with the new search filters
    if (aggregateName && subAggregateName) {
      fetchProductsWithFilters();
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

  // Aligned Products: Can keep same logic or remove if not needed
  const alignedProducts = [];

  useEffect(() => {
    const close = () => setOpenFilter(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

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
        <div className="vnp-breadcrumbs">
          <img
            src={getAssetUrl("LEFT ARROW")}
            alt="Back"
            onClick={() => navigate(-1)}
            className="vnp-breadcrumbs-icon"
          />
          <img
            src={getAssetUrl("HOME")}
            alt="Home"
            className="breadcrumb-link"
            style={{ cursor: "pointer", width: "20px", height: "20px" }}
            onClick={() => navigate("/home")}
            title="Home"
          />
     
          {make && (
            <>
              <img
                src={getAssetUrl("RIGHT ARROW")}
                alt=""
                width="15"
                height="15"
              />
              <span
                onClick={() =>
                  navigate("/MakeNew", {
                    state: {
                      variant: location.state?.variant,
                      featureLabel: location.state?.featureLabel,
                    },
                  })
                }
                style={{ cursor: "pointer" }}
                title={make}
              >
                {make}
              </span>
            </>
          )}
          {model && (
            <>
              <img
                src={getAssetUrl("RIGHT ARROW")}
                alt=""
                width="15"
                height="15"
              />
              <span
                onClick={() =>
                  navigate("/Model", {
                    state: {
                      make,
                      variant: location.state?.variant,
                      featureLabel: location.state?.featureLabel,
                    },
                  })
                }
                style={{ cursor: "pointer" }}
                title={model}
              >
                {model}
              </span>
            </>
          )}
          {(aggregateName || category) && (
            <>
              <img
                src={getAssetUrl("RIGHT ARROW")}
                alt=""
                width="15"
                height="15"
              />
              <span
                onClick={() =>
                  navigate("/Category", {
                    state: {
                      make,
                      model,
                      variant: location.state?.variant,
                      featureLabel: location.state?.featureLabel,
                    },
                  })
                }
                style={{ cursor: "pointer" }}
                title={aggregateName || category}
              >
                {aggregateName || category}
              </span>
            </>
          )}
          {(subAggregateName || subCategory) && (
            <>
              <img
                src={getAssetUrl("RIGHT ARROW")}
                alt=""
                width="15"
                height="15"
              />
              <span
                onClick={() =>
                  navigate("/sub_category", {
                    state: {
                      make,
                      model,
                      brand,
                      category: aggregateName || category,
                      aggregate: aggregateName || category,
                      aggregateName: aggregateName || category,
                      variant: location.state?.variant,
                      featureLabel: location.state?.featureLabel,
                    },
                  })
                }
                style={{ cursor: "pointer" }}
                title={subAggregateName || subCategory?.name || subCategory}
              >
                {subAggregateName || subCategory?.name || subCategory}
              </span>
            </>
          )}
        </div>

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
              disabled={!searchFilters.make}
            >
              Search
            </button>
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
        <div className="vnp-content-wrapper">
          {/* LEFT SECTION SKELETON */}
          <div className="vnp-left-section">
            <div className="vnp-section">
              <h2 className="vnp-section-title">myTVS Recommended Products</h2>

              <div className="vnp-cards-grid">
                {Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>

            <div className="vnp-section">
              <h2 className="vnp-section-title">Other Products</h2>

              <div className="vnp-cards-grid">
                {Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION SKELETON */}
          <div className="vnp-right-section">
            <div className="vnp-section-right">
              <h2 className="vnp-section-title">Aligned Products</h2>

              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonAlignedCard key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "red", fontSize: "16px", marginBottom: "20px" }}>
            {error}
          </p>
          <button
            onClick={fetchProducts}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="vnp-content-wrapper">
          <div className="vnp-left-section">
            <div className="vnp-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 className="vnp-section-title">
                  myTVS Recommended Products
                </h2>
                {recommendedProducts.length > 2 && (
                  <span
                    className="see-more"
                    onClick={() => setShowAllRecommended(!showAllRecommended)}
                    style={{
                      cursor: "pointer",
                      color: "#e55a2b",
                      fontSize: "14px",
                      marginRight: "35px",
                    }}
                  >
                    {showAllRecommended ? "See Less" : "See More"}
                  </span>
                )}
              </div>
              <div className="vnp-cards-grid">
                {recommendedProducts.length > 0 ? (
                  (showAllRecommended
                    ? recommendedProducts
                    : recommendedProducts.slice(0, 2)
                  ).map(renderProductCard)
                ) : (
                  <p>No recommended products found.</p>
                )}
              </div>
            </div>

            <div className="vnp-section">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 className="vnp-section-title">Other Products</h2>
                {otherProducts.length > 2 && (
                  <span
                    className="see-more"
                    onClick={() => setShowAllOther(!showAllOther)}
                    style={{
                      cursor: "pointer",
                      color: "#e55a2b",
                      fontSize: "14px",
                      marginRight: "35px",
                    }}
                  >
                    {showAllOther ? "See Less" : "See More"}
                  </span>
                )}
              </div>
              <div className="vnp-cards-grid">
                {otherProducts.length > 0 ? (
                  (showAllOther
                    ? otherProducts
                    : otherProducts.slice(0, 2)
                  ).map(renderProductCard)
                ) : (
                  <p>No other products found.</p>
                )}
              </div>
            </div>
          </div>

          <div className="vnp-right-section">
            <div className="vnp-section-right">
              <h2 className="vnp-section-title">Aligned Products</h2>

              {alignedProducts.length > 0 ? (
                alignedProducts.map((product) => {
                  const stockInfo = stockData[product.partNumber];
                  const isInStock = stockInfo?.inStock ?? true;
                  return (
                    <div className="vnp-aligned-card" key={product.partNumber}>
                      <div className="vnp-image-placeholder-small">
                        <img
                          src={product.image || NoImage}
                          alt={product.name}
                          width="100"
                        />
                      </div>

                      <div className="vnp-aligned-details">
                        <div className="vnp-badges">
                          <span
                            className="vnp-badge vnp-badge-valeo"
                            title={product.brand}
                          >
                            {product.brand}
                          </span>
                          <span
                            className="vnp-badge vnp-badge-stock"
                            style={{
                              backgroundColor: isInStock
                                ? "#e7f7ee"
                                : "#f2d5d7",
                              color: isInStock ? "#16a34a" : "#c3111e",
                            }}
                          >
                            {isInStock ? "In Stock" : "Out of Stock"}
                          </span>
                          <span className="vnp-badge vnp-badge-eta">
                            {product.eta}
                          </span>
                        </div>

                        <p className="vnp-code">{product.partNumber}</p>
                        <p className="vnp-name" title={product.name}>
                          {product.name}
                        </p>

                        <div className="vnp-price-row">
                          <span className="vnp-price-current">
                            ₹ {product.price}.00
                          </span>
                          <span className="vnp-price-original">
                            ₹ {product.mrp}.00
                          </span>

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
                })
              ) : (
                <p>No aligned products found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
