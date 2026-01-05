import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/vehicle_number_entry/VehicleNumberProduct.css";
import apiService from "../../../services/apiservice";
import NoImage from "../../../assets/No Image.png";
import Brake_1 from "../../../assets/brake1.png";
import Brake_2 from "../../../assets/brake2.png";
import Brake_3 from "../../../assets/brake3.png";

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
  }, [aggregateName, subAggregateName, make, model]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching products for:", { 
        aggregateName, 
        subAggregateName, 
        make, 
        model 
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
        originalData: item
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
        setError(`Failed to load products: ${err.message || "Please try again."}`);
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
          fieldOrder: "lotAgeDate"
        });

        // Check if stock data exists and has quantity
        const stockItems = Array.isArray(response?.data) ? response.data : [];
        const totalQty = stockItems.reduce((sum, item) => sum + (item.qty || 0), 0);
        
        return {
          partNumber: product.partNumber,
          inStock: totalQty > 0,
          quantity: totalQty
        };
      } catch (err) {
        console.error(`Error fetching stock for ${product.partNumber}:`, err);
        return {
          partNumber: product.partNumber,
          inStock: false,
          quantity: 0
        };
      }
    });

    try {
      const stockResults = await Promise.all(stockPromises);
      const stockMap = {};
      stockResults.forEach(result => {
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
    const images = [Brake_1, Brake_2, Brake_3];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Split products into categories based on brand
  // myTVS Recommended Products: Only myTVS brand products
  const recommendedProducts = products.filter(product => 
    product.brand?.toUpperCase().includes('MYTVS') || 
    product.brand?.toUpperCase().includes('MY TVS')
  );
  
  // Other Products: All brands except myTVS
  const otherProducts = products.filter(product => 
    !(product.brand?.toUpperCase().includes('MYTVS') || 
      product.brand?.toUpperCase().includes('MY TVS'))
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

  const renderProductCard = (product) => {
    const stockInfo = stockData[product.partNumber];
    const isInStock = stockInfo?.inStock ?? true; // Default to true while loading
    
    return (
    <div className="vnp-card" key={product.partNumber}>
      <div className="vnp-image-placeholder">
        <img src={product.image || NoImage} alt={product.name} width="100" />
      </div>

      <div className="vnp-details">
        <div className="vnp-badges">
          <span className={`vnp-badge vnp-badge-${product.brand.toLowerCase()}`} title={product.brand}>
            {product.brand}
           </span>
          <span 
            className="vnp-badge vnp-badge-stock" 
            style={{ 
              backgroundColor: isInStock ? '#e7f7ee' : '#f2d5d7',
              color: isInStock ? '#16a34a' : '#c3111e'
            }}
          >
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="vnp-section-title">myTVS Recommended Products</h2>
                {recommendedProducts.length > 2 && (
                  <span 
                    className="see-more" 
                    onClick={() => setShowAllRecommended(!showAllRecommended)}
                    style={{ cursor: 'pointer', color: '#e55a2b', fontSize: '14px', marginRight: '35px' }}
                  >
                    {showAllRecommended ? 'See Less' : 'See More'}
                  </span>
                )}
              </div>
              <div className="vnp-cards-grid">
                {recommendedProducts.length > 0 ? (
                  (showAllRecommended ? recommendedProducts : recommendedProducts.slice(0, 2)).map(renderProductCard)
                ) : (
                  <p>No recommended products found.</p>
                )}
              </div>
            </div>

            <div className="vnp-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="vnp-section-title">Other Products</h2>
                {otherProducts.length > 2 && (
                  <span 
                    className="see-more" 
                    onClick={() => setShowAllOther(!showAllOther)}
                    style={{ cursor: 'pointer', color: '#e55a2b', fontSize: '14px', marginRight: '35px' }}
                  >
                    {showAllOther ? 'See Less' : 'See More'}
                  </span>
                )}
              </div>
              <div className="vnp-cards-grid">
                {otherProducts.length > 0 ? (
                  (showAllOther ? otherProducts : otherProducts.slice(0, 2)).map(renderProductCard)
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
                  <img src={product.image || NoImage} alt={product.name} width="100" />
                </div>

                <div className="vnp-aligned-details">
                  <div className="vnp-badges">
                    <span className="vnp-badge vnp-badge-valeo" title={product.brand}>{product.brand}</span>
                    <span 
                      className="vnp-badge vnp-badge-stock"
                      style={{ 
                        backgroundColor: isInStock ? '#e7f7ee' : '#f2d5d7',
                        color: isInStock ? '#16a34a' : '#c3111e'
                      }}
                    >
                      {isInStock ? 'In Stock' : 'Out of Stock'}
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
