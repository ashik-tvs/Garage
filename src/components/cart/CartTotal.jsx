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

  const gst = basicPrice * 0.18;
  const grandTotal = basicPrice + gst;

  const handleCheckout = async () => {
    try {
      setLoading(true);

      /* ============================
         1️⃣ Generate SOURCE ORDER ID
      ============================ */
      const sourceOrderId = "MOF" + Date.now();

      /* ============================
         2️⃣ CREATE ORDER PAYLOAD
      ============================ */
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

      /* ============================
         3️⃣ CREATE ORDER IN ERP
      ============================ */
      await apiService.post("/create-sale-order", payload);

      /* ============================
         4️⃣ SAVE PENDING ORDER
      ============================ */
      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          sourceOrderId,
          status: "PENDING",
          date: new Date().toISOString(),
        })
      );

      /* ============================
         5️⃣ WAIT (ERP ASYNC)
      ============================ */
      await new Promise((r) => setTimeout(r, 3000));

      /* ============================
         6️⃣ CALL STATUS API
      ============================ */
// CartTotal.jsx
const statusResponse = await apiService.get("/order/status", {
  params: { source_order_id: sourceOrderId }, // send directly, NOT nested
});



      const erpOrderNumber =
        statusResponse.data?.SalesOrder_number || sourceOrderId; // fallback

      /* ============================
         7️⃣ SAVE FINAL ORDER
      ============================ */
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          orderNumber: erpOrderNumber,
          sourceOrderId,
          date: new Date().toISOString().split("T")[0],
          quantity: cartItems.length,
          status: "CREATED",
          location: "Chennai",
        })
      );

      setShowSuccess(true);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

          <button
            className="cardtotal-cta"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>

      <Success loading={loading} showSuccess={showSuccess} />
    </div>
  );
};

export default CartTotal;
