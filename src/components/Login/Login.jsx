import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login/Login.css';
import NoImage from '../../assets/Login/sidelogo.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    // Add authentication logic here
    console.log('Sign in with:', email, password);
    // Navigate to home page after successful login
    navigate('/home');
  };

  const handleSignUp = () => {
    // Navigate to sign up page
    console.log('Navigate to sign up');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    console.log('Navigate to forgot password');
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
                <span className="logo-my">my</span>
                <span className="logo-tvs">TVS</span>
              </div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSignIn}>
            <div className="login-input-group">
              <label className="login-label">Email</label>
              <input
                type="email"
                className="login-input"
                placeholder="Example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="button"
              className="login-forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>

            <button type="submit" className="login-submit-btn">
              Sign in
            </button>
          </form>

          <p className="login-signup-text">
            Don't you have an account?{' '}
            <span className="login-signup-link" onClick={handleSignUp}>
              Sign up
            </span>
          </p>

          <p className="login-copyright">© 2023 ALL RIGHTS RESERVED</p>
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
