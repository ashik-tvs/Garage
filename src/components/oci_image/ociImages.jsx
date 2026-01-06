import React, { useEffect, useState } from "react";
import NoImage from "../../assets/No Image.png";
import { getOciImage } from "../../utils/ociImage";
import { resolveOciModelName } from "../../utils/resolveOciModel";

const Image = ({
  partNumber,
  folder = "products",
  fallbackImage,
  className = "pr-image",
  alt,
  style
}) => {
  const [imgUrl, setImgUrl] = useState(fallbackImage || NoImage);

  useEffect(() => {
    if (!partNumber) return;

    const loadImage = async () => {
      let ociName = partNumber;

      if (folder === "model") {
        ociName = await resolveOciModelName(partNumber);
      }

      const url = await getOciImage(folder, ociName);

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
      style={style}
    />
  );
};

export default Image;
