import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/vehicle_number_entry/VehicleNumberProduct.css";

import NoImage from "../../../assets/No Image.png";
import LeftArrow from "../../../assets/vehicle_search_entry/LeftArrow.png";
import RightArrow from "../../../assets/vehicle_search_entry/RightArrow.png";
import Edit from "../../../assets/vehicle_search_entry/edit.png";
import ExpandDown from "../../../assets/vehicle_search_entry/dropdown.png";
import Brake_1 from "../../../assets/brake1.png";
import Brake_2 from "../../../assets/brake2.png";
import Brake_3 from "../../../assets/brake3.png";

/* ---------------- COMPONENT ---------------- */

const Product = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFilter, setOpenFilter] = useState(null);

  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  // Product states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isInCart = (partNumber) =>
    cartItems.some((item) => item.partNumber === partNumber);

  // Get navigation flow data from state
  const { vehicle, make, model, brand, category, subCategory, aggregateName, subAggregateName } =
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

  // Fetch products based on category and subcategory
  useEffect(() => {
    if (aggregateName && subAggregateName) {
      fetchProducts();
    }
  }, [aggregateName, subAggregateName]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching products for:", { aggregateName, subAggregateName });

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Please login to view products");
      }

      const response = await axios.post(
        "http://localhost:5000/api/catalog/parts-list",
        {
          brandPriority: ["VALEO"],
          limit: 100,
          offset: 0,
          sortOrder: "ASC",
          fieldOrder: null,
          customerCode: "0046",
          partNumber: null,
          model: null,
          brand: null,
          subAggregate: subAggregateName, // From SubCategory selection
          aggregate: aggregateName, // From Category selection
          make: null,
          variant: null,
          fuelType: null,
          vehicle: null,
          year: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      console.log("Products API Response:", response.data);

      // Handle different response structures
      let partsData = [];
      if (Array.isArray(response.data)) {
        partsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        partsData = response.data.data;
      }

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
        originalData: item
      }));

      console.log("Formatted products:", formattedProducts);
      setProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(`Failed to load products: ${err.message || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get random product image
  const getRandomImage = () => {
    const images = [Brake_1, Brake_2, Brake_3];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Split products into categories (you can modify this logic as needed)
  const recommendedProducts = products.slice(0, Math.ceil(products.length * 0.3));
  const otherProducts = products.slice(Math.ceil(products.length * 0.3), Math.ceil(products.length * 0.6));
  const alignedProducts = products.slice(Math.ceil(products.length * 0.6));
  useEffect(() => {
    const close = () => setOpenFilter(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

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
        imageUrl: product.image || NoImage,
      });
    }
  };

  const renderProductCard = (product) => (
    <div className="vnp-card" key={product.partNumber}>
      <div className="vnp-image-placeholder">
        {" "}
        <img
          src={product.image || NoImage}
          alt={product.name}
          width="100"
          height="auto"
        />
      </div>

      <div className="vnp-details">
        <div className="vnp-badges">
          <span
            className={`vnp-badge vnp-badge-${product.brand.toLowerCase()}`}
          >
            {product.brand}
          </span>
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

  return (
    <div className="vnp-container">
      {/* ---------- TOP SECTION ---------- */}
      <div className="vnp-top-row">
        <div className="vnp-breadcrumbs">
          <img
            src={LeftArrow}
            alt="Back"
            onClick={() => navigate(-1)}
            className="vnp-breadcrumbs-icon"
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
                <div className="vnp-num-part">{vehicle?.make || "Hyundai"}</div>

                {/* Separator */}
                <div className="vnp-sep">-</div>

                {/* Grand */}
                <div className="vnp-num-part">{vehicle?.model || "Grand"}</div>

                {/* Separator */}
                <div className="vnp-sep">-</div>

                {/* i10 */}
                <div className="vnp-num-part">{vehicle?.variant || "i10"}</div>

                {/* Separator */}
                <div className="vnp-sep">-</div>

                {/* Petrol */}
                <div className="vnp-num-part">{vehicle?.fuel || "Petrol"}</div>

                {/* Separator */}
                <div className="vnp-sep">-</div>

                {/* 2021 */}
                <div className="vnp-num-part">{vehicle?.year || "2021"}</div>
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
            {[
              { key: "brakeSystem", label: "Brake System" },
              { key: "price", label: "Price" },
              { key: "eta", label: "ETA" },
              { key: "sortBy", label: "Sort by" },
            ].map(({ key, label }) => (
              <div className="vnp-filter-wrapper" key={key}>
                <div
                  className="vnp-filter-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFilter(openFilter === key ? null : key);
                  }}
                >
                  <span>{filters[key] || label}</span>
                  <img src={ExpandDown} alt="" width="24" />
                </div>

                {openFilter === key && (
                  <div
                    className="vnp-filter-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          Loading products...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red', fontSize: '16px', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={fetchProducts}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="vnp-content-wrapper">
          <div className="vnp-left-section">
            <div className="vnp-section">
              <h2 className="vnp-section-title">myTVS Recommended Products</h2>
              <div className="vnp-cards-grid">
                {recommendedProducts.length > 0 ? (
                  recommendedProducts.map(renderProductCard)
                ) : (
                  <p>No recommended products found.</p>
                )}
              </div>
            </div>

            <div className="vnp-section">
              <h2 className="vnp-section-title">Other Products</h2>
              <div className="vnp-cards-grid">
                {otherProducts.length > 0 ? (
                  otherProducts.map(renderProductCard)
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
                alignedProducts.map((product) => (
              <div className="vnp-aligned-card" key={product.partNumber}>
                <div className="vnp-image-placeholder-small">
                  <img
                    src={product.image || NoImage}
                    alt={product.name}
                    width="100"
                    height="auto"
                  />
                </div>

                <div className="vnp-aligned-details">
                  <div className="vnp-badges">
                    <span className="vnp-badge vnp-badge-valeo">
                      {product.brand}
                    </span>
                    <span className="vnp-badge vnp-badge-stock">In stock</span>
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
            ))
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
