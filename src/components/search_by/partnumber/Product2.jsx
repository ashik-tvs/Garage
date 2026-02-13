import React, { useState } from "react";
import { useCart } from "../../../context/CartContext";
import "../../../styles/search_by/partnumber/product2.css";
import "../../../styles/skeleton/skeleton.css";

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
const Product2 = ({ title, products = [], layout = "horizontal", onAddToCart, onCompatibilityClick, isLoadingCounts = false }) => {
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
  const displayProducts = layout === "horizontal" 
    ? products.slice() 
    : products;

  const hasMoreProducts = layout === "horizontal" && products.length > 4;

  return (
    <div className={`product2-section ${layout === "vertical" ? "aligned-section" : ""}`}>
      {/* Section Title */}
      {title && (
        <h2 className="product2-section-title">{title}</h2>
      )}
      
      {/* Products Container */}
      <div className={`product2-container ${layout === "vertical" ? "vertical" : "horizontal"}`}>
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <div key={product.id} className={`product2-card ${layout === "vertical" ? "aligned-card" : ""}`}>
            
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
                <div className="product2-content">
                  {/* Left Column - Info */}
                  <div className="product2-info">
                    {/* Top Tags */}
                    <div className="product2-tags">
                      <span className="product2-tag brand-tag" title={product.brand}>{product.brand}</span>
                      <span 
                        className={`product2-tag stock-tag ${
                          (product.stockStatus || "").toLowerCase().includes("out of stock") ? "out-of-stock" : ""
                        }`} 
                        title={product.stockStatus || "in stock"}
                      >
                        {product.stockStatus || "in stock"}
                      </span>
                      <span className="product2-tag delivery-tag" title={product.deliveryTime || "1-2 Days"}>
                        {product.deliveryTime || "1-2 Days"}
                      </span>
                    </div>

                    {/* Product Code */}
                    <div className="product2-code">{product.partNumber}</div>

                    {/* Product Name */}
                    <div className="product2-name" title={product.name}>{product.name}</div>
                  </div>

                  {/* Right Column - Image */}
                  <div className="product2-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product2-image"
                      onError={(e) => {
                        e.target.src = "/assets/No Image.png";
                      }}
                    />
                  </div>
                </div>

                {/* Price Section */}
                <div className="product2-price-section">
                  <span className="product2-price">₹ {product.price.toFixed(2)}</span>
                  <span className="product2-mrp">₹ {(product.mrp || 0).toFixed(2)}</span>
                  <button
                    className={`product2-add-btn ${isInCart(product.cartId || product.partNumber) ? 'added' : ''}`}
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
                className="product2-compatible"
                onClick={() => !isLoadingCounts && onCompatibilityClick && onCompatibilityClick(product)}
                style={{ cursor: isLoadingCounts ? 'default' : (onCompatibilityClick ? 'pointer' : 'default') }}
              >
                <span>
                  {isLoadingCounts 
                    ? <div className="skeleton skeleton-text small" style={{ display: 'inline-block', width: '120px', height: '12px' }}></div>
                    : `Compatible with ${product.compatibleVehicles || 0} vehicles`
                  }
                </span>
                {!isLoadingCounts && <span className="product2-arrow">›</span>}
              </div>
            )}
          </div>
        ))
        ) : (
          <div className="product2-no-results">
            <p>No {title?.toLowerCase() || 'products'} found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product2;