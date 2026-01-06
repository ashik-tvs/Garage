import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../../../services/apiservice";
import Search from "../../home/Search";
import { useCart } from "../../../context/CartContext";
import {
  fetchPartsListByPartNumber,
  fetchPartsListByItemName,
} from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import DownArrow from "../../../assets/vehicle_search_entry/dropdown.png";
import "../../../styles/search_by/partnumber/PartNumber.css";
import Brake_1 from "../../../assets/brake1.png";
import Brake_2 from "../../../assets/brake2.png";
import Brake_3 from "../../../assets/brake3.png";

/* ---------------- MOCK DATA ---------------- */
const brakeImages = [Brake_1, Brake_2, Brake_3];

const alignedProducts = [
  {
    id: 3,
    partNo: "A6732S233132",
    brand: "Valeo",
    description: "Brake Disc Pad",
    price: 425,
    mrp: 600,
    imageUrl: brakeImages[2],
  },
  {
    id: 4,
    partNo: "SA233663824",

    brand: "Mobil",
    description: "Brake Fluid",
    price: 425,
    mrp: 600,
    imageUrl: brakeImages[0],
  },
  {
    id: 5,
    partNo: "YD323S5632",

    brand: "Valeo",
    description: "Brake Fitting Kit",
    price: 425,
    mrp: 600,
    imageUrl: brakeImages[1],
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

const ProductCard = ({ item, onOpenCompatibility }) => {
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
            {item.vehicles}
          </b>{" "}
          vehicles
        </div>
        <span className="pn-arrow">›</span>
      </div>
    </div>
  );
};
const CompatibilityModal = ({ onClose }) => {
  const vehicles = [
    {
      make: "Hyundai",
      model: "Grand i10",
      variant: "Sportz",
      fuel: "Petrol",
      year: "2012",
    },
    {
      make: "Hyundai",
      model: "Grand i10",
      variant: "Asta",
      fuel: "Diesel",
      year: "2013",
    },
    {
      make: "Hyundai",
      model: "i20",
      variant: "Magna",
      fuel: "Petrol",
      year: "2014",
    },
    {
      make: "Hyundai",
      model: "i20",
      variant: "Sportz",
      fuel: "Diesel",
      year: "2015",
    },
    {
      make: "Hyundai",
      model: "Xcent",
      variant: "SX",
      fuel: "Petrol",
      year: "2016",
    },
    {
      make: "Hyundai",
      model: "Xcent",
      variant: "SX(O)",
      fuel: "Diesel",
      year: "2017",
    },
    {
      make: "Hyundai",
      model: "Aura",
      variant: "S",
      fuel: "Petrol",
      year: "2020",
    },
    {
      make: "Hyundai",
      model: "Aura",
      variant: "SX",
      fuel: "CNG",
      year: "2021",
    },
  ];

  return (
    <div className="pn-modal-overlay">
      <div className="pn-modal">
        {/* Header */}
        <div className="pn-modal-header">
          <input type="text" placeholder="Search" className="pn-modal-search" />
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
            {vehicles.map((v, i) => (
              <div key={i} className="pn-modal-row">
                <span>{v.make}</span>
                <span>{v.model}</span>
                <span>{v.variant}</span>
                <span>{v.fuel}</span>
                <span>{v.year}</span>
              </div>
            ))}
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
        <CompatibilityModal onClose={() => setShowCompatibility(false)} />
      )}
    </div>
  );
};

export default PartNumber;
