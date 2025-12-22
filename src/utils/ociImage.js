// utils/getOciImage.js
import axios from "axios";
import NoImage from "../assets/No Image.png";

export const getOciImage = async (folder, fileName) => {
  try {
    if (!fileName) return NoImage;

    const original = fileName.trim();
    const upper = original.toUpperCase();
    const lower = original.toLowerCase();

    let path = "";

    if (folder === "make") {
      path = `Partsmart/PartsmartImages/CV/Make/`;
    } else if (folder === "model") {
      path = `Partsmart/PartsmartImages/CV/Model/`;
    } else if (folder === "products") {
      path = `Partsmart/PartsmartImages/products/`;
    } else if (folder === "brand") {
      path = `Partsmart/PartsmartImages/brand/`;
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

    for (let f of tryFiles) {
      try {
        const fullPath = `${path}${f}`; // IMPORTANT: NO MANUAL ENCODING

        const res = await axios.get("http://localhost:5000/api/oci/read", {
          params: { name: fullPath }, // Let axios encode it ONCE
          responseType: "blob",
        });

        return URL.createObjectURL(res.data);
      } catch (err) {
        console.log("❌ Not found:", f);
      }
    }

    return NoImage;
  } catch (error) {
    console.log("OCI Image Error:", error);
    return NoImage;
  }
};
