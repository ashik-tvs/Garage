import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Search from "../../home/Search";
import { useCart } from "../../../context/CartContext";
import NoImage from "../../../assets/No Image.png";
import DownArrow from "../../../assets/vehicle_search_entry/dropdown.png";
import "../../../styles/search_by/partnumber/PartNumber.css";
import Brake_1 from "../../../assets/brake1.png";
import Brake_2 from "../../../assets/brake2.png";
import Brake_3 from "../../../assets/brake3.png";

/* ---------------- MOCK DATA ---------------- */
const brakeImages = [Brake_1, Brake_2, Brake_3];

const products = [
  {
    id: 1,
    brand: "myTVS",
    partNo: "LF16078",
    description: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    eta: "1-2 Days",
    stock: "In stock",
    vehicles: 12,
    imageUrl: brakeImages[0],
  },
  {
    id: 2,
    brand: "Valeo",
    partNo: "0A00022116078",
    description: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    eta: "1-2 Days",
    stock: "In stock",
    vehicles: 12,
    imageUrl: brakeImages[1],
  },
  {
    id: 2,
    brand: "Valeo",
    partNo: "45DS16078",
    description: "Rear Brake Pad Disc Set - F(EON)",
    price: 425,
    mrp: 600,
    eta: "1-2 Days",
    stock: "In stock",
    vehicles: 12,
    imageUrl: brakeImages[2],
  },
];
const otherProducts = products.map((item) => ({
  ...item,
  partNo: `OTHER-${item.partNo}`,
}));

const alignedProducts = [
  {
    id: 3,
    partNo: "A6732S233132",
    brand: "Valeo",
    description: "Brake Disc Pad",
    price: 425,
    mrp: 600,
    imageUrl: brakeImages[2],
  },
  {
    id: 4,
    partNo: "SA233663824",

    brand: "Mobil",
    description: "Brake Fluid",
    price: 425,
    mrp: 600,
    imageUrl: brakeImages[0],
  },
  {
    id: 5,
    partNo: "YD323S5632",

    brand: "Valeo",
    description: "Brake Fitting Kit",
    price: 425,
    mrp: 600,
    imageUrl: brakeImages[1],
  },
];

/* ---------------- FILTER ---------------- */

const Filter = ({ label }) => (
  <div className="pn-filter">
    <span>{label}</span>
    <img src={DownArrow} alt="" />
  </div>
);

/* ---------------- PRODUCT CARD ---------------- */

const ProductCard = ({ item, onOpenCompatibility }) => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const localPartNumber =
    item.localPartNumber || `${item.partNo}_${item.brand}`;
  const cartKey = `${item.partNo}_${item.brand}`;

  const isAdded = cartItems.some(
    (cartItem) => cartItem.partNumber === localPartNumber
  );
  const handleCart = () => {
    if (isAdded) {
      removeFromCart(localPartNumber);
    } else {
      addToCart({
        ...item,
        partNumber: localPartNumber,
        listPrice: item.price,
        image: item.imageUrl, // ✅ IMAGE PASSED TO CART
      });
    }
  };

  return (
    <div className="pn-card">
      <div className="pn-card-row">
        <img src={item.imageUrl} alt="" className="pn-product-img" />

        <div className="pn-card-body">
          <div className="pn-tags">
            <span className="pn-tag-brand">{item.brand}</span>
            <span className="pn-tag-stock">{item.stock}</span>
            <span className="pn-tag-eta">{item.eta}</span>
          </div>

          <p className="pn-part">{item.partNo}</p>
          <p className="pn-name pn-truncate" title={item.description}>
            {item.description}
          </p>

          <div className="pn-price-row">
            <span className="pn-price">₹ {item.price}</span>
            <span className="pn-mrp">₹ {item.mrp}</span>

            <button
              className={`pn-add-btn ${isAdded ? "pn-added" : ""}`}
              onClick={handleCart}
            >
              {isAdded ? "Added" : "Add"}
            </button>
          </div>
        </div>
      </div>

      <div className="pn-compatible-row" onClick={onOpenCompatibility}>
        <div>
          {" "}
          Compatible with <b className="pn-count-vehicle">
            {item.vehicles}
          </b>{" "}
          vehicles
        </div>
        <span className="pn-arrow">›</span>
      </div>
    </div>
  );
};
const CompatibilityModal = ({ onClose }) => {
  const vehicles = [
    {
      make: "Hyundai",
      model: "Grand i10",
      variant: "Sportz",
      fuel: "Petrol",
      year: "2012",
    },
    {
      make: "Hyundai",
      model: "Grand i10",
      variant: "Asta",
      fuel: "Diesel",
      year: "2013",
    },
    {
      make: "Hyundai",
      model: "i20",
      variant: "Magna",
      fuel: "Petrol",
      year: "2014",
    },
    {
      make: "Hyundai",
      model: "i20",
      variant: "Sportz",
      fuel: "Diesel",
      year: "2015",
    },
    {
      make: "Hyundai",
      model: "Xcent",
      variant: "SX",
      fuel: "Petrol",
      year: "2016",
    },
    {
      make: "Hyundai",
      model: "Xcent",
      variant: "SX(O)",
      fuel: "Diesel",
      year: "2017",
    },
    {
      make: "Hyundai",
      model: "Aura",
      variant: "S",
      fuel: "Petrol",
      year: "2020",
    },
    {
      make: "Hyundai",
      model: "Aura",
      variant: "SX",
      fuel: "CNG",
      year: "2021",
    },
  ];

  return (
    <div className="pn-modal-overlay">
      <div className="pn-modal">
        {/* Header */}
        <div className="pn-modal-header">
          <input type="text" placeholder="Search" className="pn-modal-search" />
          <button className="pn-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Table Header */}
        <div className="pn-table-container">
          <div className="pn-modal-table-header">
            <span>Make</span>
            <span>Model</span>
            <span>Variant</span>
            <span>Fuel Type</span>
            <span>Year</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {" "}
          <div className="pn-modal-table-body">
            {vehicles.map((v, i) => (
              <div key={i} className="pn-modal-row">
                <span>{v.make}</span>
                <span>{v.model}</span>
                <span>{v.variant}</span>
                <span>{v.fuel}</span>
                <span>{v.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */

const PartNumber = () => {
  const { state } = useLocation();
  const searchKey = (state?.partNumber || "").toUpperCase();

  const { cartItems, addToCart, removeFromCart } = useCart();
  const [showCompatibility, setShowCompatibility] = useState(false);

  const filterByPartNumber = (list, key) => {
    if (!key) return list;

    return list.filter((item) => item.partNo.toUpperCase().includes(key));
  };
  const partMatchedProducts = filterByPartNumber(products, searchKey);

const recommendedProducts = products.filter(
  (item) =>
    item.brand.toUpperCase() === "MYTVS" &&
    item.partNo.toUpperCase().includes(searchKey)
);

const otherBrandProducts = products.filter(
  (item) => item.brand.toUpperCase() !== "MYTVS"
);


  return (
    <div className="pn-wrapper">
      <Search />

      <div className="pn-body">
        <div className="pn-search-key">
          Search Key : <b>{searchKey}</b>
        </div>

        {/* FILTERS */}
        <div className="pn-top">
          <div className="pn-compatibility">
            <Filter label="Select Make" />
            <Filter label="Select Model" />
            <Filter label="Select Variant" />
            <Filter label="Select Fuel type" />
            <Filter label="Select Year" />
            <button className="pn-compat-btn">Search Compatibility</button>
          </div>

          <div className="pn-right-filters">
            <Filter label="Year" />
            <Filter label="Fuel type" />
            <Filter label="ETA" />
            <Filter label="Sort by" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="pn-content">
          {/* LEFT */}
          <div className="pn-left">
            <h4 className="pn-section-title">myTVS Recommended Products</h4>

            <div className="pn-grid">
              {recommendedProducts.length > 0 ? (
                recommendedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onOpenCompatibility={() => setShowCompatibility(true)}
                  />
                ))
              ) : (
                <div className="pn-no-results">
                  No myTVS products found for <b>{searchKey}</b>
                </div>
              )}
            </div>

            <h4 className="pn-section-title">Other Products</h4>

            <div className="pn-grid">
              {otherBrandProducts.length > 0 ? (
                otherBrandProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onOpenCompatibility={() => setShowCompatibility(true)}
                  />
                ))
              ) : (
                <div className="pn-no-results">
                  No other brand products found for <b>{searchKey}</b>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="pn-right">
            <h4 className="pn-section-title">Aligned Products</h4>

            <div className="pn-aligned">
              {alignedProducts.map((item) => {
                const partNumber = `ALIGNED-${item.id}`;
                const isAdded = cartItems.some(
                  (cartItem) => cartItem.partNumber === partNumber
                );

                return (
                  <div key={item.id} className="pn-aligned-card">
                    <img src={item.imageUrl} alt="" />

                    <div className="pn-aligned-card-content">
                      <div className="pn-b-s-e">
                        <span className="pn-tag-brand">{item.brand}</span>
                        <span className="pn-tag-stock">In stock</span>
                        <span className="pn-tag-eta">1-2 Days</span>
                      </div>

                      {/* Display Part Number */}
                      <p className="pn-align-part">{item.partNo}</p>

                      <p
                        className="pn-name-align pn-truncate"
                        title={item.description}
                      >
                        {item.description}
                      </p>

                      <div className="pn-price-row">
                        <span className="pn-price">₹ {item.price}</span>
                        <span className="pn-mrp">₹ {item.mrp}</span>

                        <button
                          className={`pn-add-btn ${isAdded ? "pn-added" : ""}`}
                          onClick={() =>
                            isAdded
                              ? removeFromCart(partNumber)
                              : addToCart({
                                  ...item,
                                  partNumber,
                                  listPrice: item.price,
                                  image: item.imageUrl, // ✅ ADD IMAGE
                                })
                          }
                        >
                          {isAdded ? "Added" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL MUST BE INSIDE RETURN */}
      {showCompatibility && (
        <CompatibilityModal onClose={() => setShowCompatibility(false)} />
      )}
    </div>
  );
};

export default PartNumber;
