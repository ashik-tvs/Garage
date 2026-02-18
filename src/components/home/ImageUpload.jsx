import React, { useState, useRef, useCallback } from 'react';
import '../../styles/home/ImageUpload.css';
import UploadIcon from '../../assets/header/upload_image.png';

const ImageUpload = ({ onClose, onImageSelect }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  // Supported image formats
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Validate image file
  const validateImage = useCallback((file) => {
    setError(null);

    if (!file) {
      setError('No file selected');
      return false;
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError('Unsupported format. Please upload JPG, PNG, WEBP, or GIF');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 10MB');
      return false;
    }

    return true;
  }, []);

  // Process and preview image
  const processImage = useCallback((file) => {
    if (!validateImage(file)) return;

    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setError(null);
    };

    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          dimensions: `${img.width} × ${img.height}`,
          type: file.type.split('/')[1].toUpperCase()
        });
      };
      img.src = reader.result;
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again');
    };

    reader.readAsDataURL(file);

    // Call parent callback
    if (onImageSelect) {
      onImageSelect(file);
    }
  }, [validateImage, onImageSelect]);

  // Handle file input change
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  // Handle drag enter
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        setError('Please drop an image file');
      }
    }
  }, [processImage]);

  // Handle browse click
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    setImageInfo(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    setPreviewUrl(null);
    setImageInfo(null);
    setError(null);
    if (onClose) onClose();
  }, [onClose]);

  // Handle paste from clipboard
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImage(file);
          }
          break;
        }
      }
    }
  }, [processImage]);

  return (
    <div 
      className="image-upload-overlay"
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="image-upload-container">
        {/* Close Button */}
        <button 
          className="image-upload-close-btn" 
          onClick={handleClose}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Title */}
        <h2 className="image-upload-title">Upload Part Image</h2>
        <p className="image-upload-subtitle">
          Upload an image to identify the part using AI
        </p>

        {/* Dropzone */}
        <div
          className={`image-upload-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-image' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onClick={!previewUrl ? handleBrowseClick : undefined}
        >
          {previewUrl ? (
            <div className="image-upload-preview-container">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="image-upload-preview" 
              />
              <button 
                className="image-upload-remove-btn"
                onClick={handleRemoveImage}
                aria-label="Remove image"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="image-upload-placeholder">
              <img src={UploadIcon} alt="Upload" className="image-upload-icon" />
              <p className="image-upload-drag-text">
                {isDragging ? 'Drop image here' : 'Drag & drop your image here'}
              </p>
              <p className="image-upload-or">or</p>
              <button 
                className="image-upload-browse-btn"
                onClick={handleBrowseClick}
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          id="image-upload-input"
          className="image-upload-input-hidden"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
        />

        {/* Image Info */}
        {imageInfo && (
          <div className="image-upload-info">
            <div className="image-upload-info-item">
              <span className="image-upload-info-label">Name:</span>
              <span className="image-upload-info-value">{imageInfo.name}</span>
            </div>
            <div className="image-upload-info-item">
              <span className="image-upload-info-label">Size:</span>
              <span className="image-upload-info-value">{imageInfo.size}</span>
            </div>
            <div className="image-upload-info-item">
              <span className="image-upload-info-label">Dimensions:</span>
              <span className="image-upload-info-value">{imageInfo.dimensions}</span>
            </div>
            <div className="image-upload-info-item">
              <span className="image-upload-info-label">Format:</span>
              <span className="image-upload-info-value">{imageInfo.type}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="image-upload-error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Supported Formats */}
        <div className="image-upload-formats">
          <p>Supported formats: JPG, PNG, WEBP, GIF (Max 10MB)</p>
          <p className="image-upload-tip">💡 Tip: You can also paste an image from clipboard (Ctrl+V)</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
