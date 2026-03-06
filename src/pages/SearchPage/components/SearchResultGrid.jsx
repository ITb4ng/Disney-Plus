import React from "react";

const getImageSources = (item) => {
  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
    : null;
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const fallback = "https://placehold.co/780x439/111827/9ca3af?text=No+Image";
  const src = backdrop || poster || fallback;

  const srcSet = backdrop
    ? `https://image.tmdb.org/t/p/w300${item.backdrop_path} 300w, https://image.tmdb.org/t/p/w780${item.backdrop_path} 780w`
    : poster
      ? `https://image.tmdb.org/t/p/w342${item.poster_path} 342w, https://image.tmdb.org/t/p/w500${item.poster_path} 500w`
      : undefined;

  return { src, srcSet };
};

const SearchResultGrid = ({ results, onSelect }) => {
  return (
    <section className="search-result-grid" aria-label="검색 결과">
      {results.map((item) => {
        const title = item.title || item.name || "제목 없음";
        const date = item.release_date || item.first_air_date || "";
        const year = date ? date.slice(0, 4) : "";
        const typeLabel = item.media_type === "tv" ? "시리즈" : "영화";
        const score = Number(item.vote_average || 0).toFixed(1);
        const { src, srcSet } = getImageSources(item);

        return (
          <button
            className="card"
            key={`${item.media_type}-${item.id}`}
            type="button"
            onClick={() => onSelect(item.media_type, item.id)}
            aria-label={`${title} 상세로 이동`}
          >
            <div className="card__media">
              <img
                src={src}
                srcSet={srcSet}
                sizes="(max-width: 520px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt={title}
                loading="lazy"
                decoding="async"
              />

              <div className="card__overlay">
                <div className="card__title" title={title}>
                  {title}
                </div>
                <div className="card__meta">
                  {typeLabel}
                  {year ? ` | ${year}` : ""}
                  {` | 평점 ${score}`}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
};

export default SearchResultGrid;
