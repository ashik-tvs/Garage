import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../services/apiservice";
import "../../styles/Login/ForgotFlow.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const otp = state?.otp;

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email || !otp) navigate("/forgot-password");
  }, [email, otp, navigate]);

  const isStrongPassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!isStrongPassword(newPassword)) {
      setError("Password must contain uppercase, lowercase and number");
      return;
    }

    try {
      await apiService.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleReset}>
        <h2>Reset Password</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
