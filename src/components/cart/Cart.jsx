import React from "react";
import CartDetails from "./CartDetail";
import CardTotal from "./CartTotal";
import Navigation from "../Navigation/Navigation";
import "../../styles/cart/Cart.css";

const Cart = () => {
  return (
    <>
      {/* Header with Navigation */}
      <div className="cart-header">
        <Navigation breadcrumbs={[{ label: "Cart" }]} />
      </div>

      <div className="cart-page">
        <div className="cart-left">
          <CartDetails />
        </div>

        {/* Hide cart total when empty */}
        <div className="cart-right">
          <CardTotal />
        </div>
      </div>
    </>
  );
};

export default Cart;
