import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../services/apiservice";
import "../../styles/Login/ForgotFlow.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiService.post("/auth/verify-reset-otp", { email, otp });
      navigate("/reset-password", { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    try {
      await apiService.post("/auth/forgot-password", { email });
      setTimer(60);
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">Verify OTP</button>

        {timer > 0 ? (
          <p className="auth-timer">Resend OTP in {timer}s</p>
        ) : (
          <button type="button" className="link-btn" onClick={handleResend}>
            Resend OTP
          </button>
        )}
      </form>
    </div>
  );
};

export default VerifyOtp;
