import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/vehicle_number_entry/VehicleNumberProduct.css";

import NoImage from "../../../assets/No Image.png";
import LeftArrow from "../../../assets/vehicle_search_entry/LeftArrow.png";
import RightArrow from "../../../assets/vehicle_search_entry/RightArrow.png";
import Edit from "../../../assets/vehicle_search_entry/edit.png";
import ExpandDown from "../../../assets/vehicle_search_entry/dropdown.png";

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
  },
  {
    partNumber: "207510",
    name: "Front Brake Pad",
    brand: "myTVS",
    price: 480,
    mrp: 650,
    stockQty: 5,
    eta: "1-2 Days",
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
  },
  {
    partNumber: "LF16080",
    name: "Brake Pad for Car (Set of 4)",
    brand: "Bosch",
    price: 520,
    mrp: 700,
    stockQty: 6,
    eta: "1-2 Days",
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
  },
  {
    partNumber: "99000M24120-624",
    name: "Brake Fluid",
    brand: "Valeo",
    price: 300,
    mrp: 450,
    stockQty: 15,
    eta: "1-2 Days",
  },
  {
    partNumber: "T0494M81207",
    name: "Brake Fitting Kit",
    brand: "Valeo",
    price: 380,
    mrp: 520,
    stockQty: 7,
    eta: "1-2 Days",
  },
];

/* ---------------- COMPONENT ---------------- */

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const isInCart = (partNumber) =>
    cartItems.some((item) => item.partNumber === partNumber);

  // Get navigation flow data from state
  const { vehicle, make, model, brand, category, subCategory } =
    location.state || {};

  // ✅ Normalize product before adding to cart
  const handleToggleCart = (product) => {
    if (isInCart(product.partNumber)) {
      removeFromCart(product.partNumber); // REMOVE (Added → Add)
    } else {
      addToCart({
        partNumber: product.partNumber,
        itemDescription: product.name,
        listPrice: product.price,
        stockQty: product.stockQty,
        imageUrl: NoImage,
      });
    }
  };

  const renderProductCard = (product) => (
    <div className="vnp-card" key={product.partNumber}>
      <div className="vnp-image-placeholder">No Image</div>

      <div className="vnp-details">
        <div className="vnp-badges">
          <span className={`vnp-badge vnp-badge-${product.brand.toLowerCase()}`}>
            {product.brand}
          </span>
          <span className="vnp-badge vnp-badge-stock">In stock</span>
          <span className="vnp-badge vnp-badge-eta">{product.eta}</span>
        </div>

        <p className="vnp-code">{product.partNumber}</p>
        <p className="vnp-name">{product.name}</p>

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
            src={LeftArrow}
            alt="Back"
            width="10"
            height="10"
            style={{
              cursor: "pointer",
              backgroundColor: "#F36F21",
              padding: "4px",
              borderRadius: "50px",
            }}
            onClick={() => navigate(-1)}
          />
          {brand && (
            <>
              <span>{brand}</span>
              <img src={RightArrow} alt="" width="15" height="15" />
            </>
          )}
          {make && (
            <>
              <span>{make}</span>
              <img src={RightArrow} alt="" width="15" height="15" />
            </>
          )}
          {model && (
            <>
              <span>{model}</span>
              <img src={RightArrow} alt="" width="10" height="10" />
            </>
          )}
          {category && (
            <>
              <span>{category}</span>
              <img src={RightArrow} alt="" width="15" height="15" />
            </>
          )}
          {subCategory && <span>{subCategory.name || subCategory}</span>}
        </div>

        <div className="vnp-top-right">
          {/* Group 480960940 - Vehicle Group */}
          <div className="vnp-vehicle-group">
            {/* Group 1000006927 */}
            <div className="vnp-filter-frame">
              {/* Rectangle 1769 */}
              <div className="vnp-filter-rect" />

              {/* Number group */}
              <div className="vnp-filter-number">
                {/* Hyundai */}
                <div className="vnp-num-part">{vehicle?.make || 'Hyundai'}</div>
                
                {/* Separator */}
                <div className="vnp-sep">-</div>
                
                {/* Grand */}
                <div className="vnp-num-part">{vehicle?.model || 'Grand'}</div>
                
                {/* Separator */}
                <div className="vnp-sep">-</div>
                
                {/* i10 */}
                <div className="vnp-num-part">{vehicle?.variant || 'i10'}</div>
                
                {/* Separator */}
                <div className="vnp-sep">-</div>
                
                {/* Petrol */}
                <div className="vnp-num-part">{vehicle?.fuel || 'Petrol'}</div>
                
                {/* Separator */}
                <div className="vnp-sep">-</div>
                
                {/* 2021 */}
                <div className="vnp-num-part">{vehicle?.year || '2021'}</div>
              </div>

              {/* Hidden indicator */}
              <div className="vnp-indicator">
                <div className="vnp-indicator-text">IND</div>
                <div className="vnp-line-vertical" />
              </div>
            </div>

            {/* Frame 15 - Edit button */}
            <button 
              className="vnp-edit-btn" 
              onClick={() => setShowEditPopup(!showEditPopup)}
              aria-label="Edit vehicle"
            >
              <img src={Edit} alt="edit" className="vnp-edit-icon-img" />
            </button>
          </div>

          <div className="vnp-filters-row">
            {["Brake System", "Price", "ETA", "Sort by"].map((f) => (
              <div className="vnp-filter-item" key={f}>
                <span>{f}</span>
                <img src={ExpandDown} alt="" width="24" />
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
          <button className="vnp-find-btn" onClick={() => setShowEditPopup(false)}>Find Auto Parts</button>
        </div>
      )}

      {/* ---------- CONTENT ---------- */}
      <div className="vnp-content-wrapper">
        <div className="vnp-left-section">
          <div className="vnp-section">
            <h2 className="vnp-section-title">myTVS Recommended Products</h2>
            <div className="vnp-cards-grid">
              {recommendedProducts.map(renderProductCard)}
            </div>
          </div>

          <div className="vnp-section">
            <h2 className="vnp-section-title">Other Products</h2>
            <div className="vnp-cards-grid">
              {otherProducts.map(renderProductCard)}
            </div>
          </div>
        </div>

        <div className="vnp-right-section">
          <div className="vnp-section-right">
            <h2 className="vnp-section-title">Aligned Products</h2>

            {alignedProducts.map((product) => (
              <div className="vnp-aligned-card" key={product.partNumber}>
                <div className="vnp-image-placeholder-small">No Image</div>

                <div className="vnp-aligned-details">
                  <div className="vnp-badges">
                    <span className="vnp-badge vnp-badge-valeo">{product.brand}</span>
                    <span className="vnp-badge vnp-badge-stock">In stock</span>
                    <span className="vnp-badge vnp-badge-eta">{product.eta}</span>
                  </div>

                  <p className="vnp-code">{product.partNumber}</p>
                  <p className="vnp-name">{product.name}</p>

                  <div className="vnp-price-row">
                    <span className="vnp-price-current">₹ {product.price}.00</span>
                    <span className="vnp-price-original">₹ {product.mrp}.00</span>

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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
