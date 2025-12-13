import React, { useState } from "react";
import "../../styles/cart/CartTotal.css";
import Success from "./Success";

const CartTotal = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckout = () => {
    setLoading(true);

    // Show loader for 2 seconds
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);

      // Hide success popup automatically after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="cart-wrapper">
      <div className="cardtotal">
        <div className="cardtotal-frame">
          <div className="cardtotal-title">Cart Totals</div>

          <div className="cardtotal-row">
            <span className="label">Basic Price</span>
            <span className="value">₹0.00</span>
          </div>

          <div className="cardtotal-row">
            <span className="label">GST (18%)</span>
            <span className="value">₹0.00</span>
          </div>

          <div className="cardtotal-sep"></div>

          <div className="cardtotal-row total">
            <span className="label">Grand Total</span>
            <span className="value">₹0.00</span>
          </div>

          <button className="cardtotal-cta" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Loader + Success */}
      <Success loading={loading} showSuccess={showSuccess} />
    </div>
  );
};

export default CartTotal;
