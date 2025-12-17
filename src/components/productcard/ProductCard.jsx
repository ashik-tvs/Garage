// components/ProductCard.jsx
import React from "react";
import { useCart } from "../../context/CartContext";
import NoImage from "../../assets/No Image.png";

const ProductCard = ({ item }) => {
  const { cartItems, addToCart, removeFromCart } = useCart();

  const isAdded = cartItems.some(
    (cartItem) => cartItem.partNumber === item.code
  );

  const handleClick = () => {
    isAdded
      ? removeFromCart(item.code)
      : addToCart({
          partNumber: item.code,
          itemDescription: item.title,
          listPrice: item.price,
          imageUrl: NoImage,
          brand: item.brand,
        });
  };

  return (
    <div className="pn-card">
      <img src={NoImage} className="pn-product-img" alt="product" />

      <div className="pn-badges">
        <span className="pn-badge brand">{item.brand}</span>
        <span className="pn-badge success">In stock</span>
        <span className="pn-badge muted">1-2 Days</span>
      </div>

      <div className="pn-code">{item.code}</div>
      <div className="pn-title">{item.title}</div>

      <div className="pn-price-row">
        <span className="pn-price">₹ {item.price}.00</span>
        <span className="pn-mrp">₹ {item.mrp}.00</span>

        <button
          className={`pn-add-btn ${isAdded ? "added" : ""}`}
          onClick={handleClick}
        >
          {isAdded ? "Added" : "Add"}
        </button>
      </div>

      <div className="pn-meta">
        <span>{item.model}</span>
        <span>{item.fuel}</span>
        <span>{item.year}</span>
      </div>
    </div>
  );
};

export default ProductCard;
