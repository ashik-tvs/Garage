import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Login/Login.css";
import apiService from "../../services/apiservice";

const Login = () => {
  const navigate = useNavigate();

  // ===============================
  // STATE
  // ===============================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // UI Assets
  const [uiAssets, setUiAssets] = useState({});

  // ===============================
  // LOAD UI ASSETS
  // ===============================
  useEffect(() => {
    const fetchUiAssets = async () => {
      try {
        const assets = await apiService.get("/ui-assets"); // returns { success: true, data: {...} }
        setUiAssets(assets.data); // use 'data' from backend
      } catch (err) {
        console.error("❌ Failed to load UI assets", err);
      }
    };

    fetchUiAssets();
  }, []);

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

      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      // store JWT token
      localStorage.setItem("token", response.token);

      // store user data
      localStorage.setItem("loggedInUser", JSON.stringify(response.user));

      // store customer data
      localStorage.setItem(
        "loggedInCustomer",
        JSON.stringify(response.customer),
      );

      const userLocation = JSON.parse(
        localStorage.getItem("userLocation") || "{}",
      );
      if (!userLocation.lat || !userLocation.lng) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        );
      }

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // JSX
  // ===============================
  return (
    <div className="login-container">
      <div className="login-content">
        {/* LEFT SIDE */}
        <div className="login-art">
          {uiAssets.LOGIN_IMAGE && (
            <img
              src={apiService.getAssetUrl(uiAssets.LOGIN_IMAGE)}
              alt="Login Background"
              className="login-art-image"
            />
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="login-form-section">
          <div className="login-intro">
            <div className="login-logo">
              {uiAssets.LOGO && (
                <img
                  src={apiService.getAssetUrl(uiAssets.LOGO)}
                  alt="Login Logo"
                  className="logo-image-logo"
                />
              )}
            </div>
            <h1 className="login-heading">LOGIN</h1>
          </div>

          <form className="login-form" onSubmit={handleSignIn}>
            {error && <div className="login-error-message">{error}</div>}

            <div className="login-input-group">
              <label className="login-label">Employee ID</label>
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
                onClick={() => navigate("/forgot-password")}
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
    </div>
  );
};

export default Login;
