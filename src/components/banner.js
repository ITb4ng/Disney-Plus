import tmdbAxios from "../api/tmdbaxios";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import requests from "../api/request";
import "./Banner.css";

const Banner = () => {
  const [movie, setMovie] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const bannerRef = useRef(null);
  const [isDimmed, setIsDimmed] = useState(false);
  const nowPlayingQuery = useMemo(() => {
  const spec = requests.fetchNowplaying;
  if (!spec || typeof spec !== "object" || !spec.path) return null;

  const { path, ...params } = spec;
  return { path, ...params };
  }, []);

useEffect(() => {
  if (!isClicked) return;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsClicked(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isClicked]);

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

    setMovie(movieDetail);
  } catch (err) {
    console.error("Banner fetch error:", err);
    setMovie(null);
  }
}, [nowPlayingQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const truncate = (str, n) => {
    if (!str) return "";
    return str.length > n ? str.substring(0, n) + " ... 더 보기" : str;
  };

  useEffect(() => {
  document.body.style.overflow = isClicked ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [isClicked]);



  const youtubeKey = useMemo(() => {
  const list = movie?.videos?.results ?? [];
  const trailer = list.find(v => v.site === "YouTube" && v.type === "Trailer");
  return trailer?.key || list.find(v => v.site === "YouTube")?.key;
}, [movie]);


  if (!movie) {
    return (
      <header className="banner banner--loading">
        <div className="banner__contents">
          <h1 className="banner__title">Loading...</h1>
        </div>
      </header>
    );
  }


  return (
    <>
    <header
      ref={bannerRef}
      className={`banner ${isDimmed ? "is-dimmed" : ""}`}
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

        <h2 className="banner__description">{truncate(movie.overview, 50)}</h2>
      </div>

      <div className="banner--fadeBottom" />
    </header>
     {isClicked && youtubeKey && (
  <div className="video-modal" role="dialog" aria-modal="true">
    <div
      className="video-backdrop"
      onClick={() => setIsClicked(false)}
    />

    {/* ✅ wrapper를 하나 두고 */}
    <div className="video-shell" onMouseDown={(e) => e.stopPropagation()}>
      {/* ✅ X는 video-container “바깥” */}
      <button
        className="video-close"
        onClick={() => setIsClicked(false)}
        aria-label="close"
      >
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
