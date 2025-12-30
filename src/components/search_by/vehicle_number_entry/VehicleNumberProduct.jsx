import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/vehicle_number_entry/VehicleNumberProduct.css";
import apiService from "../../../services/apiservice"; // Adjust path
import NoImage from "../../../assets/No Image.png";
import Brake_1 from "../../../assets/brake1.png";
import Brake_2 from "../../../assets/brake2.png";
import Brake_3 from "../../../assets/brake3.png";

/* ---------------- MOCK DATA ---------------- */
const recommendedProducts = [
  {
    partNumber: "207509",
    name: "Rear Brake Pad",
    brand: "myTVS",
    price: 425,
    mrp: 600,
    stockQty: 10,
    eta: "1-2 Days",
    image: Brake_1,
  },
  {
    partNumber: "2075019",
    name: "Rear Brake Pad",
    brand: "myTVS",
    price: 425,
    mrp: 600,
    stockQty: 10,
    eta: "1-2 Days",
    image: Brake_2,
  },
];

const otherProducts = [
  {
    partNumber: "LF16079",
    name: "Brake Pad for Hyundai",
    brand: "Denso",
    price: 425,
    mrp: 600,
    stockQty: 8,
    eta: "1-2 Days",
    image: Brake_2,
  },
  {
    partNumber: "LF16080",
    name: "Brake Pad for Car (Set of 4)",
    brand: "Bosch",
    price: 520,
    mrp: 700,
    stockQty: 6,
    eta: "1-2 Days",
    image: Brake_3,
  },
];

const alignedProducts = [
  {
    partNumber: "LF16081",
    name: "Brake Disc Pad",
    brand: "Valeo",
    price: 425,
    mrp: 600,
    stockQty: 12,
    eta: "1-2 Days",
    image: Brake_1,
  },
  {
    partNumber: "99000M24120-624",
    name: "Brake Fluid",
    brand: "Valeo",
    price: 300,
    mrp: 450,
    stockQty: 15,
    eta: "1-2 Days",
    image: Brake_2,
  },
  {
    partNumber: "T0494M81207",
    name: "Brake Fitting Kit",
    brand: "Valeo",
    price: 380,
    mrp: 520,
    stockQty: 7,
    eta: "1-2 Days",
    image: Brake_3,
  },
];

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
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const isInCart = (partNumber) =>
    cartItems.some((item) => item.partNumber === partNumber);

  const { vehicle, make, model, brand, category, subCategory } =
    location.state || {};

  const [filters, setFilters] = useState({
    brakeSystem: "",
    price: "",
    eta: "",
    sortBy: "",
  });
  const filterOptions = {
    brakeSystem: ["Disc Brake", "Drum Brake", "ABS", "Non-ABS"],
    price: ["Low to High", "High to Low"],
    eta: ["Same Day", "1-2 Days", "3-5 Days"],
    sortBy: ["Relevance", "Price", "Brand"],
  };
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

  const renderProductCard = (product) => (
    <div className="vnp-card" key={product.partNumber}>
      <div className="vnp-image-placeholder">
        <img src={product.image || NoImage} alt={product.name} width="100" />
      </div>

      <div className="vnp-details">
        <div className="vnp-badges">
          <span className={`vnp-badge vnp-badge-${product.brand.toLowerCase()}`}>
            {product.brand}
          </span>
          <span className="vnp-badge vnp-badge-stock">In stock</span>
          <span className="vnp-badge vnp-badge-eta">{product.eta}</span>
        </div>

        <p className="vnp-code">{product.partNumber}</p>
        <p className="vnp-name" title={product.name}>{product.name}</p>

        <div className="vnp-price-row">
          <span className="vnp-price-current">₹ {product.price}.00</span>
          <span className="vnp-price-original">₹ {product.mrp}.00</span>

          <button
            className={`vnp-btn-add ${isInCart(product.partNumber) ? "added" : ""}`}
            onClick={() => handleToggleCart(product)}
          >
            {isInCart(product.partNumber) ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );

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
          {brand && (
            <>
              <span>{brand}</span>
              <img src={getAssetUrl("RIGHT ARROW")} alt="" width="15" height="15" />
            </>
          )}
          {make && (
            <>
              <span>{make}</span>
              <img src={getAssetUrl("RIGHT ARROW")} alt="" width="15" height="15" />
            </>
          )}
          {model && (
            <>
              <span>{model}</span>
              <img src={getAssetUrl("RIGHT ARROW")} alt="" width="10" height="10" />
            </>
          )}
          {category && (
            <>
              <span>{category}</span>
              <img src={getAssetUrl("RIGHT ARROW")} alt="" width="15" height="15" />
            </>
          )}
          {subCategory && <span>{subCategory.name || subCategory}</span>}
        </div>

        <div className="vnp-top-right">
          <div className="vnp-vehicle-group">
            <div className="vnp-filter-frame">
              <div className="vnp-filter-rect" />
              <div className="vnp-filter-number">
                <div className="vnp-num-part">{vehicle?.make || "Hyundai"}</div>
                <div className="vnp-sep">-</div>
                <div className="vnp-num-part">{vehicle?.model || "Grand"}</div>
                <div className="vnp-sep">-</div>
                <div className="vnp-num-part">{vehicle?.variant || "i10"}</div>
                <div className="vnp-sep">-</div>
                <div className="vnp-num-part">{vehicle?.fuel || "Petrol"}</div>
                <div className="vnp-sep">-</div>
                <div className="vnp-num-part">{vehicle?.year || "2021"}</div>
              </div>
              <div className="vnp-indicator">
                <div className="vnp-indicator-text">IND</div>
                <div className="vnp-line-vertical" />
              </div>
            </div>

            <button
              className="vnp-edit-btn"
              onClick={() => setShowEditPopup(!showEditPopup)}
              aria-label="Edit vehicle"
            >
              <img
                src={getAssetUrl("EDIT")}
                alt="edit"
                className="vnp-edit-icon-img"
              />
            </button>
          </div>

          <div className="vnp-filters-row">
            {["brakeSystem", "price", "eta", "sortBy"].map((key) => (
              <div className="vnp-filter-wrapper" key={key}>
                <div
                  className="vnp-filter-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFilter(openFilter === key ? null : key);
                  }}
                >
                  <span>{filters[key] || key}</span>
                  <img src={getAssetUrl("EXPAND DOWN")} alt="" width="24" />
                </div>
                {openFilter === key && (
                  <div className="vnp-filter-dropdown" onClick={(e) => e.stopPropagation()}>
                    {filterOptions[key].map((option) => (
                      <div
                        key={option}
                        className="vnp-filter-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilters((prev) => ({ ...prev, [key]: option }));
                          setOpenFilter(null);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- EDIT DROPDOWNS ---------- */}
      {showEditPopup && (
        <div className="vnp-edit-dropdowns">
          <select className="vnp-dropdown">
            <option>Select Make</option>
          </select>
          <select className="vnp-dropdown">
            <option>Select Model</option>
          </select>
          <select className="vnp-dropdown">
            <option>Select Variant</option>
          </select>
          <select className="vnp-dropdown">
            <option>Select Fuel type</option>
          </select>
          <select className="vnp-dropdown">
            <option>Select Year</option>
          </select>
          <button
            className="vnp-find-btn"
            onClick={() => {
              setShowEditPopup(false);
              navigate("/search-by-vehicle-number");
            }}
          >
            Find Auto Parts
          </button>
        </div>
      )}

      {/* ---------- CONTENT ---------- */}
      <div className="vnp-content-wrapper">
        <div className="vnp-left-section">
          <div className="vnp-section">
            <h2 className="vnp-section-title">myTVS Recommended Products</h2>
            <div className="vnp-cards-grid">{recommendedProducts.map(renderProductCard)}</div>
          </div>

          <div className="vnp-section">
            <h2 className="vnp-section-title">Other Products</h2>
            <div className="vnp-cards-grid">{otherProducts.map(renderProductCard)}</div>
          </div>
        </div>

        <div className="vnp-right-section">
          <div className="vnp-section-right">
            <h2 className="vnp-section-title">Aligned Products</h2>
            {alignedProducts.map((product) => (
              <div className="vnp-aligned-card" key={product.partNumber}>
                <div className="vnp-image-placeholder-small">
                  <img src={product.image || NoImage} alt={product.name} width="100" />
                </div>

                <div className="vnp-aligned-details">
                  <div className="vnp-badges">
                    <span className="vnp-badge vnp-badge-valeo">{product.brand}</span>
                    <span className="vnp-badge vnp-badge-stock">In stock</span>
                    <span className="vnp-badge vnp-badge-eta">{product.eta}</span>
                  </div>

                  <p className="vnp-code">{product.partNumber}</p>
                  <p className="vnp-name" title={product.name}>
                    {product.name}
                  </p>

                  <div className="vnp-price-row">
                    <span className="vnp-price-current">₹ {product.price}.00</span>
                    <span className="vnp-price-original">₹ {product.mrp}.00</span>

                    <button
                      className={`vnp-btn-add ${isInCart(product.partNumber) ? "added" : ""}`}
                      onClick={() => handleToggleCart(product)}
                    >
                      {isInCart(product.partNumber) ? "Added" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
