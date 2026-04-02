import React, { useEffect, useMemo, useState } from "react";

const DEBUG_BROKEN_IMAGE_SRC = "/__debug__/force-image-error.jpg";
const FALLBACK_IMAGE_SRC =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900' preserveAspectRatio='none'><rect width='1600' height='900' fill='%23111827'/></svg>";

const getImageSources = (item, debugState) => {
  const isNoImage = debugState === "no-image";
  const isImageError = debugState === "image-error";
  const isCdnFail = debugState === "cdn-fail";

  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
    : null;
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const src = isCdnFail
    ? FALLBACK_IMAGE_SRC
    : isImageError
      ? DEBUG_BROKEN_IMAGE_SRC
      : isNoImage
        ? null
        : backdrop || poster || null;

  const srcSet =
    isNoImage || isImageError || isCdnFail
      ? undefined
      : backdrop
        ? `https://image.tmdb.org/t/p/w300${item.backdrop_path} 300w, https://image.tmdb.org/t/p/w780${item.backdrop_path} 780w`
        : poster
          ? `https://image.tmdb.org/t/p/w342${item.poster_path} 342w, https://image.tmdb.org/t/p/w500${item.poster_path} 500w`
          : undefined;

  return {
    src,
    srcSet,
    isNoImage,
    isImageError,
    isCdnFail,
    hasSourceImage: Boolean(backdrop || poster),
  };
};

function SearchResultCard({ item, onSelect, debugState }) {
  const title = item.title || item.name || "제목 없음";
  const date = item.release_date || item.first_air_date || "";
  const year = date ? date.slice(0, 4) : "";
  const typeLabel = item.media_type === "tv" ? "시리즈" : "영화";
  const score = Number(item.vote_average || 0).toFixed(1);

  const { src, srcSet, isNoImage, isCdnFail, hasSourceImage } = useMemo(
    () => getImageSources(item, debugState),
    [item, debugState]
  );

  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [debugState, item.backdrop_path, item.poster_path, item.id]);

  const shouldShowFallbackLabel =
    isNoImage || isCdnFail || hasImageError || !hasSourceImage;

  const fallbackLabel = isNoImage
    ? "이미지 없음"
    : isCdnFail
      ? "기본 이미지"
      : "이미지 오류";

  return (
    <button
      className="card"
      key={`${item.media_type}-${item.id}`}
      type="button"
      onClick={() => onSelect(item.media_type, item.id)}
      aria-label={`${title} 상세로 이동`}
    >
      <div
        className={`card__media ${shouldShowFallbackLabel ? "card__media--fallback" : ""}`}
      >
        {src && !hasImageError ? (
          <img
            src={src}
            srcSet={srcSet}
            sizes="(max-width: 520px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => {
              setHasImageError(true);
            }}
          />
        ) : null}

        {shouldShowFallbackLabel && (
          <div className="card__fallbackLabel" aria-hidden="true">
            {fallbackLabel}
          </div>
        )}

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
}

const SearchResultGrid = ({ results, onSelect, debugState = "success" }) => {
  return (
    <section className="search-result-grid" aria-label="검색 결과">
      {results.map((item) => (
        <SearchResultCard
          key={`${item.media_type}-${item.id}`}
          item={item}
          onSelect={onSelect}
          debugState={debugState}
        />
      ))}
    </section>
  );
};

export default SearchResultGrid;
