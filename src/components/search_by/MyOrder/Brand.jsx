import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BrandSkeleton from "../../skeletonLoading/BrandSkeleton";
import "../../../styles/search_by/MyOrder/Brand.css";
import { onlyWithUsAPI } from "../../../services/api";
import Navigation from "../../Navigation/Navigation";
import OciImage from "../../oci_image/ociImages.jsx";
import NoImage from "../../../assets/No Image.png";

const Brand = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { variant, featureLabel } = location.state || {};

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const isOnlyWithUs =
        variant === "logo" || featureLabel === "Only with us";

      if (!isOnlyWithUs) {
        setError("Invalid flow. Only-with-us source not detected.");
        setBrands([]);
        return;
      }

      console.log("Fetching brands from Only-With-Us API...");

      // Call centralized Only With Us API (GET method, no request body)
      const response = await onlyWithUsAPI();

      console.log("API Response:", response);

      // Handle response structure
      let onlyWithUsData = [];
      if (response && response.success && Array.isArray(response.data)) {
        onlyWithUsData = response.data;
      } else if (response && Array.isArray(response.data)) {
        onlyWithUsData = response.data;
      } else if (Array.isArray(response)) {
        onlyWithUsData = response;
      } else {
        throw new Error("Invalid API response structure");
      }

      // ✅ Extract unique brands
      const uniqueBrands = [
        ...new Set(
          onlyWithUsData
            .map(item => item.brand?.trim())
            .filter(Boolean)
        ),
      ];

      if (uniqueBrands.length === 0) {
        setError("No brands found.");
        setBrands([]);
        return;
      }

      // ✅ Format brands (OCI image will resolve dynamically)
      const formattedBrands = uniqueBrands.map((brandName, index) => ({
        id: index + 1,
        name: brandName,
      }));

      setBrands(formattedBrands);

    } catch (err) {
      console.error("Brand fetch error:", err);
      setError("Failed to load brands.");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    navigate("/CategoryNew", {
      state: {
        brand: brand.name,
        variant,
        featureLabel,
        isOnlyWithUs: true,
      },
    });
  };

  return (
    <div className="brand-container">
      {/* Navigation */}
      <div className="brand-top-section">
        <Navigation breadcrumbs={[{ label: "Brand" }]} />
      </div>

      {/* Loading */}
      {loading && <BrandSkeleton count={6} />}

      {/* Error */}
      {error && (
        <div className="brands-error">
          <p>{error}</p>
        </div>
      )}

      {/* Brands Grid */}
      {!loading && !error && (
        <div className="brands-grid">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="brand-card"
              onClick={() => handleBrandClick(brand)}
            >
              <div className="brand-image-wrapper">
                <OciImage
                  partNumber={brand.name}   // 🔥 brand name used as OCI filename
                  folder="brand"            // 🔥 uses Partsmart/PartsmartImages/brand/
                  fallbackImage={NoImage}
                  className="brand-image"
                  alt={brand.name}
                />
              </div>

              <div className="brand-name">
                {brand.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Brand;
