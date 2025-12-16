import React, { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import { useLocation } from "react-router-dom";
import Search from "../../home/Search";
import NoImage from "../../../assets/No Image.png";
import "../../../styles/search_by/image/Image.css";

const mockProducts = [
  {
    id: 1,
    brand: "myTVS",
    title: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    stock: "In stock",
    eta: "1-2 Days",
    vehicle: "Grand i10 1.1L CRDi",
    fuel: "Petrol",
    year: "2013 to 2016",
  },
  {
    id: 2,
    brand: "Valeo",
    title: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    stock: "In stock",
    eta: "1-2 Days",
    vehicle: "Grand i10 1.2L",
    fuel: "Petrol",
    year: "2016 to 2020",
  },
  {
    id: 3,
    brand: "Valeo",
    title: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    stock: "In stock",
    eta: "1-2 Days",
    vehicle: "Grand i10 1.2L",
    fuel: "Petrol",
    year: "2016 to 2020",
  },
];

const ImageSearch = () => {
  const location = useLocation();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const isInCart = (partNumber) =>
    cartItems.some((item) => item.partNumber === partNumber);

  const [previewUrl, setPreviewUrl] = useState(NoImage);
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== NoImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (location.state?.previewUrl) {
      setPreviewUrl(location.state.previewUrl);
    }
  }, [location.state]);
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
  };
  const [value, setValue] = useState("");

  const formatVehicleNumber = (input) => {
    // Remove invalid chars
    let v = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // TN59CS3866 → TN - 59 - CS - 3866
    let formatted = "";
    if (v.length > 0) formatted += v.slice(0, 2);
    if (v.length > 2) formatted += " - " + v.slice(2, 4);
    if (v.length > 4) formatted += " - " + v.slice(4, 6);
    if (v.length > 6) formatted += " - " + v.slice(6, 10);

    return formatted;
  };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/ - /g, "");
    setValue(formatVehicleNumber(raw));
  };

  return (
    <div className="img-page">
      <Search />
      <div className="img-upload-header">
        <p className="img-upload-title">Thank you for uploading the image.</p>
      </div>

      {/* Upload Card */}
      <div className="img-upload-card">
        {/* LEFT IMAGE */}
        <label htmlFor="upload-image" className="img-left">
          {previewUrl ? (
            <img src={previewUrl} alt="uploaded preview" />
          ) : (
            <div className="img-placeholder">Click to Upload</div>
          )}
          <span>Brake Pad</span>

          <input
            type="file"
            accept="image/*"
            id="upload-image"
            hidden
            onChange={handleImageUpload}
          />
        </label>

        {/* RIGHT FORM */}
        <div className="img-right">
          <div className="img-vehicle-row">
            <div className="vehicle-search-box">
              <input
                type="text"
                value={value}
                onChange={handleChange}
                maxLength={19}
                placeholder="TN - 59 - CS - 3866"
              />
              <button>Search</button>
            </div>
          </div>

          <div className="img-or">(OR)</div>

          <div className="img-form">
            <div className="img-field">
              <label>Make *</label>
              <select>
                <option>Hyundai</option>
              </select>
            </div>

            <div className="img-field">
              <label>Model *</label>
              <select>
                <option>Grand</option>
              </select>
            </div>

            <div className="img-field">
              <label>Variant</label>
              <select>
                <option>Select Variant</option>
              </select>
            </div>

            <div className="img-field">
              <label>Fuel type</label>
              <select>
                <option>Select Fuel Type</option>
              </select>
            </div>

            <div className="img-field">
              <label>Year</label>
              <select>
                <option>Select Year</option>
              </select>
            </div>

            <div className="img-field img-search">
              <button>Search</button>
            </div>
          </div>
        </div>
      </div>

      <div className="img-content">
        {/* LEFT PRODUCTS */}
        <div className="img-products">
          {/* Header */}
          <div className="img-header">
            <h3>myTVS Recommended Products</h3>

            <div className="img-filters">
              <select>
                <option>Year</option>
              </select>
              <select>
                <option>Fuel type</option>
              </select>
              <select>
                <option>ETA</option>
              </select>
              <select>
                <option>Sort by</option>
              </select>
            </div>
          </div>

          {/* Recommended Products */}
          <div className="img-grid">
            {mockProducts.map((p) => (
              <div key={p.id} className="img-card">
                {/* Image */}
                <div className="img-card-image">
                  <img src={NoImage} alt="" />
                </div>

                {/* Card Body */}
                <div className="img-card-body">
                  {/* Badges */}
                  <div className="img-tags">
                    <span className="tag brand">{p.brand}</span>
                    <span className="tag stock">In stock</span>
                    <span className="tag eta">1-2 Days</span>
                  </div>

                  {/* Code */}
                  <p className="img-code">LF6079</p>

                  {/* Title */}
                  <p className="img-title">{p.title}</p>

                  {/* Price row */}
                  <div className="img-price-row">
                    <span className="price">₹ {p.price}</span>
                    <del>₹ {p.mrp}</del>
                    <button
                      className={`img-add ${isInCart("LF6079") ? "added" : ""}`}
                      onClick={() => {
                        if (isInCart("LF6079")) {
                          removeFromCart("LF6079"); // UNDO
                        } else {
                          addToCart({
                            partNumber: "LF6079",
                            title: p.title,
                            brand: p.brand,
                            listPrice: p.price,
                            mrp: p.mrp,
                            image: NoImage,
                          });
                        }
                      }}
                    >
                      {isInCart("LF6079") ? "Added" : "Add"}
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="img-meta">
                    <span>{p.vehicle}</span>
                    <span>{p.fuel}</span>
                    <span>{p.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Other Products */}
          <h3 className="img-other-title">Other Products</h3>

          <div className="img-grid">
            {mockProducts.map((p) => (
              <div key={`o-${p.id}`} className="img-card">
                <div className="img-card-image">
                  <img src={NoImage} alt="" />
                </div>

                <div className="img-card-body">
                  <div className="img-tags">
                    <span className="tag brand">Valeo</span>
                    <span className="tag stock">In stock</span>
                    <span className="tag eta">1-2 Days</span>
                  </div>

                  <p className="img-code">LF6079</p>
                  <p className="img-title">{p.title}</p>

                  <div className="img-price-row">
                    <span className="price">₹ {p.price}</span>
                    <del>₹ {p.mrp}</del>
                    <button className="img-add">Add</button>
                  </div>

                  <div className="img-meta">
                    <span>{p.vehicle}</span>
                    <span>{p.fuel}</span>
                    <span>{p.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="img-sidebar">
          <div className="img-sidebar-header">Service Type for Brake</div>

          <ul className="img-sidebar-list">
            <li>Complete Brake System Inspection</li>
            <li>Brake Noise / Vibration Diagnosis</li>
            <li>Brake Fluid Level Check</li>
            <li>ABS Warning Light Check</li>
            <li>Front Brake Pad Replacement</li>
            <li>Rear Brake Pad Replacement</li>
            <li>Brake Shoe Replacement (Drum Brakes)</li>
            <li>Brake Pad Cleaning & Adjustment</li>
            <li>Brake Rotor (Disc) Replacement</li>
            <li>Brake Rotor Resurfacing</li>
            <li>Brake Drum Replacement</li>
            <li>Brake Drum Turning / Resurfacing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageSearch;
