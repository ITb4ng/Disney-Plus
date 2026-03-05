export const tmdbImg = (path, size = "w1280") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export const pickHeroSize = () => {
  const w = window.innerWidth || 1024;

  if (w <= 768) return "original";
  if (w <= 1440) return "w1280";
  return "w1920";
};