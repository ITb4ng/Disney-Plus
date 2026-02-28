export const tmdbImg = (path, size = "w1280") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export const pickHeroSize = () => {
  const w = window.innerWidth || 1024;
  const dpr = window.devicePixelRatio || 1;

  if (w <= 480) return dpr >= 2 ? "w1280" : "w780";
  if (w <= 1024) return "w1280";
  return "w1920"; 
};