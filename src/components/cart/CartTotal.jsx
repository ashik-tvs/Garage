import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import apiService from "../../services/apiservice.js";
import "../../styles/cart/CartTotal.css";
import Success from "./Success";

/* ======================
   HELPERS
====================== */
const safeString = (val, fallback = "NA") => {
  if (val === undefined || val === null) return fallback;
  if (String(val).trim() === "") return fallback;
  return String(val);
};

const safeNumberString = (val, fallback = "0") => {
  if (val === undefined || val === null) return fallback;
  if (isNaN(val)) return fallback;
  return String(val);
};

const CartTotal = () => {
  const { cartItems = [] } = useCart();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ======================
     LOGGED IN CUSTOMER
  ====================== */
  const loggedInCustomer = JSON.parse(
    localStorage.getItem("loggedInCustomer") || "{}",
  );

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  const userLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

  /* ======================
     PRICE
  ====================== */
  const basicPrice = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.listPrice || 0),
    0,
  );

  const gst = 0;
  const shipping = 0;
  const gst2 = 0;
  const total = basicPrice + gst + shipping + gst2;

  /* ======================
     AUTO CLOSE SUCCESS
  ====================== */
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  /* ======================
     TXN ID
  ====================== */
  const generateTxnId = () => {
    return (
      new Date().toISOString().replace(/[-:.TZ]/g, "") +
      Math.floor(Math.random() * 100000)
    );
  };

  /* ======================
     CHECKOUT
  ====================== */
  const handleCheckout = async () => {
    try {
      setLoading(true);

      /* ======================
         ERP PAYLOAD
      ====================== */
      const payload = {
        validity_date: new Date().toISOString().split("T")[0],

        customer_code: safeString(loggedInCustomer.party_number),
        customer_name: safeString(loggedInCustomer.party_name),
        mobile_number: safeString(loggedInCustomer.phone_number),
        employee_id: safeString(loggedInUser.user_id),

        latitude: safeString(userLocation.lat),
        longitude: safeString(userLocation.lng),

        transaction_track_id: generateTxnId(),

        total_price: safeNumberString(
          cartItems.reduce(
            (sum, item) =>
              sum + Number(item.listPrice || 0) * Number(item.quantity || 1),
            0,
          ),
        ),

        total_quantity: safeNumberString(
          cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
        ),

        part_details: cartItems.map((item, index) => {
          const qty = Number(item.quantity || 1);
          const price = Number(item.listPrice || 0);
          const subtotal = price * qty;

          return {
            parts_no: safeString(item.partNo, `PART_${index + 1}`),
            parts_name: safeString(item.description, "UNKNOWN_PART"),
            brand_name: safeString(item.brand, "GENERIC"),

            quantity: qty,
            warehouse: safeString(
              loggedInCustomer.primary_warehouse_code,
              "KMS_WHG",
            ),
            item_price: safeNumberString(price),
            sub_total: subtotal,
            tax_price: "0.00",
            total_price: safeNumberString(subtotal),
            cgst: "0.00",
            sgst: "0.00",
            igst: "0.00",
            mrp: price,
          };
        }),
      };

      console.log("FULL ERP PAYLOAD:", payload);

      /* ======================
         API CALL
      ====================== */
      const res = await apiService.post("/create-order", payload);
      console.log("ORDER RESPONSE:", res); // <- res already has data

      if (res?.success === true) {
        setShowSuccess(true);
        return;
      }

      if (res?.message?.toLowerCase().includes("success")) {
        setShowSuccess(true);
        return;
      }

      alert(res?.data?.message || "Order failed");
    } catch (err) {
      console.error("ORDER ERROR:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="cart-total-panel">
      <div className="carttotal">
        <div className="cardtotal-frame">
          <div className="cardtotal-title">Cart Totals</div>

          <div className="cardtotal-row">
            <span className="label">Basic Price</span>
            <span className="value">₹ {basicPrice.toFixed(2)}</span>
          </div>

          <div className="cardtotal-row">
            <span className="label">Shipping</span>
            <span className="value">₹ {shipping.toFixed(2)}</span>
          </div>

          <div className="cardtotal-row">
            <span className="label">GST</span>
            <span className="value">₹ {gst2.toFixed(2)}</span>
          </div>

          <div className="cardtotal-sep" />

          <div className="cardtotal-row total">
            <span className="label">Total</span>
            <span className="value">₹ {total.toFixed(2)}</span>
          </div>

          <button
            className="carttotal-submit-btn"
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>

      <Success loading={loading} showSuccess={showSuccess} />
    </div>
  );
};

export default CartTotal;
