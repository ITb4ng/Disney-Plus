const ALLOWED_TYPES = ["tv", "movie"];

export function validateBannerSeed(seed) {
  const errors = [];

  if (!seed || typeof seed !== "object") {
    return {
      isValid: false,
      errors: ["seed must be an object"],
    };
  }

  if (typeof seed.id !== "number" || Number.isNaN(seed.id) || seed.id <= 0) {
    errors.push("id must be a positive number");
  }

  if (!ALLOWED_TYPES.includes(seed.type)) {
    errors.push('type must be either "tv" or "movie"');
  }

  if (typeof seed.key !== "string" || !seed.key.trim()) {
    errors.push("key must be a non-empty string");
  }

  if (typeof seed.title !== "string" || !seed.title.trim()) {
    errors.push("title must be a non-empty string");
  }

  if (typeof seed.enabled !== "boolean") {
    errors.push("enabled must be a boolean");
  }

  if (
    typeof seed.weight !== "number" ||
    Number.isNaN(seed.weight) ||
    seed.weight < 1
  ) {
    errors.push("weight must be a number greater than or equal to 1");
  }

  if ("note" in seed && typeof seed.note !== "string") {
    errors.push("note must be a string when provided");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateBannerSeeds(seeds) {
  if (!Array.isArray(seeds)) {
    return {
      isValid: false,
      errors: ["bannerPickSeeds must be an array"],
      invalidSeeds: [],
    };
  }

  const invalidSeeds = seeds
    .map((seed, index) => {
      const result = validateBannerSeed(seed);
      return result.isValid
        ? null
        : {
            index,
            seed,
            errors: result.errors,
          };
    })
    .filter(Boolean);

  return {
    isValid: invalidSeeds.length === 0,
    errors: invalidSeeds.flatMap(
      ({ index, errors }) => errors.map((error) => `seed[${index}]: ${error}`)
    ),
    invalidSeeds,
  };
}