// utils/getOciImage.js
import NoImage from "../assets/customer/No Image.png";
import { apiService } from ""; // adjust path if needed

export const getOciImage = async (folder, fileName) => {
  try {
    if (!fileName) return NoImage;

    const original = fileName.trim();
    const upper = original.toUpperCase();
    const lower = original.toLowerCase();

    let path = "";

    switch (folder) {
      case "make":
        path = "Partsmart/PartsmartImages/CV/Make/";
        break;
      case "model":
        path = "Partsmart/PartsmartImages/CV/Model/";
        break;
      case "products":
        path = "Partsmart/PartsmartImages/products/";
        break;
      case "brand":
        path = "Partsmart/PartsmartImages/brand/";
        break;
      default:
        return NoImage;
    }

    const tryFiles = [
      `${upper}.png`,
      `${lower}.png`,
      `${original}.png`,
      `${upper}.jpg`,
      `${lower}.jpg`,
      `${original}.jpg`,
      `${upper}.PNG`,
      `${lower}.PNG`,
      `${original}.PNG`,
      `${upper}.JPG`,
      `${lower}.JPG`,
      `${original}.JPG`,
    ];

    for (const f of tryFiles) {
      try {
        const fullPath = `${path}${f}`;

        const response = await apiService.getBlob("/oci/read", {
          name: fullPath,
        });

        return URL.createObjectURL(response.data);
      } catch {
        // silently try next file
      }
    }

    return NoImage;
  } catch (err) {
    console.error("OCI Image Error:", err);
    return NoImage;
  }
};
