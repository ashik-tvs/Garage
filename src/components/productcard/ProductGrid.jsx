// components/ProductGrid.jsx
import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products }) => {
  return (
    <div className="pn-grid">
      {products.map((item, index) => (
        <ProductCard key={index} item={item} />
      ))}
    </div>
  );
};

export default ProductGrid;
