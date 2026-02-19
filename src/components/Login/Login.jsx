import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Login/Login.css";
import { loginAPI, forgotPasswordAPI, verifyOTPAPI } from "../../services/api";
import apiConfigManager from "../../services/apiConfig";
import apiService from "../../services/apiservice";
import { getAssets, getAsset } from "../../utils/assets";
import ProceedToLoginModal from "./ProceedToLoginModal";

const Login = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState({});
  
  // Load assets
  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  // ===============================
  // STATE
  // ===============================
  const [email, setEmail] = useState("raja@tvs.in");
  const [password, setPassword] = useState("tvs@12345");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Flow States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerifyOTP, setShowVerifyOTP] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Proceed to Login Flow States
  const [showProceedModal, setShowProceedModal] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ===============================
  // PREFILL EMAIL
  // ===============================
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // ===============================
  // OTP TIMER
  // ===============================
  useEffect(() => {
    if (showVerifyOTP && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showVerifyOTP, timer]);

  // ===============================
  // DATA TRANSFORMATION FUNCTIONS
  // ===============================
  
  // Store customer data directly from login response
  const storeCustomerData = (userDetail) => {
    try {
      // For customers, use the actual fields from login response
      const customerData = {
        customer_code: userDetail?.customer_code || "NA",
        customer_name: userDetail?.customer_name || "NA",
        mobile_number: userDetail?.mobile_number || "NA", // For sales executives
        phone_number: "NA", // Will be fetched from profile if needed
        warehouse_name: userDetail?.warehouse?.warehouse_name || "KMS_WHG"
      };
      
      localStorage.setItem("loggedInCustomer", JSON.stringify(customerData));
      console.log("✅ Customer data stored:", customerData);
    } catch (error) {
      console.error("❌ Failed to store customer data:", error);
    }
  };

  // Store user data directly from login response
  const storeUserData = (userDetail) => {
    try {
      const userData = {
        user_id: userDetail?.customer_id || userDetail?.sales_executive_id || "NA",
        customer_id: userDetail?.customer_id || "NA"
      };
      
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      console.log("✅ User data stored:", userData);
    } catch (error) {
      console.error("❌ Failed to store user data:", error);
    }
  };

  // Capture user's current location for order tracking
  const captureUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          };
          localStorage.setItem("userLocation", JSON.stringify(locationData));
          console.log("✅ Location captured:", locationData);
        },
        (error) => {
          console.warn("⚠️ Geolocation error:", error.message);
          // Store default values
          const defaultLocation = {
            lat: "0",
            lng: "0"
          };
          localStorage.setItem("userLocation", JSON.stringify(defaultLocation));
          console.log("⚠️ Using default location:", defaultLocation);
        }
      );
    } else {
      console.warn("⚠️ Geolocation not supported by browser");
      // Geolocation not supported
      const defaultLocation = {
        lat: "0",
        lng: "0"
      };
      localStorage.setItem("userLocation", JSON.stringify(defaultLocation));
      console.log("⚠️ Using default location:", defaultLocation);
    }
  };

  // ===============================
  // LOGIN HANDLER
  // ===============================
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      // Initial login attempt with is_proceed_to_login: 0 to check for existing session
      const response = await loginAPI(email, password, 0);

      if (!response.success) {
        // Check if this is a session conflict error
        if (response.message === "This account is already logged in.") {
          // Save credentials and show proceed modal
          setSavedCredentials({ email, password });
          setShowProceedModal(true);
          return;
        }
        
        // Display other errors normally
        setError(response.message || "Login failed");
        return;
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Store JWT token
      localStorage.setItem("token", response.token);

      // Store user detail
      localStorage.setItem("user_detail", JSON.stringify(response.user_detail));

      // Initialize API configuration from login response
      if (response.user_detail?.api_list) {
        console.log('🔧 Initializing API configuration from login response');
        apiConfigManager.initialize(response.user_detail.api_list);
        
        // Store API list in localStorage for persistence
        localStorage.setItem("api_list", JSON.stringify(response.user_detail.api_list));
      }

      // Store customer and user data for order creation
      storeCustomerData(response.user_detail);
      storeUserData(response.user_detail);
      
      // Capture user location
      captureUserLocation();

      // Fetch profile to get phone number
      try {
        console.log('📞 Fetching profile to get phone number...');
        const profileData = await apiService.get('/profile/user-details');
        
        if (profileData.success && profileData.data?.profile) {
          const profile = profileData.data.profile;
          console.log('✅ Profile fetched:', profile);
          
          // Update customer data with phone number from profile
          const updatedCustomerData = {
            customer_code: response.user_detail?.customer_code || "NA",
            customer_name: response.user_detail?.customer_name || "NA",
            mobile_number: profile.phone_number || profile.mobile_number || "NA",
            phone_number: profile.phone_number || profile.mobile_number || "NA",
            warehouse_name: response.user_detail?.warehouse?.warehouse_name || "KMS_WHG"
          };
          
          localStorage.setItem("loggedInCustomer", JSON.stringify(updatedCustomerData));
          console.log("✅ Customer data updated with phone number:", updatedCustomerData);
        }
      } catch (profileError) {
        console.warn('⚠️ Failed to fetch profile for phone number:', profileError);
      }

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FORGOT PASSWORD - SEND OTP
  // ===============================
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      if (!forgotEmail || !forgotPassword || !forgotConfirmPassword) {
        setForgotError("Please fill in all fields");
        return;
      }

      if (forgotPassword.length < 8) {
        setForgotError("Password must be at least 8 characters");
        return;
      }

      if (forgotPassword !== forgotConfirmPassword) {
        setForgotError("Passwords do not match");
        return;
      }

      const response = await forgotPasswordAPI(forgotEmail, forgotPassword, forgotConfirmPassword);
      
      if (response.success) {
        setShowForgotPassword(false);
        setShowVerifyOTP(true);
        setTimer(60);
        setCanResend(false);
      } else {
        setForgotError(response.message || "Failed to send OTP");
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  // ===============================
  // VERIFY OTP
  // ===============================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      if (!otp) {
        setForgotError("Please enter OTP");
        return;
      }

      const response = await verifyOTPAPI(forgotEmail, otp);
      
      if (response.success) {
        // OTP verified successfully - password is already updated by backend
        // Close all popups
        setShowVerifyOTP(false);
        setShowForgotPassword(false);
        
        // Reset states
        setForgotEmail("");
        setForgotPassword("");
        setForgotConfirmPassword("");
        setOtp("");
        
        // Show success message
        setError("");
        setShowSuccessModal(true);
      } else {
        setForgotError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  // ===============================
  // RESEND OTP
  // ===============================
  const handleResendOTP = async () => {
    setForgotError("");
    setForgotLoading(true);

    try {
      const response = await forgotPasswordAPI(forgotEmail, forgotPassword, forgotConfirmPassword);
      
      if (response.success) {
        setTimer(60);
        setCanResend(false);
        setForgotError("");
      } else {
        setForgotError(response.message || "Failed to resend OTP");
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  // ===============================
  // CLOSE POPUPS
  // ===============================
  const closeAllPopups = () => {
    setShowForgotPassword(false);
    setShowVerifyOTP(false);
    setForgotEmail("");
    setForgotPassword("");
    setForgotConfirmPassword("");
    setOtp("");
    setForgotError("");
    setTimer(60);
    setCanResend(false);
  };

  // ===============================
  // PROCEED TO LOGIN HANDLERS
  // ===============================
  const handleProceed = async () => {
    if (!savedCredentials) return;

    setError("");
    setLoading(true);

    try {
      // Retry login with is_proceed_to_login: 1 to force login
      const response = await loginAPI(savedCredentials.email, savedCredentials.password, 1);

      if (!response.success) {
        // Close modal and display error
        setShowProceedModal(false);
        setSavedCredentials(null);
        setError(response.message || "Login failed");
        return;
      }

      // Close modal
      setShowProceedModal(false);
      setSavedCredentials(null);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", savedCredentials.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Store JWT token
      localStorage.setItem("token", response.token);

      // Store user detail
      localStorage.setItem("user_detail", JSON.stringify(response.user_detail));

      // Initialize API configuration from login response
      if (response.user_detail?.api_list) {
        console.log('🔧 Initializing API configuration from login response');
        apiConfigManager.initialize(response.user_detail.api_list);
        
        // Store API list in localStorage for persistence
        localStorage.setItem("api_list", JSON.stringify(response.user_detail.api_list));
      }

      // Store customer and user data for order creation
      storeCustomerData(response.user_detail);
      storeUserData(response.user_detail);
      
      // Capture user location
      captureUserLocation();

      // Fetch profile to get phone number
      try {
        console.log('📞 Fetching profile to get phone number...');
        const profileData = await apiService.get('/profile/user-details');
        
        if (profileData.success && profileData.data?.profile) {
          const profile = profileData.data.profile;
          console.log('✅ Profile fetched:', profile);
          
          // Update customer data with phone number from profile
          const updatedCustomerData = {
            customer_code: response.user_detail?.customer_code || "NA",
            customer_name: response.user_detail?.customer_name || "NA",
            mobile_number: profile.phone_number || profile.mobile_number || "NA",
            phone_number: profile.phone_number || profile.mobile_number || "NA",
            warehouse_name: response.user_detail?.warehouse?.warehouse_name || "KMS_WHG"
          };
          
          localStorage.setItem("loggedInCustomer", JSON.stringify(updatedCustomerData));
          console.log("✅ Customer data updated with phone number:", updatedCustomerData);
        }
      } catch (profileError) {
        console.warn('⚠️ Failed to fetch profile for phone number:', profileError);
      }

      navigate("/home");
    } catch (err) {
      // Close modal and display error
      setShowProceedModal(false);
      setSavedCredentials(null);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProceed = () => {
    setShowProceedModal(false);
    setSavedCredentials(null);
  };

  // ===============================
  // JSX
  // ===============================
  return (
    <div className="login-container">
      <div className="login-content">
       
        <div className="login-art">
          <img
            src={getAsset('LOGIN_IMAGE', assets)}
            alt="Login Background"
            className="login-art-image"
          />
        </div>

        
        <div className="login-form-section">
          <div className="login-intro">
            <div className="login-logo">
              <img
                src={getAsset('LOGIN_LOGO', assets)}
                alt="Login Logo"
                className="logo-image-logo"
              />
            </div>
          </div>

          <form className="login-form" onSubmit={handleSignIn}>
            {error && <div className="login-error-message">{error}</div>}

            <div className="login-input-group">
              <label className="login-label">Email</label>
              <input
                type="email"
                className="login-input"
                placeholder="Example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                required
              />
            </div>

            <div className="login-extra">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>

              <button
                type="button"
                className="login-forgot-password"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD POPUP */}
      {showForgotPassword && (
        <div className="login-popup-overlay" onClick={closeAllPopups}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <button className="login-popup-close" onClick={closeAllPopups}>×</button>
            
            <h2 className="login-popup-title">Forgot Password</h2>
            <p className="login-popup-subtitle">Enter your email and new password to receive OTP</p>

            <form onSubmit={handleForgotPassword}>
              {forgotError && <div className="login-popup-error">{forgotError}</div>}

              <div className="login-popup-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                  required
                />
              </div>

              <div className="login-popup-input-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)}
                  disabled={forgotLoading}
                  minLength={8}
                  required
                />
              </div>

              <div className="login-popup-input-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  disabled={forgotLoading}
                  minLength={8}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="login-popup-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY OTP POPUP */}
      {showVerifyOTP && (
        <div className="login-popup-overlay" onClick={closeAllPopups}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <button className="login-popup-close" onClick={closeAllPopups}>×</button>
            
            <h2 className="login-popup-title">Verify OTP</h2>
            <p className="login-popup-subtitle">Enter the OTP sent to {forgotEmail}</p>

            <form onSubmit={handleVerifyOTP}>
              {forgotError && <div className="login-popup-error">{forgotError}</div>}

              <div className="login-popup-input-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={forgotLoading}
                  maxLength={6}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="login-popup-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="login-popup-resend">
                {canResend ? (
                  <button
                    type="button"
                    className="login-popup-link"
                    onClick={handleResendOTP}
                    disabled={forgotLoading}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="login-popup-timer">Resend OTP in {timer}s</span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCEED TO LOGIN MODAL */}
      <ProceedToLoginModal
        isOpen={showProceedModal}
        onProceed={handleProceed}
        onCancel={handleCancelProceed}
      />

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="login-popup-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <button className="login-popup-close" onClick={() => setShowSuccessModal(false)}>×</button>
            
            <h2 className="login-popup-title" style={{ color: '#28a745' }}>Success!</h2>
            <p className="login-popup-subtitle">
              Password reset successful! Please login with your new password.
            </p>

            <button 
              className="login-popup-btn"
              onClick={() => setShowSuccessModal(false)}
              style={{ marginTop: '20px' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
