import React, { useState } from "react";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/partnumber/Product1.css";

/**
 * Reusable Product Card Component
 * Displays products in horizontal or vertical layout
 * 
 * @param {string} title - Section title (e.g., "myTVS Recommended Products")
 * @param {Array} products - Array of product objects
 * @param {string} layout - "horizontal" (3 per row) or "vertical" (1 per row)
 * @param {function} onAddToCart - Callback when Add button is clicked
 * @param {function} onCompatibilityClick - Callback when compatibility section is clicked
 * @param {boolean} isLoadingCounts - Whether vehicle counts are still loading
 * 
 * Product object structure:
 * {
 *   id: string,
 *   partNumber: string,  // Display part number (original)
 *   cartId: string,      // Unique identifier for cart operations (partNumber_brand_index)
 *   name: string,
 *   image: string,
 *   brand: string,
 *   price: number,
 *   mrp: number,
 *   stockStatus: string,
 *   deliveryTime: string,
 *   compatibleVehicles: number
 * }
 */
const Product1 = ({ title, products = [], layout = "horizontal", onAddToCart, onCompatibilityClick, isLoadingCounts = false }) => {
  const [showAll, setShowAll] = useState(false);
  const { cartItems, removeFromCart } = useCart();

  const isInCart = (cartId) => {
    return cartItems.some(item => item.partNumber === cartId);
  };

  const handleAddClick = (product) => {
    // Use cartId (unique identifier) for cart operations
    const identifier = product.cartId || product.partNumber;
    
    // Toggle: if already in cart, remove it; otherwise add it
    if (isInCart(identifier)) {
      removeFromCart(identifier);
    } else {
      if (onAddToCart) {
        onAddToCart(product);
      }
    }
  };

  // For horizontal layout, show only 3 products (1 row) initially
  const displayProducts = layout === "horizontal" && !showAll 
    ? products.slice(0, 3) 
    : products;

  const hasMoreProducts = layout === "horizontal" && products.length > 3;

  return (
    <div className={`product1-section ${layout === "vertical" ? "aligned-section" : ""}`}>
      {/* Section Title with See More */}
      {title && (
        <div className="product1-header">
          <h2 className="product1-section-title">{title}</h2>
          {hasMoreProducts && (
            <span 
              className="product1-see-more" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "See Less" : "See More"}
            </span>
          )}
        </div>
      )}

      {/* Products Container */}
      <div className={`product1-container ${layout === "vertical" ? "vertical" : "horizontal"}`}>
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <div key={product.id} className={`product1-card ${layout === "vertical" ? "aligned-card" : ""}`}>
            
            {/* Aligned Product Layout - Image Left, Info Right, Button Bottom */}
            {layout === "vertical" ? (
              <>
                {/* Top Section - Image and Info Side by Side */}
                <div className="aligned-top-section">
                  {/* Left - Image */}
                  <div className="aligned-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="aligned-image"
                      onError={(e) => {
                        e.target.src = "/assets/No Image.png";
                      }}
                    />
                  </div>

                  {/* Right - Product Info */}
                  <div className="aligned-info">
                    {/* Tags */}
                    <div className="aligned-tags">
                      <span className="aligned-tag brand-tag" title={product.brand}>{product.brand}</span>
                      <span 
                        className={`aligned-tag stock-tag ${
                          (product.stockStatus || "").toLowerCase().includes("out of stock") ? "out-of-stock" : ""
                        }`} 
                        title={product.stockStatus || "in stock"}
                      >
                        {product.stockStatus || "in stock"}
                      </span>
                      <span className="aligned-tag delivery-tag" title={product.deliveryTime || "1-2 Days"}>
                        {product.deliveryTime || "1-2 Days"}
                      </span>
                    </div>

                    {/* Product Code */}
                    <div className="aligned-code">{product.partNumber}</div>

                    {/* Product Name */}
                    <div className="aligned-name" title={product.name}>{product.name}</div>
                  </div>
                </div>

                {/* Bottom Section - Add Button and Price */}
                <div className="aligned-bottom-section">
                  <button
                    className={`aligned-add-btn ${isInCart(product.cartId || product.partNumber) ? 'added' : ''}`}
                    onClick={() => handleAddClick(product)}
                  >
                    {isInCart(product.cartId || product.partNumber) ? 'Added' : 'Add'}
                  </button>
                  <div className="aligned-price-section">
                    <span className="aligned-price">₹ {product.price.toFixed(2)}</span>
                    <span className="aligned-mrp">₹ {(product.mrp || 0).toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              /* Horizontal Layout - Original Structure */
              <>
                {/* Main Content - Side by Side Layout */}
                <div className="product1-content">
                  {/* Left Column - Info */}
                  <div className="product1-info">
                    {/* Top Tags */}
                    <div className="product1-tags">
                      <span className="product1-tag brand-tag" title={product.brand}>{product.brand}</span>
                      <span 
                        className={`product1-tag stock-tag ${
                          (product.stockStatus || "").toLowerCase().includes("out of stock") ? "out-of-stock" : ""
                        }`} 
                        title={product.stockStatus || "in stock"}
                      >
                        {product.stockStatus || "in stock"}
                      </span>
                      <span className="product1-tag delivery-tag" title={product.deliveryTime || "1-2 Days"}>
                        {product.deliveryTime || "1-2 Days"}
                      </span>
                    </div>

                    {/* Product Code */}
                    <div className="product1-code">{product.partNumber}</div>

                    {/* Product Name */}
                    <div className="product1-name" title={product.name}>{product.name}</div>
                  </div>

                  {/* Right Column - Image */}
                  <div className="product1-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product1-image"
                      onError={(e) => {
                        e.target.src = "/assets/No Image.png";
                      }}
                    />
                  </div>
                </div>

                {/* Price Section */}
                <div className="product1-price-section">
                  <span className="product1-price">₹ {product.price.toFixed(2)}</span>
                  <span className="product1-mrp">₹ {(product.mrp || 0).toFixed(2)}</span>
                  <button
                    className={`product1-add-btn ${isInCart(product.cartId || product.partNumber) ? 'added' : ''}`}
                    onClick={() => handleAddClick(product)}
                  >
                    {isInCart(product.cartId || product.partNumber) ? 'Added' : 'Add'}
                  </button>
                </div>
              </>
            )}

            {/* Compatible Vehicles */}
            {onCompatibilityClick && (
              <div 
                className="product1-compatible"
                onClick={() => !isLoadingCounts && onCompatibilityClick && onCompatibilityClick(product)}
                style={{ cursor: isLoadingCounts ? 'default' : (onCompatibilityClick ? 'pointer' : 'default') }}
              >
                <span>
                  {isLoadingCounts 
                    ? "Loading compatibility..." 
                    : `Compatible with ${product.compatibleVehicles || 0} vehicles`
                  }
                </span>
                {!isLoadingCounts && <span className="product1-arrow">›</span>}
              </div>
            )}
          </div>
        ))
        ) : (
          <div className="product1-no-results">
            <p>No {title?.toLowerCase() || 'products'} found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product1;
