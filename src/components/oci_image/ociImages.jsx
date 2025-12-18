import React, { useEffect, useState } from "react";
import NoImage from "../../assets/No Image.png";
import { getOciImage } from "../../utils/ociImage";

const Image = ({ partNumber, folder = "products" }) => {
  const [imgUrl, setImgUrl] = useState(NoImage);

  useEffect(() => {
    if (!partNumber) return;

    const loadImage = async () => {
      const url = await getOciImage(folder, partNumber);
      setImgUrl(url);
    };

    loadImage();
  }, [partNumber, folder]);

  return (
    <img
      src={imgUrl}
      alt={partNumber}
      className="pr-image"
      style={{
        width: "100%",
        height: "150px",
        objectFit: "contain",
      }}
    />
  );
};

export default Image;
