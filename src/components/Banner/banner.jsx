import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchBannerNowPlaying } from "../../api/bannerQueries";
import "./Banner.css";

/* =========================
   개발모드 전용 디버깅 설정
   - 개발 환경에서만 강제 상태를 확인하기 위한 값
   - null | "loading" | "empty" | "error" | "success" | "image-error"
   ========================= */
const DEV_BANNER_DEBUG_STATE = null;


/* =========================
   메타 정보 가공 함수
   ========================= */
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

/* =========================
   상태 뷰
   ========================= */
const BannerLoadingView = ({ bannerRef, panelClassName = "" }) => {
  return (
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
};

const BannerErrorView = ({
  bannerRef,
  title,
  description,
  panelClassName = "",
}) => {
  return (
    <header
      ref={bannerRef}
      className={`banner banner--state banner--panel ${panelClassName}`}
    >
      <div className="banner__contents">
        <h1 className="banner__title">{title}</h1>
        {description && <p className="banner__stateText">{description}</p>}
        error
      </div>
    </header>
  );
};

const BannerEmptyView = ({
  bannerRef,
  title,
  description,
  panelClassName = "",
}) => {
  return (
    <header
      ref={bannerRef}
      className={`banner banner--state banner--panel ${panelClassName}`}
    >
      <div className="banner__contents">
        <h1 className="banner__title">{title}</h1>
        {description && <p className="banner__stateText">{description}</p>}
      </div>
    </header>
  );
};

/* =========================
   정상 배너 본문
   ========================= */
const BannerContentView = ({
  bannerRef,
  movie,
  isDimmed,
  isImageError,
  goDetail,
  parallaxOffset,
  overlayStrength,
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

/* =========================
   메인 배너
   ========================= */
const Banner = ({ debugState: debugStateProp = null }) => {
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["banner", "nowPlaying"],
    queryFn: fetchBannerNowPlaying,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const bannerRef = useRef(null);
  const navigate = useNavigate();

  const [isDimmed, setIsDimmed] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [overlayStrength, setOverlayStrength] = useState(0);

  const isDevelopment = process.env.NODE_ENV === "development";

  /* =========================
     development 전용 강제 상태
     ========================= */
  const debugState =
    debugStateProp ?? (isDevelopment ? DEV_BANNER_DEBUG_STATE : null);

  // success/기본 렌더는 실제 API 배너 데이터를 그대로 사용한다.
  // image-error 디버그는 데이터는 유지하고 이미지 실패만 강제한다.
  const resolvedMovie = movie;

  const bannerStatus = useMemo(() => {
    if (debugState === "loading") return "loading";
    if (debugState === "error") return "error";
    if (debugState === "empty") return "empty";
    if (debugState === "image-error") return "success";

    if (isLoading) return "loading";
    if (isError) return "error";
    if (!movie) return "empty";

    return "success";
  }, [debugState, isLoading, isError, movie]);

  /* =========================
     상태별 패널 클래스
     - loading: 보더 + 라운딩만
     - empty: 보더 + 라운딩 + 배경
     - error: 보더 + 라운딩 + 배경 + 약한 에러 톤
     ========================= */
  const panelClassName = useMemo(() => {
    if (bannerStatus === "loading") return "banner--panel-loading";
    if (bannerStatus === "empty") return "banner--panel-empty";
    if (bannerStatus === "error") return "banner--panel-error";
    return "";
  }, [bannerStatus]);

  const goDetail = () => {
    if (!resolvedMovie?.id) return;
    const type = resolvedMovie?.media_type || "movie";
    navigate(`/detail/${type}/${resolvedMovie.id}`);
  };

  /* =========================
     정상 success 상태에서만 인터랙션 적용
     ========================= */
  useEffect(() => {
    if (bannerStatus !== "success" || !bannerRef.current) {
      setParallaxOffset(0);
      setOverlayStrength(0);
      setIsDimmed(false);
      return;
    }

    const navEl = document.querySelector(".app-nav");

    const handleScroll = () => {
      if (!bannerRef.current) return;

      const rect = bannerRef.current.getBoundingClientRect();
      const pageScroll = window.scrollY || 0;
      const isMobile = window.innerWidth <= 767;

      const nextParallaxOffset = isMobile
        ? 0
        : Math.min(Math.max(-rect.top / 10, 0), 28);

      const nextOverlayStrength = Math.min(pageScroll / 220, 1);

      setParallaxOffset(nextParallaxOffset);
      setOverlayStrength(nextOverlayStrength);

      if (navEl) {
        const navRect = navEl.getBoundingClientRect();
        const overlapPx = Math.max(0, navRect.bottom - rect.top);
        setIsDimmed(overlapPx > navRect.height);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [bannerStatus, resolvedMovie?.id]);

  /* =========================
     이미지 에러 초기화
     ========================= */
  useEffect(() => {
    setIsImageError(false);
  }, [resolvedMovie?.backdrop_path, debugState]);

  /* =========================
     success 상태에서만 배경 이미지 검사
     ========================= */
  useEffect(() => {
    if (bannerStatus !== "success") {
      setIsImageError(false);
      return;
    }

    if (debugState === "image-error") {
      setIsImageError(true);
      return;
    }

    if (!resolvedMovie?.backdrop_path) {
      setIsImageError(true);
      return;
    }

    const img = new Image();
    img.src = `https://image.tmdb.org/t/p/original/${resolvedMovie.backdrop_path}`;

    img.onload = () => setIsImageError(false);
    img.onerror = () => setIsImageError(true);
  }, [bannerStatus, resolvedMovie?.backdrop_path, debugState]);

  /* =========================
     상태 분기 렌더링
     ========================= */
  if (bannerStatus === "loading") {
    return (
      <BannerLoadingView
        bannerRef={bannerRef}
        panelClassName={panelClassName}
      />
    );
  }

  if (bannerStatus === "error") {
    return (
      <BannerErrorView
        bannerRef={bannerRef}
        panelClassName={panelClassName}
        title="배너를 불러오지 못했습니다"
        description={
          debugState === "error"
            ? "개발모드 강제 에러 상태입니다. 배너 에러 UI를 점검하세요."
            : error?.message || "네트워크 상태 또는 API 응답을 확인해주세요."
        }
      />
    );
  }

  if (bannerStatus === "empty") {
    return (
      <BannerEmptyView
        bannerRef={bannerRef}
        panelClassName={panelClassName}
        title="표시할 배너 콘텐츠가 없습니다"
        description="현재 추천할 콘텐츠를 불러오지 못했습니다."
      />
    );
  }

  return (
    <BannerContentView
      bannerRef={bannerRef}
      movie={resolvedMovie}
      isDimmed={isDimmed}
      isImageError={isImageError}
      goDetail={goDetail}
      parallaxOffset={parallaxOffset}
      overlayStrength={overlayStrength}
    />
  );
};

export default Banner;
