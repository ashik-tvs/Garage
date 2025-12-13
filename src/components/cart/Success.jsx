import React from "react";
import "../../styles/cart/Success.css";

const Success = ({ loading, showSuccess }) => {
  return (
    <>
      {/* Loader */}
      {loading && (
        <>
          <div className="overlay"></div>
          <div className="loading-center">
            <div className="loader"></div>
          </div>
        </>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <>
          <div className="overlay"></div>
          <div className="success-popup-center">
            <div className="success-card">
              <div className="success-tick">✔</div>
              <p className="success-msg">Thank you for your Order!</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Success;
