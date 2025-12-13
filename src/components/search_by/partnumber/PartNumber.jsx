


import React, { useState } from "react";
import Search from "../../home/Search";
import NoImage from "../../../assets/No Image.png";
import DropDownIcon from "../../../assets/vehicle_search_entry/dropdown.png";
import "../../../styles/search_by/partnumber/PartNumber.css";

const filters = [
  { label: "Year" },
  { label: "Fuel type" },
  { label: "ETA" },
  { label: "Sort by" },
];

const recommendedProducts = [
  {
    brand: "Valeo",
    code: "LF6079",
    title: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    model: "Grand i10 1.1L Crdi",
    fuel: "Petrol",
    year: "2013 to 2016",
  },
  {
    brand: "Bosch",
    code: "LF6079",
    title: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    model: "Grand i10 1.1L Crdi",
    fuel: "Petrol",
    year: "2016 to 2020",
  },
];

const otherProducts = [...recommendedProducts];

const ProductCard = ({ item }) => (
  <div className="pn-card">
    <img src={NoImage} alt="product" className="pn-product-img" />

    <div className="pn-badges">
      <span className="pn-badge brand">{item.brand}</span>
      <span className="pn-badge success">In stock</span>
      <span className="pn-badge muted">1-2 Days</span>
    </div>

    <div className="pn-code">{item.code}</div>
    <div className="pn-title">{item.title}</div>

    <div className="pn-price-row">
      <span className="pn-price">₹ {item.price}.00</span>
      <span className="pn-mrp">₹ {item.mrp}.00</span>
      <button className="pn-add-btn">Add</button>
    </div>

    <div className="pn-meta">
      <span>{item.model}</span>
      <span>{item.fuel}</span>
      <span>{item.year}</span>
    </div>
  </div>
);

const PartNumber = () => {
  return (
    <div className="pn-wrapper">
      <Search />

      <div className="pn-layout">
        {/* LEFT PANEL */}
        <div className="pn-left">
          <h4 className="pn-left-title">Part Number Details</h4>
          <img src={NoImage} alt="vehicle" className="pn-car-img" />

          <div className="pn-info">
            <div><label>Make</label><span>Hyundai</span></div>
            <div><label>Model</label><span>Grand i10</span></div>
            <div><label>Variant</label><span>1.1L</span></div>
            <div><label>Year</label><span>2021</span></div>
            <div><label>Fuel Type</label><span>Petrol</span></div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="pn-right">
          <div className="pn-header">
            <h3>myTVS Recommended Products</h3>
            <div className="pn-filters">
              {filters.map((f, i) => (
                <div key={i} className="pn-filter">
                  {f.label}
                  <img src={DropDownIcon} alt="dropdown" />
                </div>
              ))}
            </div>
          </div>

          <div className="pn-grid">
            {recommendedProducts.map((item, i) => (
              <ProductCard key={i} item={item} />
            ))}
          </div>

          <h3 className="pn-section-title">Other Products</h3>

          <div className="pn-grid">
            {otherProducts.map((item, i) => (
              <ProductCard key={i} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartNumber;

