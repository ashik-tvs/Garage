import React, { useState } from "react";
import Search from "../../home/Search";
import "../../../styles/search_by/service_type/ServiceTypeProduct.css";
import EditIcon from "../../../assets/vehicle_search_entry/edit.png";
import MyTvs from "../../../assets/mytvs.png";
import NoImage from "../../../assets/No Image.png";
import Success from "../../cart/Success"; // Import the Success component

const mockData = [
  {
    part: "Rear Brake Pad",
    myTVS: {
      code: "207509",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      img: MyTvs,
      image: NoImage,
    },
    valeo: {
      code: "F002H23845",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      img: MyTvs,
      image: NoImage,
    },
    hyundai: {
      code: "55801M60M00",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      img: MyTvs,
      image: NoImage,
    },
  },
  {
    part: "Rear Brake Pad",
    myTVS: {
      code: "207509",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      image: NoImage,
    },
    valeo: {
      code: "F002H23845",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      image: NoImage,
    },
    hyundai: {
      code: "55801M60M00",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      image: NoImage,
    },
  },
  {
    part: "Rear Brake Pad",
    myTVS: {
      code: "207509",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      image: NoImage,
    },
    valeo: {
      code: "F002H23845",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      image: NoImage,
    },
    hyundai: {
      code: "55801M60M00",
      eta: "1-2 Days",
      price: 425,
      mrp: 600,
      image: NoImage,
    },
  },
  // ...other mock data
];

const ServiceTypeProduct = () => {
  const [quantities, setQuantities] = useState(
    mockData.reduce((acc, item) => {
      acc[item.part] = { myTVS: 1, valeo: 1, hyundai: 1 };
      return acc;
    }, {})
  );
  const [vehicle, setVehicle] = useState({
  make: "Hyundai",
  model: "Grand i10",
  variant: "Sportz",
  fuel: "Petrol",
  year: "2021",
});
const [showEdit, setShowEdit] = useState(false);
const onEdit = () => {
  setShowEdit((prev) => !prev);
};

const onConfirm = () => {
  setShowEdit(false);
};

  const [showPopup, setShowPopup] = useState(false);

  const [selected, setSelected] = useState(
    mockData.reduce((acc, item) => {
      acc[item.part] = { myTVS: true, valeo: false, hyundai: false };
      return acc;
    }, {})
  );

  // Loader & Success state
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuantityChange = (part, brand, delta) => {
    setQuantities({
      ...quantities,
      [part]: {
        ...quantities[part],
        [brand]: Math.max(1, quantities[part][brand] + delta),
      },
    });
  };

  const handleCheckboxChange = (part, brand) => {
    setSelected({
      ...selected,
      [part]: { ...selected[part], [brand]: !selected[part][brand] },
    });
  };

  const handleSubmit = () => {
    setLoading(true);

    // Simulate submission delay
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);

      // Hide success automatically after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    }, 2000);
  };

  return (
    <div className="srp-container">
      <Search />
      <div className="srp-content">
        <div className="srp-row">
          <div className="srp-search-key">
            <span className="srp-search-key-title"> Search Key: </span>
            <span className="srp-search-key-value">
              {" "}
              Rear Brake Pad Replacement
            </span>
          </div>
  <div className="Vne-selection">
    <div className="Vne-selection-tags">
      {[vehicle.make, vehicle.model, vehicle.variant, vehicle.fuel, vehicle.year].map(
        (v, i) => (
          <span key={i} className="Vne-tag">
            {v}
          </span>
        )
      )}
      <img src={EditIcon} className="Vne-edit-icon" alt="edit" onClick={onEdit} />
    </div>
    
    {showEdit && (
      <div className="Vne-edit-dropdowns">
        <select className="Vne-dropdown">
          <option>Select Make</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Model</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Variant</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Fuel type</option>
        </select>
        <select className="Vne-dropdown">
          <option>Select Year</option>
        </select>
        <button className="Vne-find-btn" onClick={onConfirm}>Find Auto Parts</button>
      </div>
    )}
    
    <div className="Vne-selection-hint">You can change your vehicle details</div>
  </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Edit Vehicle</h3>

            <input className="plate-input" placeholder="Enter Vehicle Number" />

            <div className="popup-divider">OR</div>

            <select>
              <option>Make</option>
            </select>
            <select>
              <option>Model</option>
            </select>
            <select>
              <option>Year</option>
            </select>
            <select>
              <option>Variant</option>
            </select>

            <div className="popup-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button className="confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      )}

        <table className="srp-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>myTVS Recommended</th>
              <th>Other Options</th>
              <th>OEM</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((row) => (
              <tr key={row.part}>
                <td>{row.part}</td>
                {["myTVS", "valeo", "hyundai"].map((brand) => (
                  <td key={brand}>
                    <div className="srp-card-container">
                      <div className="srp-check-box">
                        <input
                          type="checkbox"
                          checked={selected[row.part][brand]}
                          onChange={() => handleCheckboxChange(row.part, brand)}
                        />
                      </div>
                      <div className="srp-card-image">
                        <img src={row[brand].image} alt={row.part} />
                      </div>
                      <div className="srp-product-card">
                        <div className="srp-badges">
                          <span
                            className={`srp-badge srp-${brand.toLowerCase()}`}
                          >
                            {brand}
                          </span>
                          <span className="srp-badge srp-eta">
                            {row[brand].eta}
                          </span>
                        </div>
                        <div className="srp-code">{row[brand].code}</div>
                        <div className="srp-price">
                          ₹ {row[brand].price} <del>₹ {row[brand].mrp}</del>
                        </div>
                        <div className="srp-qty-box">
                          <button
                            onClick={() =>
                              handleQuantityChange(row.part, brand, -1)
                            }
                          >
                            −
                          </button>
                          <span>{quantities[row.part][brand]}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(row.part, brand, 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="srp-submit">
          <div>
            <button className="srp-submit-btn" onClick={handleSubmit}>
              Submit
            </button>
          </div>

          <div>
            <p className="srp-note">
              *Each item starts at Qty 1. Uptick or adjust quantities as needed.
            </p>
          </div>
        </div>
      </div>
      {/* Loader + Success */}
      <Success loading={loading} showSuccess={showSuccess} />
    </div>
  );
};

export default ServiceTypeProduct;
