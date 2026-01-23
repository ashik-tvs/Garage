import React, { useState } from "react";
import "../../../styles/search_by/partnumber/Product1.css";

/**
 * Reusable Product Card Component
 * Displays products in horizontal or vertical layout
 * 
 * @param {string} title - Section title (e.g., "myTVS Recommended Products")
 * @param {Array} products - Array of product objects
 * @param {string} layout - "horizontal" (3 per row) or "vertical" (1 per row)
 * @param {function} onAddToCart - Callback when Add button is clicked
 * 
 * Product object structure:
 * {
 *   id: string,
 *   partNumber: string,
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
const Product1 = ({ title, products = [], layout = "horizontal", onAddToCart }) => {
  const [showAll, setShowAll] = useState(false);

  const handleAddClick = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
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
        {displayProducts.map((product) => (
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
                      <span className="aligned-tag brand-tag">{product.brand}</span>
                      <span className="aligned-tag stock-tag">
                        {product.stockStatus || "in stock"}
                      </span>
                      <span className="aligned-tag delivery-tag">
                        {product.deliveryTime || "1-2 Days"}
                      </span>
                    </div>

                    {/* Product Code */}
                    <div className="aligned-code">{product.partNumber}</div>

                    {/* Product Name */}
                    <div className="aligned-name" title={product.name}>{product.name}</div>
                  </div>
                </div>

                {/* Bottom Section - Price and Add Button */}
                <div className="aligned-bottom-section">
                  <div className="aligned-price-section">
                    <span className="aligned-price">₹ {product.price.toFixed(2)}</span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="aligned-mrp">₹ {product.mrp.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    className="aligned-add-btn"
                    onClick={() => handleAddClick(product)}
                  >
                    Add
                  </button>
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
                      <span className="product1-tag brand-tag">{product.brand}</span>
                      <span className="product1-tag stock-tag">
                        {product.stockStatus || "in stock"}
                      </span>
                      <span className="product1-tag delivery-tag">
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
                  {product.mrp && product.mrp > product.price && (
                    <span className="product1-mrp">₹ {product.mrp.toFixed(2)}</span>
                  )}
                  <button
                    className="product1-add-btn"
                    onClick={() => handleAddClick(product)}
                  >
                    Add
                  </button>
                </div>
              </>
            )}

            {/* Compatible Vehicles */}
            {product.compatibleVehicles && (
              <div className="product1-compatible">
                <span>Compatible with {product.compatibleVehicles} vehicles</span>
                <span className="product1-arrow">›</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product1;
