import React from "react";
import Product1 from "./Product1";

/**
 * Example Usage of Product1 Component
 * This demonstrates how to use the Product1 component with different layouts
 */
const Product1Example = () => {
  // Sample product data
  const recommendedProducts = [
    {
      id: "1",
      partNumber: "LF16079",
      name: "Rear Brake Pad Disc Set - FIEONI",
      image: "/assets/products/brake-pad.png",
      brand: "myTVS",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 12,
    },
    {
      id: "2",
      partNumber: "LF16079",
      name: "Rear Brake Pad Disc Set - FIEONI",
      image: "/assets/products/brake-pad.png",
      brand: "myTVS",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 12,
    },
    {
      id: "3",
      partNumber: "LF16079",
      name: "Rear Brake Pad Disc Set - FIEONI",
      image: "/assets/products/brake-pad.png",
      brand: "myTVS",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 12,
    },
    {
      id: "10",
      partNumber: "LF16080",
      name: "Front Brake Pad Disc Set",
      image: "/assets/products/brake-pad.png",
      brand: "myTVS",
      price: 525.00,
      mrp: 700.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 15,
    },
    {
      id: "11",
      partNumber: "LF16081",
      name: "Brake Disc Rotor",
      image: "/assets/products/brake-pad.png",
      brand: "myTVS",
      price: 625.00,
      mrp: 800.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 10,
    },
    {
      id: "12",
      partNumber: "LF16082",
      name: "Brake Caliper Assembly",
      image: "/assets/products/brake-pad.png",
      brand: "myTVS",
      price: 725.00,
      mrp: 900.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 8,
    },
  ];

  const alignedProducts = [
    {
      id: "4",
      partNumber: "LF16079",
      name: "Brake Disc Pad",
      image: "/assets/products/brake-disc.png",
      brand: "Valeo",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: null, // No compatible vehicles info
    },
    {
      id: "5",
      partNumber: "99000MZ4120-624",
      name: "Brake Fluid",
      image: "/assets/products/brake-fluid.png",
      brand: "Valeo",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: null,
    },
    {
      id: "6",
      partNumber: "TD044MB1207",
      name: "Brake Fitting Kit",
      image: "/assets/products/brake-kit.png",
      brand: "Valeo",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: null,
    },
  ];

  const otherProducts = [
    {
      id: "7",
      partNumber: "LF16079",
      name: "Rear Brake Pad Disc Set - FIEONI",
      image: "/assets/products/brake-pad.png",
      brand: "Valeo",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 12,
    },
    {
      id: "8",
      partNumber: "LF16079",
      name: "Rear Brake Pad Disc Set - FIEONI",
      image: "/assets/products/brake-pad.png",
      brand: "Valeo",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 12,
    },
    {
      id: "9",
      partNumber: "LF16079",
      name: "Rear Brake Pad Disc Set - FIEONI",
      image: "/assets/products/brake-pad.png",
      brand: "Valeo",
      price: 425.00,
      mrp: 600.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 12,
    },
    {
      id: "13",
      partNumber: "LF16083",
      name: "Brake Master Cylinder",
      image: "/assets/products/brake-pad.png",
      brand: "Valeo",
      price: 825.00,
      mrp: 1000.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 14,
    },
    {
      id: "14",
      partNumber: "LF16084",
      name: "Brake Hose Kit",
      image: "/assets/products/brake-pad.png",
      brand: "Valeo",
      price: 325.00,
      mrp: 500.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 20,
    },
    {
      id: "15",
      partNumber: "LF16085",
      name: "Brake Shoe Set",
      image: "/assets/products/brake-pad.png",
      brand: "Valeo",
      price: 375.00,
      mrp: 550.00,
      stockStatus: "in stock",
      deliveryTime: "1-2 Days",
      compatibleVehicles: 18,
    },
  ];

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);
    // Your add to cart logic here
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Left Section - 75% - myTVS and Other Products */}
        <div style={{ flex: "0 0 75%", maxWidth: "75%" }}>
          {/* myTVS Recommended Products - Horizontal Layout (3 per row) */}
          <Product1
            title="myTVS Recommended Products"
            products={recommendedProducts}
            layout="horizontal"
            onAddToCart={handleAddToCart}
          />

          {/* Other Products - Horizontal Layout (3 per row) */}
          <Product1
            title="Other Products"
            products={otherProducts}
            layout="horizontal"
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Right Section - 25% - Aligned Products */}
        <div style={{ flex: "0 0 25%", maxWidth: "25%" }}>
          {/* Aligned Products - Vertical Layout (1 per row) */}
          <Product1
            title="Aligned Products"
            products={alignedProducts}
            layout="vertical"
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default Product1Example;
