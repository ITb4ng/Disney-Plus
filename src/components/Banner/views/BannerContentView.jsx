import React from "react";

const getYear = (movie) => {
  const date =
    movie?.release_date || movie?.first_air_date || movie?.air_date || "";
  return date ? String(date).slice(0, 4) : null;
};

const getGenresText = (movie) => {
  if (!Array.isArray(movie?.genres) || movie.genres.length === 0) return "";
  return movie.genres
    .slice(0, 2)
    .map((genre) => genre?.name)
    .filter(Boolean)
    .join(" · ");
};

const getRuntimeText = (movie) => {
  if (movie?.runtime) {
    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  if (movie?.number_of_seasons) {
    return `시즌 ${movie.number_of_seasons}`;
  }

  return "";
};

const BannerContentView = ({
  bannerRef,
  movie,
  isDimmed,
  isImageError,
  goDetail,
  parallaxOffset = 0,
  overlayStrength = 0,
}) => {
  const title =
    movie?.title ||
    movie?.name ||
    movie?.original_name ||
    "제목 정보를 불러오지 못했습니다";

  const rating =
    typeof movie?.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  const year = getYear(movie);
  const genresText = getGenresText(movie);
  const runtimeText = getRuntimeText(movie);

  const metaItems = [
    rating ? `⭐ ${rating}` : null,
    year,
    genresText,
    runtimeText,
  ].filter(Boolean);

  const backgroundImage =
    !isImageError && movie?.backdrop_path
      ? `url("https://image.tmdb.org/t/p/original/${movie.backdrop_path}")`
      : "none";

  return (
    <header
      ref={bannerRef}
      className={`banner ${isDimmed ? "is-dimmed" : ""} ${
        isImageError ? "banner--image-fallback" : ""
      }`}
      style={{
        "--banner-overlay-progress": overlayStrength,
      }}
    >
      <div
        className="banner__bg"
        style={{
          backgroundImage,
          backgroundPosition: "top center",
          backgroundSize: "cover",
          transform: `translateY(${parallaxOffset}px) scale(1.06)`,
        }}
      />

      <div className="banner__overlay" />

      <div className="banner__contents">
        <h1 className="banner__title">{title}</h1>

        {metaItems.length > 0 && (
          <div className="banner__meta" aria-label="콘텐츠 메타 정보">
            {metaItems.map((item, index) => (
              <span className="banner__metaItem" key={`${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        )}

        <div className="banner__buttons">
          <button
            type="button"
            className="banner__button banner__button--primary"
            onClick={goDetail}
            aria-label="상세 페이지로 이동"
          >
            자세히 보기
          </button>
        </div>
      </div>
    </header>
  );
};

export default BannerContentView;