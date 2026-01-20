export const resolveOciModelName = (modelName, make) => {
  if (!modelName || !make) return null;

  const formattedMake = make
    .split(" ")
    .map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");

  return `${formattedMake} - ${modelName}`;
};
