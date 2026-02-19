import tmdbAxios from "../api/tmdbaxios";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import requests from "../api/request";
import "./Banner.css";

const Banner = () => {
  const [movie, setMovie] = useState(null);

  // ✅ Skeleton / error state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [isClicked, setIsClicked] = useState(false);
  const bannerRef = useRef(null);
  const [isDimmed, setIsDimmed] = useState(false);

  const navigate = useNavigate();
  const hasOverview = Boolean(movie?.overview && movie.overview.trim().length > 0);

  const nowPlayingQuery = useMemo(() => {
    const spec = requests.fetchNowplaying;
    if (!spec || typeof spec !== "object" || !spec.path) return null;

    const { path, ...params } = spec;
    return { path, ...params };
  }, []);

  const goDetail = () => {
  if (!movie?.id) return;
  const type = movie?.media_type || "movie";
  navigate(`/detail/${type}/${movie.id}`);
  };

  // ESC로 모달 닫기
  useEffect(() => {
    if (!isClicked) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsClicked(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClicked]);

  // 스크롤 시 nav가 banner를 덮는 정도에 따라 dim 처리
  useEffect(() => {
    if (!bannerRef.current) return;

    const navEl = document.querySelector(".app-nav");
    if (!navEl) return;

    const onScroll = () => {
      const navRect = navEl.getBoundingClientRect();
      const bRect = bannerRef.current.getBoundingClientRect();

      const overlapPx = Math.max(0, navRect.bottom - bRect.top);
      setIsDimmed(overlapPx > navRect.height);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [movie?.id]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      if (!nowPlayingQuery) {
        setMovie(null);
        return;
      }

      // 1) 현재 상영작 리스트 (프록시 규격)
      const response = await tmdbAxios.get("", { params: nowPlayingQuery });
      const results = Array.isArray(response.data?.results) ? response.data.results : [];

      if (results.length === 0) {
        setMovie(null);
        return;
      }

      const picked = results[Math.floor(Math.random() * results.length)];
      const movieId = picked?.id;

      if (!movieId) {
        setMovie(null);
        return;
      }

      // 2) 영화 상세 + 영상 (프록시 규격)
      const { data: movieDetail } = await tmdbAxios.get("", {
        params: { path: `movie/${movieId}`, append_to_response: "videos", language: "ko-KR" },
      });

      // picked에 media_type가 있으면 섞어두면 라우팅에도 도움됨
      setMovie({ ...movieDetail, media_type: picked?.media_type ?? movieDetail?.media_type });
    } catch (err) {
      console.error("Banner fetch error:", err);
      setHasError(true);
      setMovie(null);
    } finally {
      setIsLoading(false);
    }
  }, [nowPlayingQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // 모달 열리면 스크롤 락
  useEffect(() => {
    document.body.style.overflow = isClicked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isClicked]);

  const youtubeKey = useMemo(() => {
    const list = movie?.videos?.results ?? [];
    const trailer = list.find((v) => v.site === "YouTube" && v.type === "Trailer");
    return trailer?.key || list.find((v) => v.site === "YouTube")?.key;
  }, [movie]);

  // ✅ 1) Loading Skeleton
  if (isLoading) {
    return (
      <header ref={bannerRef} className="banner banner--skeleton">
        <div className="banner__contents">
          <div className="sk sk-title" />
          <div className="banner__buttons">
            <div className="sk sk-btn" />
          </div>
          <div className="sk sk-desc" />
          <div className="sk sk-desc short" />
        </div>
        <div className="banner--fadeBottom" />
      </header>
    );
  }

  // ✅ 2) Error / Empty fallback
  if (!movie) {
    return (
      <header ref={bannerRef} className="banner banner--loading">
        <div className="banner__contents">
          <h1 className="banner__title">{hasError ? "Failed to load" : "No data"}</h1>
        </div>
        <div className="banner--fadeBottom" />
      </header>
    );
  }

  // ✅ 3) Normal banner
  return (
    <>
      <header
        ref={bannerRef}
        className={`banner ${isDimmed ? "is-dimmed" : ""} 
        ${
          !hasOverview ? "no-overview" : ""
        }`}
        style={{
          backgroundImage: movie?.backdrop_path
            ? `url("https://image.tmdb.org/t/p/original/${movie.backdrop_path}")`
            : "none",
          backgroundPosition: "top center",
          backgroundSize: "cover",
        }}
      >
        <div className="banner__contents">
          <h1 className="banner__title">{movie.title || movie.name || movie.original_name}</h1>

          <div className="banner__buttons">
            {youtubeKey && (
              <button className="banner__button play" onClick={() => setIsClicked(true)}>
                play
              </button>
            )}
          </div>

        {hasOverview ? (
          <h2 className="banner__description">
            <span className="banner__descText">{movie.overview}</span>

            <span
              className="banner__more"
              role="button"
              tabIndex={0}
              onClick={goDetail}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goDetail();
              }}
              aria-label="더보기: 상세 페이지로 이동"
            >
              더보기
            </span>
          </h2>
        ) : (
          <div className="banner__descriptionFallback">
            <span
              className="banner__detailLink"
              role="button"
              tabIndex={0}
              onClick={goDetail}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goDetail();
              }}
              aria-label="자세히 보기: 상세 페이지로 이동"
            >
              자세히 보기
            </span>
          </div>
        )}
        </div>

        <div className="banner--fadeBottom" />
      </header>

      {isClicked && youtubeKey && (
        <div className="video-modal" role="dialog" aria-modal="true">
          <div className="video-backdrop" onClick={() => setIsClicked(false)} />

          <div className="video-shell" onMouseDown={(e) => e.stopPropagation()}>
            <button className="video-close" onClick={() => setIsClicked(false)} aria-label="close">
              ✕
            </button>

            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&mute=1&controls=1`}
                title="Trailer"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;
