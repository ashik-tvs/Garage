import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiService from "../../services/apiservice";

import "../../styles/header/Profile.css";
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
        const data = await apiService.get("/profile");
        setProfile(data);
      } catch (error) {
        console.error("Profile fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!profile) {
    return <div className="profile-container">Profile not found</div>;
  }

  const userProfile = profile.UserProfile || {};

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
            <h2 className="profile-name">{userProfile.full_name || "N/A"}</h2>

            <p className="profile-email">{profile.email}</p>

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
            <p className="profile-label">Employee Code</p>
            <p className="profile-label">Designation</p>
          </div>
          <div className="profile-values">
            <p className="profile-value">{userProfile.mobile || "-"}</p>
            <p className="profile-value">{userProfile.employee_code || "-"}</p>
            <p className="profile-value">{userProfile.designation || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
