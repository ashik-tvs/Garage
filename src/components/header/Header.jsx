import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getAssets, getAsset } from "../../utils/assets";
import Profile from "./Profile";
import "../../styles/header/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [assets, setAssets] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  // ✅ Total quantity
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header-body">
      <div className="header-container">
        {/* LEFT LOGO */}
        <div className="header-left" onClick={() => navigate("/home")}>
          <img
            src={getAsset('LOGO', assets)}
            alt="myTVS Logo"
            className="header-logo"
          />
        </div>

        {/* RIGHT ICONS */}
        <div className="header-right">
          <div
            className="header-item"
            onClick={() => navigate("/my-orders")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={getAsset('ORDER', assets)}
              alt="Orders"
              className="header-icon"
            />
            <span className="header-text">My Orders</span>
          </div>

          {/* CART */}
          <div
            className="header-item header-cart"
            onClick={() => navigate("/cart")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={getAsset('CART', assets)}
              alt="Cart"
              className="header-icon"
            />
            <span className="header-text">Cart</span>

            {/* 🔴 Cart Count Badge */}
            {cartCount > 0 && (
              <span className="header-cart-count">{cartCount}</span>
            )}
          </div>

          <div
            className="header-item"
            onClick={() => setShowProfile(!showProfile)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={getAsset('USER', assets)}
              alt="User"
              className="header-icon"
            />
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      {showProfile && <Profile />}
    </header>
  );
};

export default Header;
