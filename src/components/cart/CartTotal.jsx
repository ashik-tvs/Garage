import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import "../../styles/cart/CartTotal.css";
import Success from "./Success";

const CartTotal = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { cartItems = [] } = useCart();

  const basicPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.listPrice,
    0
  );

  const gst = basicPrice * 0.18;
  const grandTotal = basicPrice + gst;
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
            <span className="value">₹{basicPrice.toFixed(2)}</span>
          </div>

          <div className="cardtotal-row">
            <span className="label">GST (18%)</span>
            <span className="value">₹{gst.toFixed(2)}</span>
          </div>

          <div className="cardtotal-row total">
            <span className="label">Grand Total</span>
            <span className="value">₹{grandTotal.toFixed(2)}</span>
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
