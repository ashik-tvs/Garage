import React from "react";
import "../../styles/skeletonLoading/CategorySkeleton.css";

const CategorySkeleton = ({ count = 8 }) => {
  return (
    <div className="grid-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="cat-card skeleton-card">
          <div className="cat-img-box">
            <div className="skeleton skeleton-img" />
          </div>

          <div className="cat-divider"></div>

          <div className="skeleton skeleton-text" />
        </div>
      ))}
    </div>
  );
};

export default CategorySkeleton;
