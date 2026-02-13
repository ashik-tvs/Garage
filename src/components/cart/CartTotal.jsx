import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { createOrderAPI } from "../../services/api";
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
  const [lastSubmitTime, setLastSubmitTime] = useState(0); // Track last submission time

  /* ======================
     LOGGED IN CUSTOMER
  ====================== */
  let loggedInCustomer = JSON.parse(
    localStorage.getItem("loggedInCustomer") || "{}",
  );

  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  let userLocation = JSON.parse(localStorage.getItem("userLocation") || "{}");

  // FALLBACK: If new keys don't exist, try to get data from user_detail (for users who haven't re-logged in)
  if (!loggedInCustomer.customer_code || !loggedInUser.user_id) {
    console.warn("⚠️ New localStorage keys not found, attempting to extract from user_detail...");
    
    const userDetail = JSON.parse(localStorage.getItem("user_detail") || "{}");
    
    if (userDetail && Object.keys(userDetail).length > 0) {
      console.log("📦 Found user_detail, extracting customer data:", userDetail);
      
      // Extract customer data from user_detail
      if (!loggedInCustomer.customer_code) {
        loggedInCustomer = {
          customer_code: userDetail.customer_code || "NA",
          customer_name: userDetail.customer_name || "NA",
          mobile_number: userDetail.mobile_number || "NA",
          phone_number: userDetail.phone_number || "NA",
          warehouse_name: userDetail.warehouse?.warehouse_name || "KMS_WHG"
        };
        console.log("✅ Extracted customer data:", loggedInCustomer);
      }
      
      // Extract user data from user_detail
      if (!loggedInUser.user_id) {
        loggedInUser = {
          user_id: userDetail.customer_id || userDetail.sales_executive_id || "NA",
          customer_id: userDetail.customer_id || "NA"
        };
        console.log("✅ Extracted user data:", loggedInUser);
      }
    } else {
      console.error("❌ No user_detail found in localStorage. Please log in again.");
    }
  }

  // Validate customer data
  if (!loggedInCustomer.customer_code) {
    console.warn("⚠️ Customer code missing - customer_code will be 'NA'");
  }
  if (!loggedInCustomer.customer_name) {
    console.warn("⚠️ Customer name missing - customer_name will be 'NA'");
  }
  if (!loggedInCustomer.mobile_number && !loggedInCustomer.phone_number) {
    console.warn("⚠️ Customer phone missing - mobile_number will be 'NA'");
  }

  // Validate user data
  if (!loggedInUser.user_id) {
    console.warn("⚠️ User ID missing - employee_id will be 'NA'");
  }

  // Validate location data (always try to capture if missing)
  if (!userLocation.lat || !userLocation.lng) {
    console.warn("⚠️ Location data missing - attempting to capture now...");
    
    // Try to capture location now
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = {
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          };
          localStorage.setItem("userLocation", JSON.stringify(userLocation));
          console.log("✅ Location captured:", userLocation);
        },
        (error) => {
          console.warn("⚠️ Geolocation error:", error.message);
          userLocation = { lat: "0", lng: "0" };
        }
      );
    } else {
      userLocation = { lat: "0", lng: "0" };
    }
  }

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
    const timestamp = Date.now(); // Use milliseconds timestamp for better uniqueness
    const randomNum = Math.floor(Math.random() * 999999) + 100000; // 6-digit random
    const userSuffix = Math.floor(Math.random() * 999) + 100; // 3-digit random
    const processId = Math.floor(Math.random() * 99) + 10; // 2-digit process ID
    return `TXN${timestamp}${randomNum}${userSuffix}${processId}`;
  };

  /* ======================
     CHECKOUT
  ====================== */
  const handleCheckout = async () => {
    // Prevent duplicate submissions within 10 seconds
    const now = Date.now();
    if (now - lastSubmitTime < 10000) {
      alert("⚠️ Please wait a moment before submitting another order.");
      return;
    }

    try {
      setLoading(true);
      setLastSubmitTime(now); // Record submission time

      // Capture current location before creating order
      let currentLocation = userLocation;
      
      if (navigator.geolocation && (!userLocation.lat || userLocation.lat === "0")) {
        console.log("📍 Capturing current location for order...");
        
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          
          currentLocation = {
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          };
          
          // Update localStorage for future orders
          localStorage.setItem("userLocation", JSON.stringify(currentLocation));
          console.log("✅ Location captured:", currentLocation);
        } catch (geoError) {
          console.warn("⚠️ Could not capture location:", geoError.message);
          // Keep using the existing location (even if it's 0,0)
        }
      }

      /* ======================
         ERP PAYLOAD
      ====================== */
      const payload = {
        validity_date: new Date().toISOString().split("T")[0],

        customer_code: safeString(loggedInCustomer.customer_code),
        customer_name: safeString(loggedInCustomer.customer_name),
        mobile_number: safeString(loggedInCustomer.mobile_number || loggedInCustomer.phone_number),
        employee_id: safeString(loggedInUser.user_id),

        latitude: safeString(currentLocation.lat),
        longitude: safeString(currentLocation.lng),

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
          const price = Number(item.listPrice || item.price || 0);
          const subtotal = price * qty;

          // Handle different property name variations from different components
          const partNumber = item.partNumber || item.partNo || item.code || item.actualPartNumber || `PART_${index + 1}`;
          
          // Try multiple property names for part description
          const partName = item.itemDescription || 
                          item.description || 
                          item.name || 
                          item.title || 
                          item.itemName ||
                          item.components ||
                          item.partName ||
                          partNumber || // Fallback to part number if no description
                          "UNKNOWN_PART";
          
          // Try multiple property names for brand
          const brandName = item.brand || 
                           item.brandName || 
                           item.manufacturer ||
                           "GENERIC";

          console.log(`🔍 Cart Item ${index + 1}:`, {
            originalItem: item,
            extractedPartNumber: partNumber,
            extractedPartName: partName,
            extractedBrandName: brandName,
            price: price,
            quantity: qty
          });

          return {
            parts_no: safeString(partNumber),
            parts_name: safeString(partName),
            brand_name: safeString(brandName),

            quantity: qty,
            warehouse: safeString(
              loggedInCustomer.warehouse_name,
              "KMS_WHG",
            ),
            item_price: safeNumberString(price),
            sub_total: subtotal,
            tax_price: "0.00",
            total_price: safeNumberString(subtotal),
            cgst: "0.00",
            sgst: "0.00",
            igst: "0.00",
            mrp: safeNumberString(item.mrp || price),
          };
        }),
      };

      console.log("FULL ERP PAYLOAD:", payload);
      console.log("🔍 Cart Items Debug:", cartItems);
      console.log("🔍 First Cart Item:", cartItems[0]);

      /* ======================
         API CALL
      ====================== */
      const res = await createOrderAPI(payload);
      console.log("ORDER RESPONSE:", res);

      if (!res) {
        alert("Failed to connect to order API. Please check your connection and try again.");
        return;
      }

      if (res?.success === true || res?.message?.toLowerCase().includes("success")) {
        setShowSuccess(true);
        return;
      }

      // Handle specific error messages
      const errorMessage = res?.message || res?.error || "Order failed";
      
      // Special handling for duplicate orders
      if (errorMessage.toLowerCase().includes("duplicate")) {
        alert("⚠️ " + errorMessage + "\n\nPlease wait a few minutes before placing another order, or modify your cart items.");
      } else {
        alert(errorMessage);
      }
    } catch (err) {
      console.error("ORDER ERROR:", err?.response?.data || err.message);
      
      // Handle structured error responses
      const errorData = err?.response?.data;
      let errorMessage = "Order failed. Please try again.";
      
      if (errorData) {
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Special handling for duplicate order
        if (errorMessage.toLowerCase().includes("duplicate")) {
          errorMessage = "⚠️ " + errorMessage + "\n\nThis might happen if:\n• You recently placed the same order\n• Multiple clicks on submit button\n• Network issues caused retry\n\nPlease wait 5 minutes or modify your cart.";
        }
      }
      
      alert(errorMessage);
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
