import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Logo from "../../assets/header/Logo.png";
import CartIcon from "../../assets/header/Cart.png";
import UserIcon from "../../assets/header/User.png";
import ChecklistIcon from "../../assets/header/checklist.png";
import "../../styles/header/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  // ✅ Total quantity
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header className="header-body">
      <div className="header-container">

        {/* LEFT LOGO */}
        <div className="header-left" onClick={() => navigate("/")}>
          <img src={Logo} alt="myTVS Logo" className="header-logo" />
        </div>

        {/* RIGHT ICONS */}
        <div className="header-right">

          <div
            className="header-item"
            onClick={() => navigate("/my-orders")}
            style={{ cursor: "pointer" }}
          >
            <img src={ChecklistIcon} alt="Orders" className="header-icon" />
            <span className="header-text">My Orders</span>
          </div>

          {/* CART */}
          <div
           
            className="header-item header-cart"
            onClick={() => navigate("/cart")}
            style={{ cursor: "pointer" }}
          
          >
            <img src={CartIcon} alt="Cart" className="header-icon" />
            <span className="header-text">Cart</span>

            {/* 🔴 Cart Count Badge */}
            {cartCount > 0 && (
              <span className="header-cart-count">{cartCount}</span>
            )}
          </div>

          <div className="header-item">
            <img src={UserIcon} alt="User" className="header-icon" />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
