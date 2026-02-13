import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiService from "../../services/apiservice";

import "../../styles/header/Profile.css";
import "../../styles/skeleton/skeleton.css";
import ProfileIcon from "../../assets/header/Profile_icon.png";
import LogoutIcon from "../../assets/header/Logout.png";

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     Logout
  ========================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* =========================
     Fetch Profile
  ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem("token");
        console.log("🔑 Token exists:", !!token);
        
        if (!token) {
          console.error("❌ No token found in localStorage");
          navigate("/login");
          return;
        }

        console.log("📡 Fetching profile from /profile/user-details");
        const response = await apiService.get("/profile/user-details");
        
        console.log("✅ Profile response:", response);
        
        if (response.success && response.data) {
          setProfile(response.data.profile);
        } else {
          console.error("❌ Profile fetch failed:", response.message);
        }
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        console.error("Error response:", error.response);
        
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          console.error("🚫 Unauthorized - Token invalid or expired");
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="skeleton-profile-container">
            <div className="skeleton-profile-header">
              <div className="skeleton skeleton-profile-avatar"></div>
              <div className="skeleton-profile-header-info">
                <div className="skeleton skeleton-profile-name"></div>
                <div className="skeleton skeleton-profile-email"></div>
                <div className="skeleton skeleton-profile-logout"></div>
              </div>
            </div>
            <div className="skeleton-profile-details">
              <div className="skeleton skeleton-profile-label"></div>
              <div></div>
              <div className="skeleton skeleton-profile-value"></div>
              <div className="skeleton skeleton-profile-label"></div>
              <div></div>
              <div className="skeleton skeleton-profile-value"></div>
              <div className="skeleton skeleton-profile-label"></div>
              <div></div>
              <div className="skeleton skeleton-profile-value"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="profile-container">Profile not found</div>;
  }

  // Handle both customer and sales_executive user types
  const displayName = profile.site_code || profile.name || "N/A";
  const displayEmail = profile.email_address || profile.email || "N/A";
  const displayMobile = profile.phone_number || profile.mobile_number || "-";
  const displayCode = profile.customer_code || profile.sales_executive_id || "-";
  const companyName = profile.company.company_name|| "-";

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* =========================
           Header Section
        ========================= */}
        <div className="profile-header">
          <div className="profile-avatar">
            <img
              src={ProfileIcon}
              alt="Profile"
              className="profile-avatar-img"
            />
          </div>

          <div className="profile-header-info">
            <h2 className="profile-name">{displayName}</h2>

            <p className="profile-email">{displayEmail}</p>

            <button className="profile-logout-btn" onClick={handleLogout}>
              <span>Logout</span>
              <img src={LogoutIcon} alt="Logout" className="logout-icon" />
            </button>
          </div>
        </div>

        {/* =========================
           Profile Details
        ========================= */}
        <div className="profile-details">
          <div className="profile-labels">
            <p className="profile-label">Mobile</p>
            <p className="profile-label">Code</p>
            <p className="profile-label">Company</p>
          </div>
          <div className="profile-values">
            <p className="profile-value">{displayMobile}</p>
            <p className="profile-value">{displayCode}</p>
            <p className="profile-value">{companyName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
