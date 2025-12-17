// components/ProductSection.jsx
import React from "react";
import DropDownIcon from "../../assets/vehicle_search_entry/dropdown.png";

const ProductSection = ({ title, showFilters, children }) => {
  const filters = ["Year", "Fuel type", "ETA", "Sort by"];

  return (
    <>
      <div className="pn-header">
        <h3>{title}</h3>

        {showFilters && (
          <div className="pn-filters">
            {filters.map((f, i) => (
              <div key={i} className="pn-filter">
                {f}
                <img src={DropDownIcon} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>

      {children}
    </>
  );
};

export default ProductSection;
