import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../../../services/apiservice";
import Search from "../../home/Search";
import { useCart } from "../../../context/CartContext";
import {
  fetchPartsListByPartNumber,
  fetchPartsListByItemName,
  fetchVehicleListByPartNumber,
} from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import Product1 from "./Product1";
import "../../../styles/search_by/partnumber/PartNumber.css";

const alignedProducts = [
  {
    id: 3,
    partNo: "A6732S233132",
    brand: "Valeo",
    description: "Brake Disc Pad",
    price: 4205,
    mrp: 4080,
    imageUrl: NoImage,
  },
  {
    id: 4,
    partNo: "SA233663824",

    brand: "Mobil",
    description: "Brake Fluid",
    price: 315,
    mrp: 468,
    imageUrl: NoImage,
  },
  {
    id: 5,
    partNo: "YD323S5632",

    brand: "Valeo",
    description: "Brake Fitting Kit",
    price: 5650,
    mrp: 6000,
    imageUrl: NoImage,
  },
];

/* ---------------- FILTER ---------------- */

const Filter = ({
  label,
  options = [],
  value = "",
  onChange,
  disabled = false,
}) => {
  return (
    <div className="pn-filter">
      <select
        className="pn-filter-select"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ---------------- PRODUCT CARD ---------------- */

const ProductCard = ({ item, onOpenCompatibility, vehicleCount }) => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const localPartNumber =
    item.localPartNumber || `${item.partNo}_${item.brand}`;
  const cartKey = `${item.partNo}_${item.brand}`;

  const isAdded = cartItems.some(
    (cartItem) => cartItem.partNumber === localPartNumber,
  );
  const handleCart = () => {
    if (isAdded) {
      removeFromCart(localPartNumber);
    } else {
      addToCart({
        ...item,
        partNumber: localPartNumber,
        listPrice: item.price,
        image: item.imageUrl, // ✅ IMAGE PASSED TO CART
      });
    }
  };

  return (
    <div className="pn-card">
      <div className="pn-card-row">
        <div className="pn-card-body">
          <div className="pn-tags">
            <span className="pn-tag-brand">{item.brand}</span>
            <span className="pn-tag-stock">{item.stock}</span>
            <span className="pn-tag-eta">{item.eta}</span>
          </div>

          <p className="pn-part">{item.partNo}</p>
          <p className="pn-name pn-truncate" title={item.description}>
            {item.description}
          </p>

          <div className="pn-price-row">
            <span className="pn-price">₹ {item.price}</span>
            <span className="pn-mrp">₹ {item.mrp}</span>
          </div>
        </div>
        <div className="pn-card-actions">
          <div>
            <img src={item.imageUrl} alt="" className="pn-product-img" />
          </div>
          <div>
            <button
              className={`pn-add-btn ${isAdded ? "pn-added" : ""}`}
              onClick={handleCart}
            >
              {isAdded ? "Added" : "Add"}
            </button>
          </div>
        </div>
      </div>

      <div className="pn-compatible-row" onClick={onOpenCompatibility}>
        <div>
          {" "}
          Compatible with{" "}
          <b className="pn-count-vehicle">{vehicleCount || 0}</b> vehicles
        </div>
        <span className="pn-arrow">›</span>
      </div>
    </div>
  );
};
const CompatibilityModal = ({ onClose, partNumber }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const observerTarget = useRef(null);

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
    <div className="pn-modal-overlay">
      <div className="pn-modal">
        {/* Header */}
        <div className="pn-modal-header">
          <div className="pn-modal-title">
            Compatible Vehicles ({totalCount})
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

        {/* Table Header */}
        <div className="pn-table-container">
          <div className="pn-modal-table-header">
            <span>Make</span>
            <span>Model</span>
            <span>Variant</span>
            <span>Fuel Type</span>
            <span>Year</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          <div className="pn-modal-table-body">
            {filteredVehicles.length > 0 ? (
              <>
                {filteredVehicles.map((v, i) => (
                  <div key={i} className="pn-modal-row">
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
                className="pn-no-results"
                style={{ padding: "20px", textAlign: "center" }}
              >
                Loading vehicles...
              </div>
            ) : (
              <div
                className="pn-no-results"
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

/* ---------------- MAIN COMPONENT ---------------- */

const PartNumber = () => {
  const { state } = useLocation();
  const rawSearchKey = state?.partNumber || "";

  // Detection functions
  const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9-]+$/i.test(value); // ✅ Added hyphen support
  const isServiceType = (value) => /^[A-Z\s]+$/i.test(value);
  const isAggregateOrSubAggregate = (value) => /^[A-Z\s]+$/i.test(value); // Same pattern as service type

  // Keep original case for item name, uppercase for part number and aggregate
  const searchKey = isPartNumber(rawSearchKey.replace(/\s+/g, ""))
    ? rawSearchKey.toUpperCase()
    : rawSearchKey;

  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState(""); // Track selected product for modal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [otherBrandProducts, setOtherBrandProducts] = useState([]);
  const [originalRecommendedProducts, setOriginalRecommendedProducts] = useState([]);
  const [originalOtherBrandProducts, setOriginalOtherBrandProducts] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicleCompatibilityList, setVehicleCompatibilityList] = useState([]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [totalPartsCount, setTotalPartsCount] = useState(0); // Total count from API
  const [vehicleCounts, setVehicleCounts] = useState({}); // Store count per partNumber
  const [loadingCounts, setLoadingCounts] = useState(true); // Loading state for vehicle counts
  const [openFilter, setOpenFilter] = useState(null);
  const [uiAssets, setUiAssets] = useState({});
  const [stockData, setStockData] = useState({}); // Store stock info by partNumber

  // Handler for opening compatibility modal
  const handleCompatibilityClick = (product) => {
    setSelectedPartNumber(product.partNumber);
    setShowCompatibility(true);
  };

  // Fetch UI assets
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets");
        setUiAssets(assets.data);
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

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredCompatibility, setFilteredCompatibility] = useState([]);

  // Right filters state
  const [rightFilters, setRightFilters] = useState({
    year: "",
    fuelType: "",
    eta: "",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openFilter) setOpenFilter(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openFilter]);

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
          const response = await fetchVehicleListByPartNumber(product.partNo, 1, 0);
          return {
            partNumber: product.partNo,
            count: response?.count || 0,
          };
        } catch (err) {
          console.error(`❌ Error fetching vehicle count for ${product.partNo}:`, err);
          return {
            partNumber: product.partNo,
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

  // Fetch stock status for all products
  const fetchStockForProducts = async (productsList) => {
    const stockPromises = productsList.map(async (product) => {
      try {
        const response = await apiService.post("/stock-list", {
          customerCode: "0046",
          partNumber: product.partNo,
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
          partNumber: product.partNo,
          inStock: totalQty > 0,
          quantity: totalQty,
        };
      } catch (err) {
        console.error(`Error fetching stock for ${product.partNo}:`, err);
        return {
          partNumber: product.partNo,
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
      console.log("✅ Stock data fetched:", stockMap);
    } catch (err) {
      console.error("❌ Error fetching stock data:", err);
    }
  };

const applyCompatibilityFilter = async () => {
  console.log("🔍 Applying compatibility filter...");
  console.log("📋 Selected Filters:", {
    make: selectedMake,
    model: selectedModel,
    variant: selectedVariant,
    fuelType: selectedFuel,
    year: selectedYear,
  });

  // Validate that at least one filter is selected
  if (!selectedMake && !selectedModel && !selectedVariant && !selectedFuel && !selectedYear) {
    console.log("❌ No filters selected");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Fetch filtered products from parts-list API
    console.log("➡️ Fetching filtered products...");
    
    const requestBody = {
      brandPriority: null,
      limit: 100,
      offset: 0,
      sortOrder: "ASC",
      fieldOrder: null,
      customerCode: "0046",
      partNumber: null,
      model: selectedModel || null,
      brand: null,
      subAggregate: null,
      aggregate: null,
      make: selectedMake || null,
      variant: selectedVariant || null,
      fuelType: selectedFuel || null,
      vehicle: null,
      year: selectedYear || null,
    };

    console.log("📤 Request Body:", requestBody);

    const response = await apiService.post("/parts-list", requestBody);
    
    console.log("✅ Filtered Products Response:", response);

    const partsData = response?.data || [];
    console.log("📦 Filtered Parts Count:", partsData.length);

    // Transform API data to match component structure
    const transformedParts = partsData.map((part, index) => ({
      id: index + 1,
      brand: part.brandName || "Unknown",
      partNo: part.partNumber,
      description: part.itemDescription,
      price: parseFloat(part.listPrice) || 0,
      mrp: parseFloat(part.mrp) || 0,
      eta: "1-2 Days",
      stock: "In stock",
      vehicles: 12,
      imageUrl: NoImage,
      lineCode: part.lineCode,
      hsnCode: part.hsnCode,
      aggregate: part.aggregate,
      subAggregate: part.subAggregate,
      taxPercent: part.taxpercent,
    }));

    console.log("🔄 Transformed Filtered Parts:", transformedParts);

    // Separate myTVS and other brands
    const myTvsProducts = transformedParts.filter(
      (item) => item.brand.toUpperCase() === "MYTVS",
    );
    const otherProducts = transformedParts.filter(
      (item) => item.brand.toUpperCase() !== "MYTVS",
    );

    console.log("✅ Filtered myTVS Products:", myTvsProducts.length);
    console.log("✅ Filtered Other Brand Products:", otherProducts.length);

    // Update the products displayed on the page
    setRecommendedProducts(myTvsProducts);
    setOtherBrandProducts(otherProducts);
    
    // Hide loading immediately after products are set
    setLoading(false);

    // Fetch stock data and vehicle counts in background (non-blocking)
    fetchStockForProducts(transformedParts);
    fetchVehicleCountsForProducts(transformedParts);

    // Also filter the vehicle compatibility list for the modal
    let filteredVehicles = [...vehicleCompatibilityList];

    if (selectedMake) {
      filteredVehicles = filteredVehicles.filter(v => v.make === selectedMake);
    }

    if (selectedModel) {
      filteredVehicles = filteredVehicles.filter(v => v.model === selectedModel);
    }

    if (selectedVariant) {
      filteredVehicles = filteredVehicles.filter(v => v.variant === selectedVariant);
    }

    if (selectedFuel) {
      filteredVehicles = filteredVehicles.filter(v => v.fuelType === selectedFuel);
    }

    if (selectedYear) {
      filteredVehicles = filteredVehicles.filter(v => String(v.year) === String(selectedYear));
    }

    setFilteredCompatibility(filteredVehicles);
    setVehicleCount(response?.count || partsData.length);

    console.log("🎉 Filter applied successfully!");

  } catch (err) {
    console.error("❌ Error fetching filtered products:", err);
    setError("Failed to load filtered products. Please try again.");
    setRecommendedProducts([]);
    setOtherBrandProducts([]);
    setLoading(false);
  }
};

  const unique = (arr, key) => [
    ...new Set(arr.map((item) => item[key]).filter(Boolean)),
  ];

  const makes = unique(vehicleList, "make");

  const models = unique(
    vehicleList.filter((v) => !selectedMake || v.make === selectedMake),
    "model",
  );

  const variants = unique(
    vehicleList.filter(
      (v) =>
        (!selectedMake || v.make === selectedMake) &&
        (!selectedModel || v.model === selectedModel),
    ),
    "variant",
  );

  const fuelTypes = unique(
    vehicleList.filter(
      (v) =>
        (!selectedMake || v.make === selectedMake) &&
        (!selectedModel || v.model === selectedModel) &&
        (!selectedVariant || v.variant === selectedVariant),
    ),
    "fuelType",
  );

  const years = unique(
    vehicleList.filter(
      (v) =>
        (!selectedMake || v.make === selectedMake) &&
        (!selectedModel || v.model === selectedModel) &&
        (!selectedVariant || v.variant === selectedVariant) &&
        (!selectedFuel || v.fuelType === selectedFuel),
    ),
    "year",
  );

  // Fetch parts data from API
  useEffect(() => {
    const fetchPartsData = async () => {
      if (!searchKey) {
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Detect search type
        const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9-]+$/i.test(value); // ✅ Added hyphen support
        const isPartNumberSearch = isPartNumber(searchKey.replace(/\s+/g, ""));
        const isAggregateSearch = !isPartNumberSearch && isAggregateOrSubAggregate(searchKey);

        console.log("🔍 Search Key:", searchKey);
        console.log("🔍 Is Part Number Search:", isPartNumberSearch);
        console.log("🔍 Is Aggregate/SubAggregate Search:", isAggregateSearch);

        let response;
        if (isPartNumberSearch) {
          // Search by part number
          console.log("➡️ Calling fetchPartsListByPartNumber with:", searchKey);
          response = await fetchPartsListByPartNumber(searchKey);
        } else if (isAggregateSearch) {
          // Search by aggregate or subAggregate
          console.log("➡️ Searching by Aggregate/SubAggregate:", searchKey);
          const normalizedKey = searchKey.toUpperCase();
          
          // First try searching as aggregate
          let requestBody = {
            brandPriority: null,
            limit: 5000,
            offset: 0,
            sortOrder: "ASC",
            fieldOrder: null,
            customerCode: "0046",
            partNumber: null,
            model: null,
            brand: null,
            subAggregate: null,
            aggregate: normalizedKey,
            make: null,
            variant: null,
            fuelType: null,
            vehicle: null,
            year: null,
          };
          
          console.log("📤 Trying Aggregate search:", requestBody);
          response = await apiService.post("/parts-list", requestBody);
          
          // If no results, try searching as subAggregate
          if (!response?.data || response.data.length === 0) {
            console.log("⚠️ No results for Aggregate, trying SubAggregate...");
            requestBody = {
              ...requestBody,
              aggregate: null,
              subAggregate: normalizedKey,
            };
            console.log("📤 Trying SubAggregate search:", requestBody);
            response = await apiService.post("/parts-list", requestBody);
          }
          
          console.log("✅ Aggregate/SubAggregate search completed, found:", response?.data?.length || 0, "items");
        } else {
          // Search by item name/description
          console.log("➡️ Calling fetchPartsListByItemName with:", searchKey);
          response = await fetchPartsListByItemName(searchKey);
        }

        console.log("✅ API Response:", response);
        const partsData = response?.data || [];
        const totalCount = response?.count || partsData.length;
        console.log("📦 Parts Data Count:", partsData.length);
        console.log("📊 Total Count from API:", totalCount);
        
        // Store the total count
        setTotalPartsCount(totalCount);

        // Transform API data to match component structure
        const transformedParts = partsData.map((part, index) => ({
          id: index + 1,
          brand: part.brandName || "Unknown",
          partNo: part.partNumber,
          description: part.itemDescription,
          price: parseFloat(part.listPrice) || 0,
          mrp: parseFloat(part.mrp) || 0,
          eta: "1-2 Days",
          stock: "In stock",
          vehicles: 12, // Default value, update if API provides this
          imageUrl: NoImage,
          lineCode: part.lineCode,
          hsnCode: part.hsnCode,
          aggregate: part.aggregate,
          subAggregate: part.subAggregate,
          taxPercent: part.taxpercent,
        }));

        console.log("🔄 Transformed Parts:", transformedParts);

        // Separate myTVS and other brands
        const myTvsProducts = transformedParts.filter(
          (item) => item.brand.toUpperCase() === "MYTVS",
        );
        const otherProducts = transformedParts.filter(
          (item) => item.brand.toUpperCase() !== "MYTVS",
        );

        console.log("✅ myTVS Products:", myTvsProducts.length);
        console.log("✅ Other Brand Products:", otherProducts.length);
        console.log("📋 Other Products Details:", otherProducts);

        setRecommendedProducts(myTvsProducts);
        setOtherBrandProducts(otherProducts);
        // Store original products for reset functionality
        setOriginalRecommendedProducts(myTvsProducts);
        setOriginalOtherBrandProducts(otherProducts);
        
        // Hide loading immediately after products are set
        setLoading(false);

        // Fetch stock data and vehicle counts in background (non-blocking)
        fetchStockForProducts(transformedParts);
        fetchVehicleCountsForProducts(transformedParts);

      } catch (err) {
        console.error("Error fetching parts data:", err);
        setError("Failed to load parts. Please try again.");
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
        setLoading(false);
      }
    };

    fetchPartsData();
  }, [searchKey]);

  // Fetch vehicle compatibility data
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!searchKey) {
        setVehicleCompatibilityList([]);
        setVehicleCount(0);
        return;
      }

      try {
        const response = await fetchVehicleListByPartNumber(searchKey, 100);
        const vehicles = response?.data || [];
        setVehicleCompatibilityList(vehicles);
        setVehicleCount(response?.count || vehicles.length);
      } catch (err) {
        console.error("Error fetching vehicle compatibility:", err);
        setVehicleCompatibilityList([]);
        setVehicleCount(0);
      }
    };

    fetchVehicleData();
  }, [searchKey]);

  // Fetch all vehicles for filter dropdowns
  useEffect(() => {
    const fetchAllVehicles = async () => {
      if (!searchKey) {
        setVehicleList([]);
        return;
      }

      try {
        // Fetch all vehicles without filters to populate dropdowns
        const requestBody = {
          limit: 100000, // Get all vehicles
          offset: 0,
          sortOrder: "ASC",
          customerCode: "0046",
          brand: null,
          partNumber: [searchKey],
          aggregate: null,
          subAggregate: null,
          make: null,
          model: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        };

        const response = await apiService.post("/vehicle-list", requestBody);
        const vehicles = response?.data || [];
        setVehicleList(vehicles);
      } catch (err) {
        console.error("Error fetching vehicles for filters:", err);
        setVehicleList([]);
      }
    };

    fetchAllVehicles();
  }, [searchKey]);

  return (
    <div className="pn-wrapper">
      <Search />

      <div className="pn-body">
        <div className="pn-search-key">
          Search Key : <b>{searchKey}</b>
          {totalPartsCount > 0 && (
            <span style={{ marginLeft: "10px", color: "#666" }}>
              Compatible with <b style={{ color: "#000" }}>{totalPartsCount.toLocaleString()}</b> items
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
                setSelectedModel("");
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
              }}
            >
              <option value="">Select Make</option>
              {makes.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedModel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedModel(val);
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
              }}
              disabled={!selectedMake}
            >
              <option value="">Select Model</option>
              {models.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedVariant}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVariant(val);
                setSelectedFuel("");
                setSelectedYear("");
              }}
              disabled={!selectedModel}
            >
              <option value="">Select Variant</option>
              {variants.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedFuel}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFuel(val);
                setSelectedYear("");
              }}
              disabled={!selectedVariant}
            >
              <option value="">Select Fuel type</option>
              {fuelTypes.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select 
              className="pn-control-dropdown"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedFuel}
            >
              <option value="">Select Year</option>
              {years.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <button
              className="pn-search-btn"
              onClick={applyCompatibilityFilter}
            >
              Search
            </button>

            <button
              className="pn-clear-btn"
              onClick={() => {
                console.log("🧹 Clearing filters...");
                // Clear left filter selections
                setSelectedMake("");
                setSelectedModel("");
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
                // Clear right filter selections
                setRightFilters({
                  year: "",
                  fuelType: "",
                  eta: "",
                });
                // Restore original products
                setRecommendedProducts(originalRecommendedProducts);
                setOtherBrandProducts(originalOtherBrandProducts);
                console.log("✅ Filters cleared and products restored to original state");
              }}
            >
              Clear
            </button>
          </div>

          <div className="pn-right-filters">
            <div
              className="pn-filter-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pn-filter-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFilter(openFilter === "year" ? null : "year");
                }}
              >
                <span>{rightFilters.year || "Year"}</span>
                <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
              </div>
              {openFilter === "year" && (
                <div
                  className="pn-filter-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["2024", "2023", "2022", "2021", "2020"].map((option) => (
                    <div
                      key={option}
                      className="pn-filter-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightFilters((prev) => ({ ...prev, year: option }));
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
              className="pn-filter-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pn-filter-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFilter(openFilter === "fuelType" ? null : "fuelType");
                }}
              >
                <span>{rightFilters.fuelType || "Fuel type"}</span>
                <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
              </div>
              {openFilter === "fuelType" && (
                <div
                  className="pn-filter-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["Petrol", "Diesel", "CNG", "Electric"].map((option) => (
                    <div
                      key={option}
                      className="pn-filter-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightFilters((prev) => ({ ...prev, fuelType: option }));
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
              className="pn-filter-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="pn-filter-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFilter(openFilter === "eta" ? null : "eta");
                }}
              >
                <span>{rightFilters.eta || "ETA"}</span>
                <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
              </div>
              {openFilter === "eta" && (
                <div
                  className="pn-filter-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  {["Same Day", "1-2 Days", "3-5 Days"].map((option) => (
                    <div
                      key={option}
                      className="pn-filter-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightFilters((prev) => ({ ...prev, eta: option }));
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

        {/* CONTENT */}
        <div className="pn-content">
          {/* ================= LOADING ================= */}
          {loading && (
            <div className="pn-loading">Loading products...</div>
          )}

          {/* ================= ERROR ================= */}
          {!loading && error && (
            <div className="pn-error">
              <p>{error}</p>
            </div>
          )}

          {/* ================= DATA ================= */}
          {!loading && !error && (
            <>
              {/* LEFT SECTION - 75% */}
              <div className="pn-left">
                {/* myTVS Recommended Products */}
                <Product1
                  title="myTVS Recommended Products"
                  products={recommendedProducts.map((item, index) => ({
                    id: item.id,
                    partNumber: item.partNo,
                    cartId: `${item.partNo}_${item.brand}_${index}`, // Unique cart identifier
                    name: item.description,
                    image: item.imageUrl,
                    brand: item.brand,
                    price: item.price,
                    mrp: item.mrp,
                    stockStatus: stockData[item.partNo]?.inStock ? "in stock" : "out of stock",
                    deliveryTime: item.eta,
                    compatibleVehicles: vehicleCounts[item.partNo] || 0,
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
                  products={otherBrandProducts.map((item, index) => ({
                    id: item.id,
                    partNumber: item.partNo,
                    cartId: `${item.partNo}_${item.brand}_${index}`, // Unique cart identifier
                    name: item.description,
                    image: item.imageUrl,
                    brand: item.brand,
                    price: item.price,
                    mrp: item.mrp,
                    stockStatus: stockData[item.partNo]?.inStock ? "in stock" : "out of stock",
                    deliveryTime: item.eta,
                    compatibleVehicles: vehicleCounts[item.partNo] || 0,
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

              {/* RIGHT SECTION - 25% */}
              <div className="pn-right">
                {/* Aligned Products */}
                <Product1
                  title="Aligned Products"
                  products={alignedProducts.map((item, index) => ({
                    id: item.id,
                    partNumber: item.partNo,
                    cartId: `${item.partNo}_${item.brand}_${index}`, // Unique cart identifier
                    name: item.description,
                    image: item.imageUrl,
                    brand: item.brand,
                    price: item.price,
                    mrp: item.mrp,
                    stockStatus: "in stock",
                    deliveryTime: "1-2 Days",
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
            </>
          )}
        </div>
      </div>

      {/* ✅ MODAL MUST BE INSIDE RETURN */}
      {showCompatibility && selectedPartNumber && (
        <CompatibilityModal
          onClose={() => {
            setShowCompatibility(false);
            setSelectedPartNumber("");
          }}
          partNumber={selectedPartNumber}
        />
      )}
    </div>
  );
};

export default PartNumber;
