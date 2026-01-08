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
    (cartItem) => cartItem.partNumber === localPartNumber
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
          Compatible with <b className="pn-count-vehicle">
            {vehicleCount || 0}
          </b>{" "}
          vehicles
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
    Object.values(v)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
  const rawSearchKey = state?.partNumber || "";

  // Detection functions
  const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9]+$/i.test(value);
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

  const unique = (arr, key) => [
    ...new Set(arr.map((item) => item[key]).filter(Boolean)),
  ];

  const makes = unique(vehicleList, "make");

  const models = unique(
    vehicleList.filter((v) => !selectedMake || v.make === selectedMake),
    "model"
  );

  const variants = unique(
    vehicleList.filter(
      (v) =>
        (!selectedMake || v.make === selectedMake) &&
        (!selectedModel || v.model === selectedModel)
    ),
    "variant"
  );

  const fuelTypes = unique(
    vehicleList.filter(
      (v) =>
        (!selectedMake || v.make === selectedMake) &&
        (!selectedModel || v.model === selectedModel) &&
        (!selectedVariant || v.variant === selectedVariant)
    ),
    "fuelType"
  );

  const years = unique(
    vehicleList.filter(
      (v) =>
        (!selectedMake || v.make === selectedMake) &&
        (!selectedModel || v.model === selectedModel) &&
        (!selectedVariant || v.variant === selectedVariant) &&
        (!selectedFuel || v.fuelType === selectedFuel)
    ),
    "year"
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
        const isPartNumber = (value) => /^(?=.*\d)[A-Z0-9]+$/i.test(value);
        const isPartNumberSearch = isPartNumber(searchKey.replace(/\s+/g, ""));

        let response;
        if (isPartNumberSearch) {
          // Search by part number
          response = await fetchPartsListByPartNumber(searchKey);
        } else {
          // Search by item name/description
          response = await fetchPartsListByItemName(searchKey);
        }

        const partsData = response?.data || [];

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

        // Separate myTVS and other brands
        const myTvsProducts = transformedParts.filter(
          (item) => item.brand.toUpperCase() === "MYTVS"
        );
        const otherProducts = transformedParts.filter(
          (item) => item.brand.toUpperCase() !== "MYTVS"
        );

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

            <button className="pn-compat-btn">Search Compatibility</button>
          </div>

          <div className="pn-right-filters">
            <Filter label="Year" options={years} />
            <Filter label="Fuel type" options={fuelTypes} />
            <Filter label="ETA" options={["1-2 Days", "3-5 Days", "5+ Days"]} />
            <Filter label="Sort by" options={["Price", "ETA", "Popularity"]} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="pn-content">
          {/* Loading State */}
          {loading && (
            <div className="pn-loading">
              <p>Loading parts data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="pn-error">
              <p>{error}</p>
            </div>
          )}

          {/* Products Display */}
          {!loading && !error && (
            <>
              {/* LEFT */}
              <div className="pn-left">
                <h4 className="pn-section-title">myTVS Recommended Products</h4>

                <div className="pn-grid">
                  {recommendedProducts.length > 0 ? (
                    recommendedProducts.map((item) => (
                      <div className="pn-card" key={item.id}>
                        <ProductCard
                          item={item}
                          onOpenCompatibility={() => setShowCompatibility(true)}
                          vehicleCount={vehicleCount}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="pn-no-results">
                      No myTVS products found for {searchKey}
                    </div>
                  )}
                </div>

                <h4 className="pn-section-title">Other Products</h4>

                <div className="pn-grid">
                  {otherBrandProducts.length > 0 ? (
                    otherBrandProducts.map((item) => (
                      <div className="pn-card" key={item.id}>
                        <ProductCard
                          item={item}
                          onOpenCompatibility={() => setShowCompatibility(true)}
                          vehicleCount={vehicleCount}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="pn-no-results">
                      No other brand products found for <b>{searchKey}</b>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <div className="pn-right">
                <h4 className="pn-section-title">Aligned Products</h4>

                <div className="pn-aligned">
                  {alignedProducts.map((item) => {
                    const partNumber = `ALIGNED-${item.id}`;
                    const isAdded = cartItems.some(
                      (cartItem) => cartItem.partNumber === partNumber
                    );

                    return (
                      <div key={item.id} className="pn-aligned-card">
                        <div className="pn-aligned-card-content">
                          <div className="pn-b-s-e">
                            <span className="pn-tag-brand">{item.brand}</span>
                            <span className="pn-tag-stock">In stock</span>
                            <span className="pn-tag-eta">1-2 Days</span>
                          </div>

                          {/* Display Part Number */}
                          <p className="pn-align-part">{item.partNo}</p>

                          <p
                            className="pn-name-align pn-truncate"
                            title={item.description}
                          >
                            {item.description}
                          </p>

                          <div className="pn-price-row">
                            <span className="pn-price">₹ {item.price}</span>
                            <span className="pn-mrp">₹ {item.mrp}</span>
                          </div>
                        </div>
                        <div className="pn-card-actions">
                          <div>
                            {" "}
                            <img src={item.imageUrl} alt="" />
                          </div>
                          <div>
                            <button
                              className={`pn-add-btn ${
                                isAdded ? "pn-added" : ""
                              }`}
                              onClick={() =>
                                isAdded
                                  ? removeFromCart(partNumber)
                                  : addToCart({
                                      ...item,
                                      partNumber,
                                      listPrice: item.price,
                                      image: item.imageUrl, // ✅ ADD IMAGE
                                    })
                              }
                            >
                              {isAdded ? "Added" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
