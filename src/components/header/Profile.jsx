import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/header/Profile.css';
import ProfileIcon from '../../assets/header/Profile_icon.png';
import LogoutIcon from '../../assets/header/Logout.png';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    navigate('/login');
  };

  // Mock user data - replace with actual user data from context/state
  const userData = {
    name: 'Sam Vijay',
    email: 'sam@tvs.in',
    mobile: '93228 99498',
    employeeCode: '93228',
    reportingTo: 'John',
    designation: 'Employee',
    salesManagerName: 'Jhon',
    salesManagerNumber: '9876545678'
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={ProfileIcon} alt="Profile" className="profile-avatar-img" />
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{userData.name}</h2>
            <p className="profile-email">{userData.email}</p>
            <button className="profile-logout-btn" onClick={handleLogout}>
              <span>Logout</span>
              <img src={LogoutIcon} alt="Logout" className="logout-icon" />
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="profile-labels">
            <p className="profile-label">Mobile</p>
            <p className="profile-label">Employee Code</p>
            <p className="profile-label">Reporting TO</p>
            <p className="profile-label">Designation</p>
            <p className="profile-label">Sales Manager Name</p>
            <p className="profile-label">Sales Manager Number</p>
          </div>

          <div className="profile-separator">
            <span className="separator-text">:</span>
            <span className="separator-text">:</span>
            <span className="separator-text">:</span>
            <span className="separator-text">:</span>
            <span className="separator-text">:</span>
            <span className="separator-text">:</span>
          </div>

          <div className="profile-values">
            <p className="profile-value">{userData.mobile}</p>
            <p className="profile-value">{userData.employeeCode}</p>
            <p className="profile-value">{userData.reportingTo}</p>
            <p className="profile-value">{userData.designation}</p>
            <p className="profile-value">{userData.salesManagerName}</p>
            <p className="profile-value">{userData.salesManagerNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
