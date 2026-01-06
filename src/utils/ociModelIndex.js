import apiService from "../services/apiservice";

let cachedModels = null;

export const getOciModelIndex = async () => {
  if (cachedModels) return cachedModels;

  const res = await apiService.post("oci/read", {
    path: "Partsmart/PartsmartImages/PV/Model"
  });

  if (!res.data?.success) return [];

  cachedModels = res.data.files
    .filter(f => f.endsWith(".png"))
    .map(f => f.replace(".png", ""));

  return cachedModels;
};
