import { getOciModelIndex } from "./ociModelIndex";

export const resolveOciModelName = async (make, model) => {
  if (!make || !model) return null;

  const files = await getOciModelIndex();

  const makeUpper = make.toUpperCase();
  const modelUpper = model.toUpperCase();

  // 1️⃣ Filter by make
  const makeMatches = files.filter(f =>
    f.toUpperCase().startsWith(makeUpper)
  );

  if (!makeMatches.length) return null;

  // 2️⃣ Extract model tokens (numbers & letters only)
  const tokens = modelUpper.match(/[A-Z0-9]+/g) || [];

  // 3️⃣ Find best token match
  for (const token of tokens) {
    const hit = makeMatches.find(f =>
      f.toUpperCase().includes(token)
    );
    if (hit) return hit;
  }

  // 4️⃣ Fallback → first model of make
  return makeMatches[0];
};
