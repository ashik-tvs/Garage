import axios from "axios";
import NoImage from "../assets/No Image.png";

const normalizeOciFileName = (name) => {
  if (!name) return "";

  return name
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\(f/gi, "(F")
    .trim();
};

export const getOciImage = async (folder, fileName) => {
  try {
    if (!fileName) return NoImage;

    const original = normalizeOciFileName(fileName);
    const upper = original.toUpperCase();
    const lower = original.toLowerCase();

    let path = "";

    if (folder === "make") {
      path = `Partsmart/PartsmartImages/PV/Make/`;
    } else if (folder === "model") {
      path = `Partsmart/PartsmartImages/PV/Model/`;
    } else if (folder === "products") {
      path = `Partsmart/PartsmartImages/products/`;
    } else if (folder === "brand") {
      path = `Partsmart/PartsmartImages/brand/`;
    } else if (folder === "categories") {
      path = `Partsmart/PartsmartImages/PV/Categories/`;
    } else if (folder === "subcategories") {
      path = `Partsmart/PartsmartImages/PV/SubCategory/`;
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
        const fullPath = `${path}${f}`;

        const res = await axios.get("http://localhost:5000/api/oci/read", {
          params: { name: fullPath },
          responseType: "blob",
        });

        return URL.createObjectURL(res.data);
      } catch {
        console.log("❌ Not found:", f);
      }
    }

    return NoImage;
  } catch (error) {
    console.log("OCI Image Error:", error);
    return NoImage;
  }
};
