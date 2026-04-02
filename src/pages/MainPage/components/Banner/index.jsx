import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchBannerNowPlaying } from "../../../../api/bannerQueries";
import { getAppScrollY } from "../../../../utils/scrollPosition";
import "./Banner.css";

const DEV_BANNER_DEBUG_STATE = null;
const FALLBACK_DEBUG_STATES = ["no-image", "image-error", "cdn-fail"];

const getYear = (movie) => {
  const date = movie?.release_date || movie?.first_air_date || movie?.air_date || "";
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

const BannerLoadingView = ({ bannerRef, panelClassName = "" }) => (
  <header ref={bannerRef} className={`banner banner--panel ${panelClassName}`}>
    <div className="banner__contents">
      <div className="sk sk-title" />
      <div className="sk sk-meta" />
      <div className="banner__buttons">
        <div className="sk sk-btn" />
      </div>
    </div>
  </header>
);

const BannerErrorView = ({ bannerRef, title, description, panelClassName = "" }) => (
  <header ref={bannerRef} className={`banner banner--state banner--panel ${panelClassName}`}>
    <div className="banner__contents">
      <h1 className="banner__title">{title}</h1>
      {description && <p className="banner__stateText">{description}</p>}
    </div>
  </header>
);

const BannerEmptyView = ({ bannerRef, title, description, panelClassName = "" }) => (
  <header ref={bannerRef} className={`banner banner--state banner--panel ${panelClassName}`}>
    <div className="banner__contents">
      <h1 className="banner__title">{title}</h1>
      {description && <p className="banner__stateText">{description}</p>}
    </div>
  </header>
);

const BannerContentView = ({
  bannerRef,
  movie,
  isDimmed,
  isFallbackMode,
  goDetail,
  parallaxOffset,
  overlayStrength,
}) => {
  const title =
    movie?.title ||
    movie?.name ||
    movie?.original_name ||
    "제목 정보를 불러오지 못했습니다.";

  const rating =
    typeof movie?.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : null;

  const metaItems = [
    rating ? `평점 ${rating}` : null,
    getYear(movie),
    getGenresText(movie),
    getRuntimeText(movie),
  ].filter(Boolean);

  const backgroundImage =
    !isFallbackMode && movie?.backdrop_path
      ? `url("https://image.tmdb.org/t/p/original/${movie.backdrop_path}")`
      : "none";

  return (
    <header
      ref={bannerRef}
      className={`banner ${isDimmed ? "is-dimmed" : ""} ${
        isFallbackMode ? "banner--image-fallback" : ""
      }`}
      style={{ "--banner-overlay-progress": overlayStrength }}
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

      <div
        className={`banner__contents ${
          isFallbackMode ? "banner__contents--fallback" : ""
        }`}
      >
        {isFallbackMode ? (
          <div className="banner__fallbackPanel" aria-live="polite">
            <img className="banner__fallbackLogo" src="/images/logo.svg" alt="Disney+" />
            <div className="banner__fallbackEyebrow">배너 이미지 준비 중</div>
            <h1 className="banner__title banner__title--fallback">{title}</h1>
            <p className="banner__fallbackText">
              이미지를 불러오지 못해 기본 안내 화면으로 표시하고 있습니다.
            </p>
            <div className="banner__buttons banner__buttons--fallback">
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
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  );
};

const Banner = ({ debugState: debugStateProp = null }) => {
  const { data: movie, isLoading, isError, error } = useQuery({
    queryKey: ["banner", "nowPlaying"],
    queryFn: fetchBannerNowPlaying,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const bannerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDimmed, setIsDimmed] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [overlayStrength, setOverlayStrength] = useState(0);

  const isDevelopment = process.env.NODE_ENV === "development";
  const debugState = debugStateProp ?? (isDevelopment ? DEV_BANNER_DEBUG_STATE : null);
  const resolvedMovie = movie;

  const bannerStatus = useMemo(() => {
    if (debugState === "loading") return "loading";
    if (debugState === "error") return "error";
    if (debugState === "empty") return "empty";
    if (FALLBACK_DEBUG_STATES.includes(debugState)) return "success";
    if (isLoading) return "loading";
    if (isError) return "error";
    if (!movie) return "empty";
    return "success";
  }, [debugState, isLoading, isError, movie]);

  const panelClassName = useMemo(() => {
    if (bannerStatus === "loading") return "banner--panel-loading";
    if (bannerStatus === "empty") return "banner--panel-empty";
    if (bannerStatus === "error") return "banner--panel-error";
    return "";
  }, [bannerStatus]);

  const goDetail = () => {
    if (!resolvedMovie?.id) return;
    const type = resolvedMovie?.media_type || "movie";
    navigate(`/detail/${type}/${resolvedMovie.id}`, {
      state: {
        from: location.pathname + location.search,
        scrollY: getAppScrollY(),
      },
    });
  };

  useEffect(() => {
    if (bannerStatus !== "success" || !bannerRef.current) {
      setParallaxOffset(0);
      setOverlayStrength(0);
      setIsDimmed(false);
      return;
    }

    const navEl = document.querySelector(".app-nav");
    const scrollTarget = document.querySelector(".layout") || window;
    let rafId = 0;

    const updateBannerState = () => {
      rafId = 0;
      if (!bannerRef.current) return;

      const rect = bannerRef.current.getBoundingClientRect();
      const pageScroll = getAppScrollY();
      const mqTouch = window.matchMedia("(hover: none) and (pointer: coarse)");
      const mqAnyCoarse = window.matchMedia("(any-pointer: coarse)");
      const hasTouchPoints =
        Number(window.navigator?.maxTouchPoints || window.navigator?.msMaxTouchPoints || 0) > 0;
      const isTouchLayout = hasTouchPoints || mqTouch.matches || mqAnyCoarse.matches;
      const nextParallaxOffset = isTouchLayout
        ? 0
        : Math.min(Math.max(-rect.top / 10, 0), 28);
      const nextOverlayStrength = Math.min(pageScroll / 220, 1);

      setParallaxOffset((prev) =>
        Math.abs(prev - nextParallaxOffset) > 0.5 ? nextParallaxOffset : prev
      );
      setOverlayStrength((prev) =>
        Math.abs(prev - nextOverlayStrength) > 0.02 ? nextOverlayStrength : prev
      );

      if (navEl) {
        const navRect = navEl.getBoundingClientRect();
        const overlapPx = Math.max(0, navRect.bottom - rect.top);
        const nextIsDimmed = overlapPx > navRect.height;
        setIsDimmed((prev) => (prev !== nextIsDimmed ? nextIsDimmed : prev));
      }
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateBannerState);
    };

    updateBannerState();
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      scrollTarget.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [bannerStatus, resolvedMovie?.id]);

  useEffect(() => {
    setIsFallbackMode(false);
  }, [resolvedMovie?.backdrop_path, debugState]);

  useEffect(() => {
    if (bannerStatus !== "success") {
      setIsFallbackMode(false);
      return;
    }

    if (FALLBACK_DEBUG_STATES.includes(debugState)) {
      setIsFallbackMode(true);
      return;
    }

    if (!resolvedMovie?.backdrop_path) {
      setIsFallbackMode(true);
      return;
    }

    const img = new Image();
    img.src = `https://image.tmdb.org/t/p/original/${resolvedMovie.backdrop_path}`;
    img.onload = () => setIsFallbackMode(false);
    img.onerror = () => setIsFallbackMode(true);
  }, [bannerStatus, resolvedMovie?.backdrop_path, debugState]);

  if (bannerStatus === "loading") {
    return <BannerLoadingView bannerRef={bannerRef} panelClassName={panelClassName} />;
  }

  if (bannerStatus === "error") {
    return (
      <BannerErrorView
        bannerRef={bannerRef}
        panelClassName={panelClassName}
        title="배너를 불러오지 못했습니다."
        description={
          debugState === "error"
            ? "개발용 에러 상태입니다. 배너 에러 UI를 확인해 주세요."
            : error?.message || "네트워크 상태 또는 API 응답을 확인해 주세요."
        }
      />
    );
  }

  if (bannerStatus === "empty") {
    return (
      <BannerEmptyView
        bannerRef={bannerRef}
        panelClassName={panelClassName}
        title="표시할 배너 콘텐츠가 없습니다."
        description="현재 추천 콘텐츠를 불러오지 못했습니다."
      />
    );
  }

  return (
    <BannerContentView
      bannerRef={bannerRef}
      movie={resolvedMovie}
      isDimmed={isDimmed}
      isFallbackMode={isFallbackMode}
      goDetail={goDetail}
      parallaxOffset={parallaxOffset}
      overlayStrength={overlayStrength}
    />
  );
};

export default Banner;
