import React from "react";
import "../../styles/Login/Login.css";

const ProceedToLoginModal = ({ isOpen, onProceed, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="login-popup-overlay" onClick={onCancel}>
      <div className="login-popup" onClick={(e) => e.stopPropagation()}>
        <button className="login-popup-close" onClick={onCancel}>×</button>
        
        <h2 className="login-popup-title">Account Already Logged In</h2>
        <p className="login-popup-subtitle">
          This account is currently logged in on another device or browser.
        </p>
        <p className="login-popup-subtitle">
          If you proceed, the other session will be automatically logged out.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            className="login-popup-btn"
            onClick={onProceed}
            style={{ flex: 1 }}
          >
            Proceed to Login
          </button>
          <button 
            className="login-popup-btn"
            onClick={onCancel}
            style={{ flex: 1, backgroundColor: '#6c757d' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProceedToLoginModal;
