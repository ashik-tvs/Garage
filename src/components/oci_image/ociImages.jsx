import React, { useEffect, useState, useRef, useCallback } from "react";
import NoImage from "../../assets/No Image.png";
import { getOciImage, revokeOciImageUrl } from "../../utils/ociImage";
import { resolveOciModelName } from "../../utils/resolveOciModel";
import "../../styles/oci_image/ociImage.css";

const Image = ({
  partNumber,
  make,
  folder = "products",
  fallbackImage,
  className = "pr-image",
  alt,
  style,
  lazy = false,
  priority = true,
}) => {
  const [imgUrl, setImgUrl] = useState(fallbackImage || NoImage); // Start with fallback instead of null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const currentUrlRef = useRef(null);
  const loadedRef = useRef(false);
  const mountedRef = useRef(true); // Track if component is mounted

  // Cleanup function - DON'T revoke blob URLs to allow reuse across navigation
  const cleanup = useCallback(() => {
    // Don't revoke blob URLs - they're cached and reused
    // The cache manager will handle cleanup when needed
    currentUrlRef.current = null;
  }, []);

  // Load image function - only load once
  const loadImage = useCallback(async () => {
    if (!partNumber || loadedRef.current || !mountedRef.current) return;

    loadedRef.current = true;
    setLoading(true);
    setError(false);

    try {
      let ociName = partNumber;

      // Resolve model name if needed
      if (folder === "model") {
        ociName = await resolveOciModelName(partNumber, make);
        if (!ociName) {
          if (mountedRef.current) {
            setImgUrl(fallbackImage || NoImage);
            setLoading(false);
            setError(true);
          }
          return;
        }
      }

      // Cleanup previous URL before loading new one
      cleanup();

      const url = await getOciImage(folder, ociName);
      
      // Check if component is still mounted and this is the latest request
      if (mountedRef.current) {
        if (url && url !== NoImage) {
          currentUrlRef.current = url;
          setImgUrl(url);
          setError(false);
        } else {
          setImgUrl(fallbackImage || NoImage);
          setError(true);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error("🔴 OCI Image loading error:", err);
      if (mountedRef.current) {
        setImgUrl(fallbackImage || NoImage);
        setLoading(false);
        setError(true);
      }
    }
  }, [partNumber, folder, make, fallbackImage, cleanup]);

  // Load image immediately when component mounts
  useEffect(() => {
    mountedRef.current = true;
    loadImage();
    
    return () => {
      mountedRef.current = false;
    };
  }, [loadImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Handle image load error - fallback to NoImage
  const handleImageError = useCallback(() => {
    if (mountedRef.current) {
      console.warn(`🟡 Image load error for ${folder}/${partNumber}`);
      setImgUrl(fallbackImage || NoImage);
      setError(true);
      setLoading(false);
    }
  }, [fallbackImage, folder, partNumber]);

  // Handle successful image load
  const handleImageLoad = useCallback(() => {
    if (mountedRef.current) {
      setLoading(false);
      setError(false);
    }
  }, []);

  // Build CSS classes
  const cssClasses = [
    className,
    'oci-optimized',
    loading ? 'oci-loading' : '',
    error ? 'oci-error' : ''
  ].filter(Boolean).join(' ');

  // Show skeleton only while loading and no image URL yet
  if (loading && (imgUrl === NoImage || imgUrl === fallbackImage)) {
    return (
      <div 
        className={`${cssClasses} oci-skeleton`}
        style={style}
        ref={imgRef}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={imgUrl || fallbackImage || NoImage}
      alt={alt || partNumber}
      className={cssClasses}
      style={style}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="eager" // Load all images immediately
    />
  );
};

export default Image;
