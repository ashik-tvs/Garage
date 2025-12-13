import React from "react";
import { useCart } from "../../context/CartContext";
import "../../styles/cart/CartDetail.css";
import EmptyCart from "../../assets/cart/Cart emoji.png";
import NoImage from "../../assets/No Image.png";

function CartDetails() {
  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const isEmpty = cartItems.length === 0;

  return (
    <div className="cartdetails">
      <div className="cartdetails-frame">
        {isEmpty ? (
          <div className="empty-cart-wrapper">
            <img src={EmptyCart} alt="empty cart" className="empty-cart-img" />
            <h2>Your cart is empty</h2>
            <p>Please add products to proceed with your purchase</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="cartdetails-header">
              <div>Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div>Subtotal</div>
              <div className="cartdetails-col-clear">
                <button
                  className="cartdetails-clearall-btn"
                  onClick={clearCart}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cartdetails-body">
              {cartItems.map((item) => (
                <div key={item.partNumber} className="cartdetails-row">
                  <div className="cartdetails-product">
                    <img
                      src={item.imageUrl || NoImage}
                      alt={item.itemDescription}
                    />
                    <span>{item.itemDescription}</span>
                  </div>

                  <div className="cartdetails-price">₹{item.listPrice}</div>

                  <div className="cartdetails-quantity-box">
                    <button
                      className="cartdetails-qty-btn"
                      onClick={() => updateQuantity(item.partNumber, -1)}
                    >
                      −
                    </button>
                    <span className="cartdetails-qty-value">{item.quantity}</span>
                    <button
                      className="cartdetails-qty-btn"
                      onClick={() => updateQuantity(item.partNumber, 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cartdetails-price">
                    ₹{(item.quantity * item.listPrice).toFixed(2)}
                  </div>

                  <div>
                    <button
                      className="cartdetails-remove-btn"
                      onClick={() => removeFromCart(item.partNumber)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartDetails;
