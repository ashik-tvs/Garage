import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import apiService from "../../services/apiservice";
import "../../styles/cart/CartTotal.css";
import Success from "./Success";

const CartTotal = () => {
  const { cartItems = [] } = useCart();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ======================
     DYNAMIC CALCULATIONS
  ====================== */
  const basicPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.listPrice),
    0,
  );

  const gst = 0; // explicitly zero
  const shipping = 0; // explicitly zero
  const gst2 = 0;

  const total = basicPrice + gst + shipping + gst2;

  /* ======================
     AUTO CLOSE SUCCESS
  ====================== */
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // closes after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  /* ======================
     CHECKOUT (UNCHANGED)
  ====================== */
  const handleCheckout = async () => {
    try {
      setLoading(true);

      const sourceOrderId = "MOF" + Date.now();

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

      await apiService.post("/create-sale-order", payload);

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
