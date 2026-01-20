import React from "react";
import "../../styles/skeletonLoading/MakeSkeleton.css";

const MakeSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="brand-card skeleton-card">
          <div className="skeleton skeleton-img" />
          <div className="skeleton skeleton-text" />
        </div>
      ))}
    </div>
  );
};

export default MakeSkeleton;
