import React, { useRef, useState } from "react";
import { HiOutlineMicrophone } from "react-icons/hi";
import { AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

import Banner from "../../assets/home/banner.png";
import SearchIcon from "../../assets/search/search.png";
import ImageUpload from "./ImageUpload";
import "../../styles/home/Search.css";

const Search = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Vehicle number validation
  const isVehicleNumber = (value) => {
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
    return regex.test(value);
  };

  // Part number validation
  const isPartNumber = (value) => /^[0-9]+$/.test(value);

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;

    const value = searchValue.toUpperCase().replace(/\s+/g, "");

    if (isVehicleNumber(value)) {
      navigate("/search-by-vehicle-number", {
        state: { vehicleNumber: value },
      });
      return;
    }

    if (isPartNumber(value)) {
      navigate("/search-by-part-number", {
        state: { partNumber: value },
      });
      return;
    }

    navigate("/search-by-service-type", {
      state: { serviceType: searchValue },
    });
  };

  // 📸 IMAGE SEARCH
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    navigate("/search-by-image", {
      state: {
        imageFile: file,
        previewUrl: URL.createObjectURL(file),
      },
    });
  };

  const handleImageUploadSelect = (file) => {
    if (!file) return;

    navigate("/search-by-image", {
      state: {
        imageFile: file,
        previewUrl: URL.createObjectURL(file),
      },
    });
    setShowImageUpload(false);
  };

  return (
    <div className="search-wrapper">
      <div
        className="search-banner-container"
        style={{ backgroundImage: `url(${Banner})` }}
      >
        <div className="search-content">
          <h2 className="search-title">
            Looking for parts? Just enter your vehicle number to get started
          </h2>

          <div className="search-box">
            <img src={SearchIcon} className="search-s-icon" alt="search" />

            <input
              type="text"
              placeholder="Search in Garage"
              className="search-s-input"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
            />

            {/* 🎤 Voice */}
            <HiOutlineMicrophone
              className="search-mic"
              onClick={() => alert("Voice search coming soon")}
            />

            {/* 📸 Image */}
            <AiOutlineCamera
              className="search-upload"
              onClick={() => setShowImageUpload(true)}
            />

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageSelect}
            />
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUpload
          onClose={() => setShowImageUpload(false)}
          onImageSelect={handleImageUploadSelect}
        />
      )}
    </div>
  );
};

export default Search;
