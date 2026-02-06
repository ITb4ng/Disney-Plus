import axios from "../api/axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import requests from "../api/request";
import { styled } from "styled-components";
import "./Banner.css";

const Banner = () => {
  const [movie, setMovie] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

  // ✅ requests 스펙 객체 → path + params 분리
  const { path: nowPlayingPath, params: nowPlayingParams } = useMemo(() => {
    const spec = requests.fetchNowplaying;

    if (!spec || typeof spec !== "object" || !spec.path) {
      return { path: "", params: {} };
    }

    const rawPath = spec.path;
    const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

    const { path: _p, ...rest } = spec;
    return { path: normalizedPath, params: rest };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // 1) 현재 상영작 리스트
      const response = await axios.get(nowPlayingPath, { params: nowPlayingParams });
      const results = Array.isArray(response.data?.results) ? response.data.results : [];

      if (results.length === 0) {
        setMovie(null);
        return;
      }

      // 랜덤 영화 선택
      const picked = results[Math.floor(Math.random() * results.length)];
      const movieId = picked?.id;

      if (!movieId) {
        setMovie(null);
        return;
      }

      // 2) 영화 상세 + 영상
      const { data: movieDetail } = await axios.get(`/movie/${movieId}`, {
        params: { append_to_response: "videos" },
      });

      setMovie(movieDetail);
    } catch (err) {
      setMovie(null);
    }
  }, [nowPlayingPath, nowPlayingParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const truncate = (str, n) => {
    if (!str) return "";
    return str.length > n ? str.substring(0, n) + " ... 더 보기" : str;
  };

  const youtubeKey = movie?.videos?.results?.[0]?.key;

  if (!movie) {
    return (
      <header className="banner banner--loading">
        <div className="banner__contents">
          <h1 className="banner__title">Loading...</h1>
        </div>
        <div className="banner--fadeBottom" />
      </header>
    );
  }

  if (isClicked && youtubeKey) {
    return (
      <>
        <Container>
          <HomeContainer>
            <Iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?controls=0&autoplay=1&loop=1&mute=1&playlist=${youtubeKey}`}
              title="Trailer"
              allow="autoplay; fullscreen"
            />
          </HomeContainer>
        </Container>
        <button className="closePopup" onClick={() => setIsClicked(false)}>
          닫기
        </button>
      </>
    );
  }

  return (
    <header
      className="banner"
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
  );
};

export default Banner;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`;

const HomeContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.65;
  border: none;
`;
