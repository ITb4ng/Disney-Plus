import { bannerPickSeeds } from "./bannerPickSeed";
import { validateBannerSeeds } from "./validateBannerSeed";

const validation = validateBannerSeeds(bannerPickSeeds);

if (!validation.isValid) {
  console.error("❌ Invalid bannerPickSeeds config");
  validation.errors.forEach((error) => console.error(error));
}

export function getEnabledBannerSeeds() {
  return bannerPickSeeds.filter((seed) => seed.enabled);
}

export function pickWeightedRandomSeed(seeds) {
  if (!Array.isArray(seeds) || !seeds.length) return null;

  const weightedPool = seeds.flatMap((seed) =>
    Array.from({ length: Math.max(seed.weight || 1, 1) }, () => seed)
  );

  if (!weightedPool.length) return null;

  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
}

export function getRandomBannerSeed() {
  const enabledSeeds = getEnabledBannerSeeds();
  return pickWeightedRandomSeed(enabledSeeds);
}