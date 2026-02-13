import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTPAPI } from "../../services/api";
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

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      // Convert OTP to number before sending
      const otpNumber = parseInt(otp, 10);
      const response = await verifyOTPAPI(email, otpNumber);
      
      if (response.success) {
        navigate("/");  // Go to login after successful verification
      } else {
        setError(response.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    try {
      await apiService.post("/auth/resend-otp", { email });
      setTimer(60);
      setError("");  // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleVerify}>
        <h2>Verify OTP</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          pattern="\d{6}"
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
