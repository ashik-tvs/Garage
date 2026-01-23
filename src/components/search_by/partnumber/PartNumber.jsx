import { useState, useEffect } from "react";
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
const CompatibilityModal = ({ onClose, vehicles = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter((v) =>
    Object.values(v).join(" ").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="pn-modal-overlay">
      <div className="pn-modal">
        {/* Header */}
        <div className="pn-modal-header">
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
          {" "}
          <div className="pn-modal-table-body">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v, i) => (
                <div key={i} className="pn-modal-row">
                  <span>{v.make}</span>
                  <span>{v.model}</span>
                  <span>{v.variant}</span>
                  <span>{v.fuelType}</span>
                  <span>{v.year}</span>
                </div>
              ))
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

  // Keep original case for item name, uppercase for part number
  const searchKey = isPartNumber(rawSearchKey.replace(/\s+/g, ""))
    ? rawSearchKey.toUpperCase()
    : rawSearchKey;

  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [otherBrandProducts, setOtherBrandProducts] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [vehicleCompatibilityList, setVehicleCompatibilityList] = useState([]);
  const [vehicleCount, setVehicleCount] = useState(0);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredCompatibility, setFilteredCompatibility] = useState([]);

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
  } finally {
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
        // Detect if searchKey is part number (alphanumeric with at least one digit) or item name (letters and spaces only)
        const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9-]+$/i.test(value); // ✅ Added hyphen support
        const isPartNumberSearch = isPartNumber(searchKey.replace(/\s+/g, ""));

        console.log("🔍 Search Key:", searchKey);
        console.log("🔍 Is Part Number Search:", isPartNumberSearch);

        let response;
        if (isPartNumberSearch) {
          // Search by part number
          console.log("➡️ Calling fetchPartsListByPartNumber with:", searchKey);
          response = await fetchPartsListByPartNumber(searchKey);
        } else {
          // Search by item name/description
          console.log("➡️ Calling fetchPartsListByItemName with:", searchKey);
          response = await fetchPartsListByItemName(searchKey);
        }

        console.log("✅ API Response:", response);
        const partsData = response?.data || [];
        console.log("📦 Parts Data Count:", partsData.length);

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

      } catch (err) {
        console.error("Error fetching parts data:", err);
        setError("Failed to load parts. Please try again.");
        setRecommendedProducts([]);
        setOtherBrandProducts([]);
      } finally {
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
        const response = await fetchVehicleListByPartNumber(searchKey);
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
        </div>

        {/* FILTERS */}
        <div className="pn-top">
          <div className="pn-compatibility">
            <Filter
              label="Select Make"
              options={makes}
              value={selectedMake}
              onChange={(val) => {
                setSelectedMake(val);
                setSelectedModel("");
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
              }}
            />

            <Filter
              label="Select Model"
              options={models}
              value={selectedModel}
              disabled={!selectedMake}
              onChange={(val) => {
                setSelectedModel(val);
                setSelectedVariant("");
                setSelectedFuel("");
                setSelectedYear("");
              }}
            />

            <Filter
              label="Select Variant"
              options={variants}
              value={selectedVariant}
              disabled={!selectedModel}
              onChange={(val) => {
                setSelectedVariant(val);
                setSelectedFuel("");
                setSelectedYear("");
              }}
            />

            <Filter
              label="Select Fuel type"
              options={fuelTypes}
              value={selectedFuel}
              disabled={!selectedVariant}
              onChange={(val) => {
                setSelectedFuel(val);
                setSelectedYear("");
              }}
            />

            <Filter
              label="Select Year"
              options={years}
              value={selectedYear}
              disabled={!selectedFuel}
              onChange={setSelectedYear}
            />

<button
  className="pn-compat-btn"
  onClick={applyCompatibilityFilter}
  disabled={
    !selectedMake &&
    !selectedModel &&
    !selectedVariant &&
    !selectedFuel &&
    !selectedYear
  }
>
  Search
</button>

<button
  className="pn-clear-btn"
  onClick={() => {
    console.log("🧹 Clearing filters...");
    setSelectedMake("");
    setSelectedModel("");
    setSelectedVariant("");
    setSelectedFuel("");
    setSelectedYear("");
  }}
  disabled={
    !selectedMake &&
    !selectedModel &&
    !selectedVariant &&
    !selectedFuel &&
    !selectedYear
  }
>
  Clear
</button>
          </div>

          <div className="pn-right-filters">
            <Filter label="Year" options={years} />
            <Filter label="Fuel type" options={fuelTypes} />
            <Filter label="ETA" options={["1-2 Days", "3-5 Days", "5+ Days"]} />
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
                  products={recommendedProducts.map(item => ({
                    id: item.id,
                    partNumber: item.partNo,
                    name: item.description,
                    image: item.imageUrl,
                    brand: item.brand,
                    price: item.price,
                    mrp: item.mrp,
                    stockStatus: item.stock,
                    deliveryTime: item.eta,
                    compatibleVehicles: vehicleCount,
                  }))}
                  layout="horizontal"
                  onAddToCart={(product) => {
                    const originalItem = recommendedProducts.find(
                      item => item.partNo === product.partNumber
                    );
                    const localPartNumber = originalItem?.localPartNumber || 
                      `${product.partNumber}_${product.brand}`;
                    addToCart({
                      ...originalItem,
                      partNumber: localPartNumber,
                      listPrice: product.price,
                      image: product.image,
                    });
                  }}
                />

                {/* Other Products */}
                <Product1
                  title="Other Products"
                  products={otherBrandProducts.map(item => ({
                    id: item.id,
                    partNumber: item.partNo,
                    name: item.description,
                    image: item.imageUrl,
                    brand: item.brand,
                    price: item.price,
                    mrp: item.mrp,
                    stockStatus: item.stock,
                    deliveryTime: item.eta,
                    compatibleVehicles: vehicleCount,
                  }))}
                  layout="horizontal"
                  onAddToCart={(product) => {
                    const originalItem = otherBrandProducts.find(
                      item => item.partNo === product.partNumber
                    );
                    const localPartNumber = originalItem?.localPartNumber || 
                      `${product.partNumber}_${product.brand}`;
                    addToCart({
                      ...originalItem,
                      partNumber: localPartNumber,
                      listPrice: product.price,
                      image: product.image,
                    });
                  }}
                />
              </div>

              {/* RIGHT SECTION - 25% */}
              <div className="pn-right">
                {/* Aligned Products */}
                <Product1
                  title="Aligned Products"
                  products={alignedProducts.map(item => ({
                    id: item.id,
                    partNumber: item.partNo,
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
                    const partNumber = `ALIGNED-${product.id}`;
                    const originalItem = alignedProducts.find(
                      item => item.id === product.id
                    );
                    addToCart({
                      ...originalItem,
                      partNumber,
                      listPrice: product.price,
                      image: product.image,
                    });
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ MODAL MUST BE INSIDE RETURN */}
      {showCompatibility && (
        <CompatibilityModal
          onClose={() => setShowCompatibility(false)}
          vehicles={vehicleCompatibilityList}
        />
      )}
    </div>
  );
};

export default PartNumber;
