import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import apiService from "../../services/apiservice";
import Profile from "./Profile";
import "../../styles/header/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [showProfile, setShowProfile] = useState(false);
  const [uiAssets, setUiAssets] = useState({});

  // ✅ Total quantity
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets"); // returns { success: true, data: {...} }
        setUiAssets(assets.data); // use 'data' from backend
      } catch (err) {
        console.error("❌ Failed to load UI assets", err);
      }
    };

    fetchUiAssets();
  }, []);

  return (
    <header className="header-body">
      <div className="header-container">
        {/* LEFT LOGO */}
        <div className="header-left" onClick={() => navigate("/home")}>
          {uiAssets.LOGO && (
            <img
              src={apiService.getAssetUrl(uiAssets.LOGO)}
              alt="myTVS Logo"
              className="header-logo"
            />
          )}
        </div>

        {/* RIGHT ICONS */}
        <div className="header-right">
          <div
            className="header-item"
            onClick={() => navigate("/my-orders")}
            style={{ cursor: "pointer" }}
          >
            {uiAssets.ORDER && (
              <img
                src={apiService.getAssetUrl(uiAssets.ORDER)}
                alt="Orders"
                className="header-icon"
              />
            )}
            <span className="header-text">My Orders</span>
          </div>

          {/* CART */}
          <div
            className="header-item header-cart"
            onClick={() => navigate("/cart")}
            style={{ cursor: "pointer" }}
          >
            {uiAssets.CART && (
              <img
                src={apiService.getAssetUrl(uiAssets.CART)}
                alt="Cart"
                className="header-icon"
              />
            )}
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
            {uiAssets.USER && (
              <img
                src={apiService.getAssetUrl(uiAssets.USER)}
                alt="User"
                className="header-icon"
              />
            )}
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      {showProfile && <Profile />}
    </header>
  );
};

export default Header;
