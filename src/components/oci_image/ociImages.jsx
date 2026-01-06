import React, { useEffect, useState } from "react";
import NoImage from "../../assets/No Image.png";
import { getOciImage } from "../../utils/ociImage";

const Image = ({ partNumber, folder = "products", fallbackImage, className = "pr-image", alt, style }) => {
  const [imgUrl, setImgUrl] = useState(fallbackImage || NoImage);

  useEffect(() => {
    if (!partNumber) return;

    const loadImage = async () => {
      const url = await getOciImage(folder, partNumber);
      // If the image is not found (returns NoImage), use the fallback if provided
      if (url === NoImage && fallbackImage) {
        setImgUrl(fallbackImage);
      } else {
        setImgUrl(url);
      }
    };

    loadImage();
  }, [partNumber, folder, fallbackImage]);

  return (
    <img
      src={imgUrl}
      alt={alt || partNumber}
      className={className}
      style={{ width: "100%", height: "60px", objectFit: "contain", ...style }}
    />
  );
};

export default Image;
