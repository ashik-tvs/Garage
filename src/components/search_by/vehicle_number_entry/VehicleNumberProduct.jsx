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
  const { addToCart } = useCart();
  const [showEditPopup, setShowEditPopup] = useState(false);

  // Get navigation flow data from state
  const { vehicle, make, model, brand, category, subCategory } = location.state || {};

  // ✅ Normalize product before adding to cart
  const handleAdd = (product) => {
    addToCart({
      partNumber: product.partNumber,
      itemDescription: product.name,
      listPrice: product.price,
      stockQty: product.stockQty,
      imageUrl: NoImage,
    });

  };

  const renderProductCard = (product) => (
    <div className="product-card" key={product.partNumber}>
      <div className="product-image-placeholder">No Image</div>

      <div className="product-details">
        <div className="product-badges">
          <span className={`badge badge-${product.brand.toLowerCase()}`}>
            {product.brand}
          </span>
          <span className="badge badge-stock">In stock</span>
          <span className="badge badge-eta">{product.eta}</span>
        </div>

        <p className="product-code">{product.partNumber}</p>
        <p className="product-name">{product.name}</p>

        <div className="product-price-row">
          <span className="price-current">₹ {product.price}.00</span>
          <span className="price-original">₹ {product.mrp}.00</span>

          <button
            className="btn-add"
            onClick={() => handleAdd(product)}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="product-container">

      {/* ---------- TOP SECTION ---------- */}
      <div className="product-top-row">
        <div className="product-breadcrumbs">
          <img 
            src={LeftArrow} 
            alt="Back" 
            width="24" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          />
          {brand && (
            <>
              <span>{brand}</span>
              <img src={RightArrow} alt="" width="16" />
            </>
          )}
          {make && (
            <>
              <span>{make}</span>
              <img src={RightArrow} alt="" width="16" />
            </>
          )}
          {model && (
            <>
              <span>{model}</span>
              <img src={RightArrow} alt="" width="16" />
            </>
          )}
          {category && (
            <>
              <span>{category}</span>
              <img src={RightArrow} alt="" width="16" />
            </>
          )}
          {subCategory && (
            <span>{subCategory.name || subCategory}</span>
          )}
        </div>

        <div className="product-top-right">
          <div className="product-vehicle-row">
            <span>
              {vehicle 
                ? `${vehicle.make || 'Hyundai'} - ${vehicle.model || 'Grand i10'} - ${vehicle.variant || ''} ${vehicle.fuel || 'Petrol'} - ${vehicle.year || '2021'}`.replace(/  +/g, ' ').trim()
                : 'Hyundai - Grand i10 - Petrol - 2021'
              }
            </span>
            <img
              src={Edit}
              alt="Edit"
              className="edit-icon"
              onClick={() => setShowEditPopup(!showEditPopup)}
            />
          </div>

          <div className="product-filters-row">
            {["Brake System", "Price", "ETA", "Sort by"].map((f) => (
              <div className="filter-item" key={f}>
                <span>{f}</span>
                <img src={ExpandDown} alt="" width="24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- EDIT DROPDOWNS ---------- */}
      {showEditPopup && (
        <div className="product-edit-dropdowns">
          <select className="product-dropdown">
            <option>Select Make</option>
          </select>
          <select className="product-dropdown">
            <option>Select Model</option>
          </select>
          <select className="product-dropdown">
            <option>Select Variant</option>
          </select>
          <select className="product-dropdown">
            <option>Select Fuel type</option>
          </select>
          <select className="product-dropdown">
            <option>Select Year</option>
          </select>
          <button className="product-find-btn" onClick={() => setShowEditPopup(false)}>Find Auto Parts</button>
        </div>
      )}

      {/* ---------- CONTENT ---------- */}
      <div className="product-content-wrapper">
        <div className="product-left-section">

          <div className="product-section">
            <h2 className="section-title">myTVS Recommended Products</h2>
            <div className="product-cards-grid">
              {recommendedProducts.map(renderProductCard)}
            </div>
          </div>

          <div className="product-section">
            <h2 className="section-title">Other Products</h2>
            <div className="product-cards-grid">
              {otherProducts.map(renderProductCard)}
            </div>
          </div>

        </div>

        <div className="product-right-section">
          <div className="product-section">
            <h2 className="section-title">Aligned Products</h2>

            {alignedProducts.map((product) => (
              <div className="aligned-product-card" key={product.partNumber}>
                <div className="product-image-placeholder-small">No Image</div>

                <div className="aligned-product-details">
                  <div className="product-badges">
                    <span className="badge badge-valeo">
                      {product.brand}
                    </span>
                    <span className="badge badge-stock">In stock</span>
                    <span className="badge badge-eta">{product.eta}</span>
                  </div>

                  <p className="product-code">{product.partNumber}</p>
                  <p className="product-name">{product.name}</p>

                  <div className="product-price-row">
                    <span className="price-current">
                      ₹ {product.price}.00
                    </span>
                    <span className="price-original">
                      ₹ {product.mrp}.00
                    </span>

                    <button
                      className="btn-add"
                      onClick={() => handleAdd(product)}
                    >
                      Add
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
