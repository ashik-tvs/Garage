import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Search from "../../home/Search";
import Navigation from "../../Navigation/Navigation";
import apiService from "../../../services/apiservice";
import { masterListAPI, partsListAPI, stockListAPI, generalSearchAPI } from "../../../services/api";
import { debugNavigationState } from "../../../utils/navigationHelper";

import "../../../styles/search_by/service_type/ServiceTypeProduct.css";
import "../../../styles/skeleton/skeleton.css";
import NoImage from "../../../assets/No Image.png";

const ServiceTypeProduct = () => {
  const location = useLocation();
  const { state } = location;
  const searchKey = (state?.serviceType || "").toUpperCase();

  // Debug navigation state in development
  useEffect(() => {
    debugNavigationState("ServiceTypeProduct", state, location);
  }, [state, location]);

  /* -------------------- STATE -------------------- */
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [stockData, setStockData] = useState({}); // Store stock info by partNumber

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState(0); // Track last submission time

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [years, setYears] = useState([]);
  const [fuelType, setFuelType] = useState([]);

  const [filters, setFilters] = useState({
    make: null,
    model: null,
    variant: null,
    fuelType: null,
    year: null,
  });
  const fetchFilterData = async ({ masterType, make, model }) => {
    try {
      const payload = {
        partNumber: null,
        sortOrder: "ASC",
        customerCode: "0046",
        aggregate: null,
        brand: null,
        fuelType: null,
        limit: 500,
        make: make || null,
        masterType,
        model: model || null,
        offset: 0,
        primary: false,
        subAggregate: null,
        variant: null,
        year: null,
      };

      const res = await masterListAPI(payload);

      if (Array.isArray(res?.data)) {
        return res.data;
      }
      return [];
    } catch (err) {
      console.error(`Filter API failed for ${masterType}`, err);
      return [];
    }
  };
  useEffect(() => {
    loadMakes();
  }, []);

  const loadMakes = async () => {
    const data = await fetchFilterData({ masterType: "make" });

    const formatted = data.map((item) => ({
      label: item.masterName,
      value: item.masterName,
    }));

    setMakes(formatted);
  };
  useEffect(() => {
    if (!filters.make) return;

    setModels([]);
    setVariants([]);

    loadModels(filters.make);
  }, [filters.make]);

  const loadModels = async (make) => {
    const data = await fetchFilterData({
      masterType: "model",
      make,
    });

    const formatted = data.map((item) => ({
      label: item.masterName,
      value: item.masterName,
    }));

    setModels(formatted);
  };
  useEffect(() => {
    if (!filters.make || !filters.model) return;

    setVariants([]);

    loadVariants(filters.make, filters.model);
  }, [filters.model]);

  const loadVariants = async (make, model) => {
    const data = await fetchFilterData({
      masterType: "variant",
      make,
      model,
    });

    const formatted = data.map((item) => ({
      label: item.masterName,
      value: item.masterName,
    }));

    setVariants(formatted);
  };
  useEffect(() => {
    if (!filters.make || !filters.model || !filters.variant) return;

    loadFuelTypes(filters.make, filters.model, filters.variant);
  }, [filters.variant]);

  const loadFuelTypes = async (make, model, variant) => {
    const data = await fetchFilterData({
      masterType: "fuelType",
      make,
      model,
    });

    const formatted = data.map((item) => ({
      label: item.masterName,
      value: item.masterName,
    }));

    setFuelType(formatted);
  };
  useEffect(() => {
    if (!filters.fuelType) return;

    loadYears(filters.make, filters.model);
  }, [filters.fuelType]);

  const loadYears = async (make, model) => {
    const data = await fetchFilterData({
      masterType: "year",
      make,
      model,
    });

    const formatted = data.map((item) => ({
      label: item.masterName,
      value: item.masterName,
    }));

    setYears(formatted);
  };

  /* -------------------- PARTS LIST API -------------------- */
  // Fetch stock status for all products
  const fetchStockForProducts = async (productsList) => {
    if (!productsList || productsList.length === 0) return;

    const allProducts = [];

    // Collect all products from the grouped structure
    productsList.forEach((part) => {
      if (part.mytvs) {
        allProducts.push({
          partNumber: part.mytvs.code,
          productId: part.mytvs.id,
        });
      }
      part.others.forEach((product) => {
        allProducts.push({
          partNumber: product.code,
          productId: product.id,
        });
      });
    });

    const stockPromises = allProducts.map(async (product) => {
      try {
        const response = await stockListAPI({
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
          productId: product.productId,
          inStock: totalQty > 0,
          quantity: totalQty,
          stockItems: stockItems, // Store detailed stock info
        };
      } catch (err) {
        console.error(`Error fetching stock for ${product.partNumber}:`, err);
        return {
          partNumber: product.partNumber,
          productId: product.productId,
          inStock: false,
          quantity: 0,
          stockItems: [],
        };
      }
    });

    try {
      const stockResults = await Promise.all(stockPromises);
      const stockMap = {};
      stockResults.forEach((result) => {
        stockMap[result.partNumber] = result;
        stockMap[result.productId] = result; // Also map by product ID for easy access
      });
      setStockData(stockMap);
      console.log("🔹 Stock data fetched:", stockMap);
    } catch (err) {
      console.error("❌ Error fetching stock data:", err);
    }
  };

  const loadPartsList = async (customFilters = {}) => {
    console.log("🔹 loadPartsList called");
    console.log("🔹 Current state:", state);
    console.log("🔹 Current filters:", filters);
    console.log("🔹 Custom filters:", customFilters);

    // Build payload structure that matches the working parts-list API format
    const payload = {
      brandPriority: null,
      limit: 100,
      offset: 0,
      sortOrder: "ASC",
      fieldOrder: null,
      customerCode: "0046",
      partNumber: null,

      // Vehicle parameters - use state data first, then filters
      make: state?.make || customFilters.make || filters.make || null,
      model: state?.model || customFilters.model || filters.model || null,
      variant: state?.variant || customFilters.variant || filters.variant || null,
      fuelType: state?.fuelType || customFilters.fuelType || filters.fuelType || null,
      year: state?.year || customFilters.year || filters.year || null,
      vehicle: null,

      // Category parameters from navigation state
      aggregate: state?.category || state?.aggregate || null,
      subAggregate: state?.subCategory || state?.subAggregate || null,
      brand: null
    };

    console.log("📤 Parts-list API payload:", payload);
    console.log("📤 Payload details:", {
      hasVehicleData: !!(payload.make && payload.model),
      hasCategoryData: !!(payload.aggregate || payload.subAggregate),
      serviceType: state?.serviceType,
      vehicleInfo: `${payload.make || ''} ${payload.model || ''} ${payload.variant || ''} ${payload.fuelType || ''} ${payload.year || ''}`.trim()
    });

    try {
      setLoading(true);
      const res = await partsListAPI(payload);
      console.log("📥 Parts-list API response:", res);

      // Handle different response structures
      let apiData = [];

      if (res?.success && Array.isArray(res.data)) {
        apiData = res.data;
      } else if (Array.isArray(res?.data)) {
        apiData = res.data;
      } else if (res?.data?.success && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res)) {
        apiData = res;
      }

      console.log("🔍 Extracted API data:", apiData);
      console.log("🔍 API data length:", apiData.length);

      if (apiData.length > 0) {
        const formatted = formatApiData(apiData);
        console.log("✅ Formatted products:", formatted);

        if (formatted.length > 0) {
          setProducts(formatted);
          initializeState(formatted);
          // Fetch stock data for all products
          await fetchStockForProducts(formatted);
        } else {
          console.warn("⚠️ Formatting produced no products");
          setProducts([]);
        }
      } else {
        console.warn("❌ No data returned from parts-list API");
        setProducts([]);

        // Try alternative search approach if we have a service type
        if (state?.serviceType) {
          console.log("🔄 Trying alternative search approach...");
          await tryAlternativeSearch(customFilters);
        }
      }
    } catch (err) {
      console.error("❌ Parts List API failed:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });

      setProducts([]);

      // Try alternative search if main search fails and we have a service type
      if (state?.serviceType) {
        console.log("🔄 Trying alternative search due to error...");
        await tryAlternativeSearch(customFilters);
      }
    } finally {
      setLoading(false);
    }
  };

  // Alternative search method using general search API
  const tryAlternativeSearch = async (customFilters = {}) => {
    try {
      console.log("🔄 Trying alternative search with general search API");

      const searchPayload = {
        customerCode: "0046",
        searchKey: state?.serviceType || "",
        partNumber: null,
      };

      console.log("📤 Alternative search payload:", searchPayload);

      const searchRes = await generalSearchAPI(searchPayload);
      console.log("📥 Alternative search response:", searchRes);

      let searchData = [];
      if (searchRes?.success && Array.isArray(searchRes.data)) {
        searchData = searchRes.data;
      } else if (Array.isArray(searchRes?.data)) {
        searchData = searchRes.data;
      } else if (Array.isArray(searchRes)) {
        searchData = searchRes;
      }

      console.log("🔍 Alternative search extracted data:", searchData);

      if (searchData.length > 0) {
        // Convert search results to parts format
        const convertedData = searchData.map(item => ({
          partNumber: item.partNumber || item.searchValue,
          itemDescription: item.itemName || item.partNumber,
          brandName: item.brandName || "MYTVS", // Use actual brand from API
          listPrice: item.listPrice || item.price || 0,
          mrp: item.mrp || item.listPrice || item.price || 0,
          components: item.itemName,
          lineCode: item.partNumber,
        }));

        const formatted = formatApiData(convertedData);
        console.log("✅ Alternative search formatted products:", formatted);

        if (formatted.length > 0) {
          setProducts(formatted);
          initializeState(formatted);
          // Fetch stock data for all products
          await fetchStockForProducts(formatted);
        } else {
          console.warn("⚠️ Alternative search formatting produced no products");
          setProducts([]);
        }
      } else {
        console.warn("⚠️ Alternative search returned no data");
        setProducts([]);
      }
    } catch (altErr) {
      console.error("❌ Alternative search also failed:", altErr);
      setProducts([]);
    }
  };

  const onConfirm = () => {
    console.log("🔹 Find Auto Parts clicked");
    console.log("🔹 Current filters:", filters);

    // Allow search even without complete vehicle details for service types
    if (state?.serviceType) {
      loadPartsList();
    } else if (!filters.make || !filters.model) {
      alert("Please select at least Make and Model, or provide a service type");
      return;
    } else {
      loadPartsList();
    }
  };

  useEffect(() => {
    console.log("🔹 ServiceTypeProduct mounted with state:", state);

    // Always try to load parts if we have a service type, even without vehicle details
    if (state?.serviceType) {
      console.log("🔹 Service type found, attempting to load parts");

      if (state?.make && state?.model) {
        // If we have vehicle details from navigation, use them
        const initialFilters = {
          make: state.make,
          model: state.model,
          variant: state.variant || null,
          fuelType: state.fuelType || null,
          year: state.year || null,
        };

        setFilters(initialFilters);
        loadPartsList(initialFilters);
      } else {
        // Try to load parts without vehicle filters first
        console.log("🔹 No vehicle details, trying general service search");
        loadPartsList({});
      }
    } else {
      console.warn("⚠️ No service type provided in state");
    }
  }, [state]);

  /* -------------------- FORMAT API DATA -------------------- */
  const formatApiData = (apiData) => {
    console.log("🔹 Raw API data for formatting:", apiData);

    if (!Array.isArray(apiData) || apiData.length === 0) {
      console.warn("⚠️ No valid API data to format");
      return [];
    }

    // Group products by part name
    const grouped = {};

    apiData.forEach((item, index) => {
      console.log(`🔹 Processing item ${index}:`, item);

      // Extract part name
      const partName =
        item.itemDescription ||
        item.components ||
        item.itemName ||
        item.lineCode ||
        item.partNumber ||
        item.description ||
        `Part ${index + 1}`;

      // Extract brand name (keep original from API)
      const brandName = (
        item.brandName ||
        item.brand ||
        item.manufacturer ||
        "Unknown"
      ).trim();

      console.log("🔹 Part name:", partName, "Brand:", brandName);

      // Initialize part group if not exists
      if (!grouped[partName]) {
        grouped[partName] = {
          partName: partName,
          mytvs: null,
          others: []
        };
      }

      // Create product data
      const productData = {
        id: item.partNumber || item.lineCode || item.searchValue || `item-${index}`,
        code: item.partNumber || item.lineCode || item.searchValue || item.code || "N/A",
        eta: item.eta || item.deliveryTime || "1-2 Days",
        price: parseFloat(item.listPrice || item.price || item.sellingPrice || item.mrp || 0),
        mrp: parseFloat(item.mrp || item.listPrice || item.price || item.sellingPrice || 0),
        image: item.image || item.imageUrl || NoImage,
        availability: "Checking Stock...", // Will be updated by stock API
        brandName: brandName,
        originalData: item
      };

      // Check if it's myTVS brand (case insensitive)
      if (brandName.toLowerCase().includes('mytvs') || brandName.toLowerCase().includes('my tvs')) {
        grouped[partName].mytvs = productData;
      } else {
        // All other brands go to "others"
        grouped[partName].others.push(productData);
      }

      console.log(`🔹 Added ${brandName} to ${partName}`);
    });

    const result = Object.values(grouped);
    console.log("🔹 Final formatted products:", result);
    console.log("🔹 Total parts grouped:", result.length);

    return result;
  };

  /* -------------------- INIT QTY & CHECKBOX -------------------- */
  const initializeState = (data) => {
    const qty = {};
    const sel = {};

    data.forEach((part) => {
      // Initialize for myTVS product - ALWAYS CHECKED BY DEFAULT
      if (part.mytvs) {
        qty[part.mytvs.id] = 1;
        sel[part.mytvs.id] = true; // Always checked for myTVS products
      }

      // Initialize for other products - NOT CHECKED BY DEFAULT
      part.others.forEach((product) => {
        qty[product.id] = 1;
        sel[product.id] = false;
      });
    });

    setQuantities(qty);
    setSelected(sel);
  };

  /* -------------------- HANDLERS -------------------- */
  const handleQuantityChange = (productId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, prev[productId] + delta),
    }));
  };

  const handleCheckboxChange = (productId) => {
    setSelected((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  /* -------------------- ORDER CREATION -------------------- */
  const generateTxnId = () => {
    const timestamp = Date.now(); // Use milliseconds timestamp for better uniqueness
    const randomNum = Math.floor(Math.random() * 999999) + 100000; // 6-digit random
    const userSuffix = Math.floor(Math.random() * 999) + 100; // 3-digit random
    const processId = Math.floor(Math.random() * 99) + 10; // 2-digit process ID
    return `STP${timestamp}${randomNum}${userSuffix}${processId}`;
  };

  const safeString = (val, fallback = "NA") => {
    if (val === undefined || val === null) return fallback;
    if (String(val).trim() === "") return fallback;
    return String(val);
  };

  const safeNumberString = (val, fallback = "0") => {
    if (val === undefined || val === null) return fallback;
    if (isNaN(val)) return fallback;
    return String(val);
  };

  const getSelectedProducts = () => {
    const selectedProducts = [];

    products.forEach((part) => {
      // Check myTVS product
      if (part.mytvs && selected[part.mytvs.id]) {
        selectedProducts.push({
          ...part.mytvs,
          partName: part.partName,
          quantity: quantities[part.mytvs.id] || 1,
        });
      }

      // Check other products
      part.others.forEach((product) => {
        if (selected[product.id]) {
          selectedProducts.push({
            ...product,
            partName: part.partName,
            quantity: quantities[product.id] || 1,
          });
        }
      });
    });

    return selectedProducts;
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions within 10 seconds
    const now = Date.now();
    if (now - lastSubmitTime < 10000) {
      alert("⚠️ Please wait a moment before submitting another order.");
      return;
    }

    const selectedProducts = getSelectedProducts();

    if (selectedProducts.length === 0) {
      alert("Please select at least one product to create an order.");
      return;
    }

    try {
      setSubmitLoading(true);
      setLastSubmitTime(now); // Record submission time

      // Get logged in user data
      let loggedInCustomer = JSON.parse(
        localStorage.getItem("loggedInCustomer") || "{}"
      );

      let loggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser") || "{}"
      );

      let userLocation = JSON.parse(
        localStorage.getItem("userLocation") || "{}"
      );

      // FALLBACK: If new keys don't exist, try to get data from user_detail (for users who haven't re-logged in)
      if (!loggedInCustomer.customer_code || !loggedInUser.user_id) {
        console.warn("⚠️ New localStorage keys not found, attempting to extract from user_detail...");
        
        const userDetail = JSON.parse(localStorage.getItem("user_detail") || "{}");
        
        if (userDetail && Object.keys(userDetail).length > 0) {
          console.log("📦 Found user_detail, extracting customer data:", userDetail);
          
          // Extract customer data from user_detail
          if (!loggedInCustomer.customer_code) {
            loggedInCustomer = {
              customer_code: userDetail.customer_code || "NA",
              customer_name: userDetail.customer_name || "NA",
              mobile_number: userDetail.mobile_number || "NA",
              phone_number: userDetail.phone_number || "NA",
              warehouse_name: userDetail.warehouse?.warehouse_name || "KMS_WHG"
            };
            console.log("✅ Extracted customer data:", loggedInCustomer);
          }
          
          // Extract user data from user_detail
          if (!loggedInUser.user_id) {
            loggedInUser = {
              user_id: userDetail.customer_id || userDetail.sales_executive_id || "NA",
              customer_id: userDetail.customer_id || "NA"
            };
            console.log("✅ Extracted user data:", loggedInUser);
          }
        } else {
          console.error("❌ No user_detail found in localStorage. Please log in again.");
        }
      }

      // Validate customer data
      if (!loggedInCustomer.customer_code) {
        console.warn("⚠️ Customer code missing - customer_code will be 'NA'");
      }
      if (!loggedInCustomer.customer_name) {
        console.warn("⚠️ Customer name missing - customer_name will be 'NA'");
      }
      if (!loggedInCustomer.mobile_number && !loggedInCustomer.phone_number) {
        console.warn("⚠️ Customer phone missing - mobile_number will be 'NA'");
      }

      // Validate user data
      if (!loggedInUser.user_id) {
        console.warn("⚠️ User ID missing - employee_id will be 'NA'");
      }

      // Capture current location before creating order
      let currentLocation = userLocation;
      
      if (navigator.geolocation && (!userLocation.lat || userLocation.lat === "0")) {
        console.log("📍 Capturing current location for order...");
        
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          
          currentLocation = {
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          };
          
          // Update localStorage for future orders
          localStorage.setItem("userLocation", JSON.stringify(currentLocation));
          console.log("✅ Location captured:", currentLocation);
        } catch (geoError) {
          console.warn("⚠️ Could not capture location:", geoError.message);
          // Keep using the existing location (even if it's 0,0)
        }
      }

      // Calculate totals
      const totalPrice = selectedProducts.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );

      const totalQuantity = selectedProducts.reduce(
        (sum, item) => sum + Number(item.quantity || 1),
        0
      );

      // Build order payload
      const payload = {
        validity_date: new Date().toISOString().split("T")[0],
        customer_code: safeString(loggedInCustomer.customer_code),
        customer_name: safeString(loggedInCustomer.customer_name),
        mobile_number: safeString(loggedInCustomer.mobile_number || loggedInCustomer.phone_number),
        employee_id: safeString(loggedInUser.user_id),
        latitude: safeString(currentLocation.lat),
        longitude: safeString(currentLocation.lng),
        transaction_track_id: generateTxnId(),
        total_price: safeNumberString(totalPrice),
        total_quantity: safeNumberString(totalQuantity),
        service_type: safeString(state?.serviceType),
        vehicle_make: safeString(state?.make || filters.make),
        vehicle_model: safeString(state?.model || filters.model),
        vehicle_variant: safeString(state?.variant || filters.variant),
        vehicle_fuel_type: safeString(state?.fuelType || filters.fuelType),
        vehicle_year: safeString(state?.year || filters.year),
        part_details: selectedProducts.map((item, index) => {
          const qty = Number(item.quantity || 1);
          const price = Number(item.price || 0);
          const subtotal = price * qty;

          return {
            parts_no: safeString(item.code, `PART_${index + 1}`),
            parts_name: safeString(item.partName, "UNKNOWN_PART"),
            brand_name: safeString(item.brandName, "GENERIC"),
            quantity: qty,
            warehouse: safeString(
              loggedInCustomer.warehouse_name,
              "KMS_WHG"
            ),
            item_price: safeNumberString(price),
            sub_total: subtotal,
            tax_price: "0.00",
            total_price: safeNumberString(subtotal),
            cgst: "0.00",
            sgst: "0.00",
            igst: "0.00",
            mrp: safeNumberString(item.mrp || price),
            eta: safeString(item.eta, "1-2 Days"),
            availability: (() => {
              const stockInfo = stockData[item.id] || stockData[item.code];
              if (!stockInfo) return "Stock Status Unknown";
              return stockInfo.inStock ? `In Stock (${stockInfo.quantity})` : "Out of Stock";
            })(),
            stock_quantity: (() => {
              const stockInfo = stockData[item.id] || stockData[item.code];
              return stockInfo ? stockInfo.quantity : 0;
            })(),
          };
        }),
      };

      console.log("🔹 Order Creation Payload:", payload);

      // Call order creation API
      const res = await apiService.post("/create-order", payload);
      console.log("📥 Order Creation Response:", res);

      if (res?.success === true || res?.message?.toLowerCase().includes("success")) {
        // Extract order number from response
        const orderNum = res?.data?.order_number ||
          res?.order_number ||
          res?.data?.transaction_track_id ||
          payload.transaction_track_id;

        setOrderNumber(orderNum);
        setShowSuccess(true);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setOrderNumber("");
        }, 5000);
      } else {
        // Handle specific error messages
        const errorMessage = res?.message || res?.error || "Order creation failed";

        // Special handling for duplicate orders
        if (errorMessage.toLowerCase().includes("duplicate")) {
          alert("⚠️ " + errorMessage + "\n\nPlease wait a few minutes before placing another order, or modify your selection.");
        } else {
          alert(errorMessage);
        }
      }
    } catch (err) {
      console.error("❌ Order Creation Error:", err?.response?.data || err.message);

      // Handle structured error responses
      const errorData = err?.response?.data;
      let errorMessage = "Order creation failed. Please try again.";

      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        // Special handling for duplicate order
        if (errorMessage.toLowerCase().includes("duplicate")) {
          errorMessage = "⚠️ " + errorMessage + "\n\nThis might happen if:\n• You recently placed the same order\n• Multiple clicks on submit button\n• Network issues caused retry\n\nPlease wait 5 minutes or modify your selection.";
        }
      }

      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  /* -------------------- JSX -------------------- */
  return (
    <div className="srp-container">
      <Search />

      {/* Intelligent Navigation - automatically generates breadcrumbs */}
      <Navigation />

      <div className="srp-content">
        <div className="srp-row-container">
          <div className="srp-row">
            {state?.serviceType && (
              <div className="srp-search-key-text">
                <span className="srp-search-key-label">Search Key :</span>
                <span className="srp-search-key-value">{searchKey}</span>
              </div>
            )}
          </div>

          <div className="srp-edit-dropdowns">
            <select
              className="srp-dropdown"
              value={filters.make || ""}
              onChange={(e) =>
                setFilters({ ...filters, make: e.target.value || null })
              }
            >
              <option value="">Select Make</option>
              {makes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              className="srp-dropdown"
              value={filters.model || ""}
              onChange={(e) =>
                setFilters({ ...filters, model: e.target.value || null })
              }
              disabled={!filters.make}
            >
              <option value="">Select Model</option>
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              className="srp-dropdown"
              value={filters.variant || ""}
              onChange={(e) =>
                setFilters({ ...filters, variant: e.target.value || null })
              }
              disabled={!filters.model}
            >
              <option value="">Select Variant</option>
              {variants.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              className="srp-dropdown"
              value={filters.fuelType || ""}
              onChange={(e) =>
                setFilters({ ...filters, fuelType: e.target.value || null })
              }
              disabled={!filters.variant}
            >
              <option value="">Select Fuel Type</option>
              {fuelType.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            <select
              className="srp-dropdown"
              value={filters.year || ""}
              onChange={(e) =>
                setFilters({ ...filters, year: e.target.value || null })
              }
              disabled={!filters.fuelType}
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>

            <button className="srp-find-btn" onClick={onConfirm}>
              Find Auto Parts
            </button>
          </div>
        </div>

        <table className="srp-table">
          <thead>
            <tr>
              <th className="srp-part-number-header">Part Number</th>
              <th className="srp-mytvs-header">myTVS Recommended</th>
              <th className="srp-other-header">Other Options</th>
              <th className="srp-oem-header">OEM</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="skeleton-card">
                    <td className="srp-part-name-cell" style={{ padding: "16px" }}>
                      <div className="skeleton skeleton-srp-part-name"></div>
                    </td>
                    <td className="srp-brand-cell" style={{ padding: "16px" }}>
                      <div className="skeleton-srp-product-card">
                        <div className="skeleton skeleton-srp-checkbox"></div>
                        <div className="skeleton skeleton-srp-product-image"></div>
                        <div className="skeleton-srp-product-content">
                          <div className="skeleton skeleton-srp-brand-badge"></div>
                          <div className="skeleton skeleton-srp-eta"></div>
                          <div className="skeleton skeleton-srp-part-code"></div>
                          <div className="skeleton skeleton-srp-price"></div>
                          <div className="skeleton-srp-quantity">
                            <div className="skeleton skeleton-srp-qty-btn"></div>
                            <div className="skeleton skeleton-srp-qty-display"></div>
                            <div className="skeleton skeleton-srp-qty-btn"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="srp-brand-cell" style={{ padding: "16px" }}>
                      <div className="skeleton-srp-product-card">
                        <div className="skeleton skeleton-srp-checkbox"></div>
                        <div className="skeleton skeleton-srp-product-image"></div>
                        <div className="skeleton-srp-product-content">
                          <div className="skeleton skeleton-srp-brand-badge"></div>
                          <div className="skeleton skeleton-srp-eta"></div>
                          <div className="skeleton skeleton-srp-part-code"></div>
                          <div className="skeleton skeleton-srp-price"></div>
                          <div className="skeleton-srp-quantity">
                            <div className="skeleton skeleton-srp-qty-btn"></div>
                            <div className="skeleton skeleton-srp-qty-display"></div>
                            <div className="skeleton skeleton-srp-qty-btn"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="srp-brand-cell" style={{ padding: "16px" }}>
                      <div className="srp-empty-cell">-</div>
                    </td>
                  </tr>
                ))}
              </>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                  <div className="srp-no-data">
                    {state?.serviceType
                      ? `No parts found for service type "${searchKey}". Please try:
                         • Selecting vehicle details above
                         • Using different search terms
                         • Checking if the service type is available`
                      : "No products found. Please select vehicle details and try again."
                    }
                  </div>
                </td>
              </tr>
            ) : (
              products.map((part, index) => (
                <tr key={part.partName || index} className="srp-product-row">
                  {/* Part Number Column */}
                  <td className="srp-part-name-cell">
                    <div className="srp-part-name">
                      {part.partName}
                    </div>
                  </td>

                  {/* myTVS Recommended Column */}
                  <td className="srp-brand-cell">
                    {part.mytvs ? (
                      <div className="srp-product-card">
                        <input
                          type="checkbox"
                          className="srp-checkbox"
                          checked={selected[part.mytvs.id] || false}
                          onChange={() => handleCheckboxChange(part.mytvs.id)}
                        />

                        <img
                          src={part.mytvs.image}
                          alt={part.partName}
                          className="srp-product-image"
                        />

                        <div className="srp-product-content">
                          <div className="srp-product-details">
                            <div className="srp-brand-badge mytvs-badge">
                              myTVS
                            </div>

                            <div className="srp-eta">
                              {part.mytvs.eta}
                            </div>

                            <div className="srp-stock-status">
                              {(() => {
                                const stockInfo = stockData[part.mytvs.id] || stockData[part.mytvs.code];
                                if (!stockInfo) return <span className="stock-checking">Checking Stock...</span>;
                                return stockInfo.inStock ?
                                  <span className="stock-available">✓ In Stock ({stockInfo.quantity})</span> :
                                  <span className="stock-unavailable">✗ Out of Stock</span>;
                              })()}
                            </div>

                            <div className="srp-part-code">
                              {part.mytvs.code}
                            </div>

                            <div className="srp-price-section">
                              <span className="srp-current-price">₹ {part.mytvs.price}</span>
                              {part.mytvs.mrp > part.mytvs.price && (
                                <span className="srp-original-price">₹ {part.mytvs.mrp}</span>
                              )}
                            </div>

                            <div className="srp-quantity-controls">
                              <button
                                className="srp-qty-btn"
                                onClick={() => handleQuantityChange(part.mytvs.id, -1)}
                              >
                                −
                              </button>
                              <span className="srp-qty-display">
                                {quantities[part.mytvs.id] || 1}
                              </span>
                              <button
                                className="srp-qty-btn"
                                onClick={() => handleQuantityChange(part.mytvs.id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="srp-empty-cell">-</div>
                    )}
                  </td>

                  {/* Other Options Column */}
                  <td className="srp-brand-cell">
                    {part.others.length > 0 ? (
                      part.others.map((product) => (
                        <div key={product.id} className="srp-product-card">
                          <div className="srp-checkbox-container">
                            <input
                              type="checkbox"
                              className="srp-checkbox"
                              checked={selected[product.id] || false}
                              onChange={() => handleCheckboxChange(product.id)}
                            />

                          </div>

                          <img
                            src={product.image}
                            alt={part.partName}
                            className="srp-product-image"
                          />

                          <div className="srp-product-content">
                            <div className="srp-product-details">
                              <div className="srp-product-b-e">
                                                              <div className="srp-brand-badge other-badge">
                                {product.brandName}
                              </div>

                              <div className="srp-eta">
                                {product.eta}
                              </div>
                              </div>


                              <div className="srp-stock-status">
                                {(() => {
                                  const stockInfo = stockData[product.id] || stockData[product.code];
                                  if (!stockInfo) return <span className="stock-checking">Checking Stock...</span>;
                                  return stockInfo.inStock ?
                                    <span className="stock-available">✓ In Stock ({stockInfo.quantity})</span> :
                                    <span className="stock-unavailable">✗ Out of Stock</span>;
                                })()}
                              </div>

                              <div className="srp-part-code">
                                {product.code}
                              </div>

                              <div className="srp-price-section">
                                <span className="srp-current-price">₹ {product.price}</span>
                                {product.mrp > product.price && (
                                  <span className="srp-original-price">₹ {product.mrp}</span>
                                )}
                              </div>

                              <div className="srp-quantity-controls">
                                <button
                                  className="srp-qty-btn"
                                  onClick={() => handleQuantityChange(product.id, -1)}
                                >
                                  −
                                </button>
                                <span className="srp-qty-display">
                                  {quantities[product.id] || 1}
                                </span>
                                <button
                                  className="srp-qty-btn"
                                  onClick={() => handleQuantityChange(product.id, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="srp-empty-cell">-</div>
                    )}
                  </td>

                  {/* OEM Column - Keep Empty */}
                  <td className="srp-brand-cell">
                    <div className="srp-empty-cell">-</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="srp-footer">
          <div className="srp-footer-note">
            "Each item starts at Qty 1. Uptick or adjust quantities as needed".
          </div>
          <button
            className="srp-submit-btn"
            onClick={handleSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? "Creating Order..." : "Submit Order"}
          </button>
        </div>
      </div>

      {/* Modern Success Notification */}
      {showSuccess && (
        <div className="srp-success-overlay">
          <div className="srp-success-notification">
            <div className="srp-success-icon">✓</div>
            <div className="srp-success-content">
              <h3 className="srp-success-title">Order Created Successfully!</h3>
              <p className="srp-success-message">
                Your order has been placed successfully.
                {orderNumber && (
                  <>
                    <br />
                    <strong>Order Number: {orderNumber}</strong>
                  </>
                )}
              </p>
            </div>
            <button
              className="srp-success-close"
              onClick={() => {
                setShowSuccess(false);
                setOrderNumber("");
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay for Submit */}
      {submitLoading && (
        <div className="srp-loading-overlay">
          <div className="srp-loading-spinner">
            <div className="srp-spinner"></div>
            <p>Creating your order...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTypeProduct;
