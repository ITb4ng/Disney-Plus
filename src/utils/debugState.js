export const COMMON_DEBUG_STATES = [
  "success",
  "loading",
  "error",
  "empty",
  "no-image",
  "cdn-fail",
];

export function normalizeDebugState(
  value,
  allowed = COMMON_DEBUG_STATES,
  fallback = "success"
) {
  if (typeof value !== "string") return fallback;
  return allowed.includes(value) ? value : fallback;
}

export function pickDebugStateFromSearchParams(
  searchParams,
  key,
  {
    fallback = "success",
    allowed = COMMON_DEBUG_STATES,
    sharedKey = "debugState",
  } = {}
) {
  const own = searchParams.get(key);
  const shared = searchParams.get(sharedKey);
  return normalizeDebugState(own ?? shared, allowed, fallback);
}
