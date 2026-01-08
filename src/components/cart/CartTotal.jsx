import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import apiService from "../../services/apiservice";
import "../../styles/cart/CartTotal.css";
import Success from "./Success";

const CartTotal = () => {
  const { cartItems = [] } = useCart();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const basicPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.listPrice,
    0
  );

  // For demo, use static values to match the image
  // In real use, calculate as needed
  const gst = 5984.0;
  const shipping = 5984.0;
  const gst2 = 5984.0;
  const total = 33068.0;

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // 1️⃣ Generate SOURCE ORDER ID
      const sourceOrderId = "MOF" + Date.now();

      // 2️⃣ Create order payload
      const payload = [
        {
          BATCH: "20241022",
          Order_preference: "Y",
          Legal_Entity: "TVS Automobile Solutions Private Limited",
          Unique_Identifier: Date.now().toString(),
          Warehouse: "TASL_COI",
          SalesOrder_number: sourceOrderId,
          Order_Type: "Credit",
          ordered_creation_date: new Date().toISOString(),
          Customer_number: "50004683",
          Customer_site: "81735524",
          Customer_name: "SRI MEENAKSHI AUTO SPARES",
          Business_Unit: "TVS ASL Parts",
          order_entry_source: "A",
          Source_reference: "OPS",
          Credit_Cash: "Credit",
          Payment_term: "IMMEDIATE",
          expiry_date: new Date(Date.now() + 5 * 86400000).toISOString(),
          noOfLines: cartItems.length,
          Operation: "Create",
          CurrencyCode: "INR",
          source_order_id: sourceOrderId,
          cross_billing: "Y",
          Lines: cartItems.map((item, index) => ({
            source_line_ref: index + 1,
            UOM: "Nos",
            Item_code: item.partNumber,
            Qty: item.quantity.toString(),
            Item_id: item.itemId,
            lot: [],
            Line_value: (item.quantity * item.listPrice).toFixed(2),
            Line_tax_value: (item.quantity * item.listPrice * 0.18).toFixed(2),
            Line_Unique_Id: `${Date.now()}${index}`,
          })),
        },
      ];

      // 3️⃣ Create order in ERP
      await apiService.post("/create-sale-order", payload);

      /* ============================
   SAVE ORDER TO ORDER LIST
============================ */
      const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];

      const newOrder = {
        orderNumber: sourceOrderId, // ERP will update later
        sourceOrderId,
        date: new Date().toISOString().split("T")[0],
        quantity: cartItems.length,
        status: "PENDING",
        location: "Chennai",
      };

      existingOrders.unshift(newOrder); // latest order first

      localStorage.setItem("orders", JSON.stringify(existingOrders));

      setShowSuccess(true);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-total-panel">
      <div className="carttotal">
        <div className="cardtotal-frame">
          <div className="cardtotal-title">Card Totals</div>

          <div className="cardtotal-row">
            <span className="label">Basic Price</span>
            <span className="value">₹ 27,084.00</span>
          </div>
          <div className="cardtotal-row">
            <span className="label">GST</span>
            <span className="value">₹5,984.00</span>
          </div>
          <div className="cardtotal-row">
            <span className="label">Shipping</span>
            <span className="value">₹5,984.00</span>
          </div>
          <div className="cardtotal-row">
            <span className="label">GST</span>
            <span className="value">₹5,984.00</span>
          </div>
          <div className="cardtotal-sep" />
          <div className="cardtotal-row total">
            <span className="label">Total</span>
            <span className="value">₹ 33,068.00</span>
          </div>

          <button
            className="carttotal-submit-btn"
            onClick={handleCheckout}
            disabled={loading}
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
