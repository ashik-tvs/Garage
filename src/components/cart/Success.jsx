import React from "react";
import "../../styles/cart/Success.css";

const Success = ({ loading, showSuccess }) => {
  if (!loading && !showSuccess) return null;

  return (
    <>
      {/* Overlay */}
      <div className="overlay"></div>

      {/* Loader */}
      {loading && (
        <div className="loading-center">
          <div className="loader"></div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup-center">
          <div className="success-card">
            <div className="success-tick">✔</div>
            <p className="success-msg">Thank you for your Order!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Success;
