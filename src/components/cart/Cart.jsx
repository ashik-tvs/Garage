import React from "react";
import CartDetails from "./CartDetail";
import CardTotal from "./CartTotal";
import PageNavigate from "../page_navigation/PageNavigation";
import "../../styles/cart/Cart.css";

const Cart = () => {
  return (
    <>
      {/* Breadcrumb */}
      <PageNavigate />

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
