import React from "react";
import "../../styles/skeletonLoading/BrandSkeleton.css";

const BrandSkeleton = ({ count = 6 }) => {
  return (
    <div className="brands-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="brand-card skeleton-card">
          <div className="brand-image-wrapper">
            <div className="skeleton skeleton-logo" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandSkeleton;
