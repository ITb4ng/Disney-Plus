import tmdbAxios from "./tmdbaxios";
import { getEnabledBannerSeeds, pickWeightedRandomSeed } from "./bannerPickRandom";

function hasUsableBannerFields(detail) {
  if (!detail || typeof detail !== "object") return false;

  const hasId = typeof detail.id === "number";
  const hasTitle =
    typeof detail.title === "string" ||
    typeof detail.name === "string" ||
    typeof detail.original_title === "string" ||
    typeof detail.original_name === "string";
  const hasVisual = Boolean(detail.backdrop_path || detail.poster_path);

  return hasId && hasTitle && hasVisual;
}

async function fetchSeedDetail(seed) {
  const { data: detail } = await tmdbAxios.get("", {
    params: {
      path: `${seed.type}/${seed.id}`,
      append_to_response: "videos",
      language: "ko-KR",
    },
  });

  if (!detail?.id) return null;
  if (!hasUsableBannerFields(detail)) return null;

  return {
    ...detail,
    media_type: seed.type,
    banner_seed: {
      id: seed.id,
      type: seed.type,
      key: seed.key,
      title: seed.title,
      weight: seed.weight,
      note: seed.note,
    },
  };
}

export async function fetchBannerNowPlaying() {
  const enabledSeeds = getEnabledBannerSeeds();
  if (!enabledSeeds.length) return null;

  const tried = new Set();

  while (tried.size < enabledSeeds.length) {
    const remainingSeeds = enabledSeeds.filter(
      (seed) => !tried.has(`${seed.type}:${seed.id}`)
    );

    const pickedSeed = pickWeightedRandomSeed(remainingSeeds);
    if (!pickedSeed) return null;

    const seedKey = `${pickedSeed.type}:${pickedSeed.id}`;
    tried.add(seedKey);

    try {
      const detail = await fetchSeedDetail(pickedSeed);
      if (detail) return detail;

      console.error(`❌ Unusable banner seed skipped: ${seedKey}`);
    } catch (error) {
      console.error(`❌ Failed banner seed skipped: ${seedKey}`, error);
    }
  }

  console.error("❌ No usable banner seed found");
  return null;
}