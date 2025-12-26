import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/header/Logo.png";
import "../../styles/Login/Login.css";
import NoImage from "../../assets/Login/sidelogo.png";
import apiService from "../../services/apiservice"; // Adjust path as needed

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      // Call backend login API
      const response = await apiService.post("/auth/login", { email, password });
      const { token, user } = response;

      // Store token and user data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");

      console.log("Sign in successful:", email);
      navigate("/home"); // Redirect to home page

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/signup"); // Navigate to signup page
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password"); // Navigate to forgot password page
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Left Side - Login Form */}
        <div className="login-form-section">
          <div className="login-intro">
            <h1 className="login-welcome">Welcome Back To</h1>
            <div className="login-logo">
              <div className="logo-container">
                <img src={Logo} alt="Logo" className="logo-image-logo" />
              </div>
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
                required
                disabled={loading}
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
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <button
              type="button"
              className="login-forgot-password"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-signup-text">
            Don't have an account?{" "}
            <span className="login-signup-link" onClick={handleSignUp}>
              Sign up
            </span>
          </p>
        </div>

        {/* Right Side - Art Image */}
        <div className="login-art">
          <img src={NoImage} alt="Login Art" className="login-art-image" />
        </div>
      </div>
    </div>
  );
};

export default Login;
