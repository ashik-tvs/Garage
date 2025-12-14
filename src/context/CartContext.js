import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  /* 🔁 Persist cart data */
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  /* ➕ Add to cart */
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.partNumber === product.partNumber
      );

      if (existing) {
        return prev.map((item) =>
          item.partNumber === product.partNumber
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /* 🔢 Update quantity */
  const updateQuantity = (partNumber, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.partNumber === partNumber
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* ❌ Remove item */
  const removeFromCart = (partNumber) => {
    setCartItems((prev) =>
      prev.filter((item) => item.partNumber !== partNumber)
    );
  };

  /* 🧹 Clear cart */
  const clearCart = () => {
    setCartItems([]);
  };

  /* 💰 Cart total */
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.listPrice,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
