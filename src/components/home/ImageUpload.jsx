import React, { useState } from 'react';
import '../../styles/home/ImageUpload.css';
import UploadIcon from '../../assets/header/upload_image.png';

const ImageUpload = ({ onClose, onImageSelect }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Call parent callback with the selected file
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Call parent callback with the selected file
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleBrowseClick = () => {
    document.getElementById('image-upload-input').click();
  };

  const handleClose = () => {
    setPreviewUrl(null);
    if (onClose) onClose();
  };

  return (
    <div className="image-upload-overlay">
      <div className="image-upload-container">
        <button className="image-upload-close-btn" onClick={handleClose}>
          <div className="image-upload-close-circle"></div>
          <div className="image-upload-close-x1"></div>
          <div className="image-upload-close-x2"></div>
        </button>

        <div
          className="image-upload-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="image-upload-preview" />
          ) : (
            <img src={UploadIcon} alt="Upload" className="image-upload-icon" />
          )}
        </div>

        <input
          type="file"
          id="image-upload-input"
          className="image-upload-input-hidden"
          accept="image/*"
          onChange={handleImageChange}
        />

        <p className="image-upload-text">
          Drop your Image or{' '}
          <span className="image-upload-browse" onClick={handleBrowseClick}>
            Browse
          </span>
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
