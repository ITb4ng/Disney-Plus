import axios from "../api/axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MovieModal from "./MovieModal";
import "./Row.css";

import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import styled from "styled-components";

const Row = ({ title, id, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});

  const { path, params } = useMemo(() => {
    if (!fetchUrl || typeof fetchUrl !== "object") return { path: "", params: {} };

    const rawPath = fetchUrl.path || "";
    const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

    const { path: _p, ...rest } = fetchUrl; // path 제외 나머지는 params
    return { path: normalizedPath, params: rest };
  }, [fetchUrl]);

  const fetchMovieData = useCallback(async () => {
  if (!path) {
    setMovies([]);
    return;
  }

  try {
    const res = await axios.get(path, {
      params: {
        ...params,
        api_key: process.env.REACT_APP_TMDB_API_KEY,
        language: "ko-KR",
      },
    });

    const results = Array.isArray(res.data?.results) ? res.data.results : [];
    setMovies(results);
  } catch (err) {
    setMovies([]);
  }
}, [path, params]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  const handleClick = (movie) => {
    setModalOpen(true);
    setMovieSelection(movie);
  };

  return (
    <Container id={id}>
      <h2>{title}</h2>

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        loop
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          1378: { slidesPerView: 6, slidesPerGroup: 6 },
          998: { slidesPerView: 5, slidesPerGroup: 5 },
          625: { slidesPerView: 4, slidesPerGroup: 4 },
          0: { slidesPerView: 3, slidesPerGroup: 3 },
        }}
      >

        {movies.map((movie) => {
          const imgPath = movie.backdrop_path || movie.poster_path;
          if (!imgPath) return null;

          const altText = movie.title || movie.name || "movie";

          return (
            <SwiperSlide key={movie.id}>
              <Wrap>
                <img
                  src={`https://image.tmdb.org/t/p/original${imgPath}`}
                  alt={altText}
                  onClick={() => handleClick(movie)}
                  loading="lazy"
                />
                
              </Wrap>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {modalOpen && <MovieModal {...movieSelected} setModalOpen={setModalOpen} />}
    </Container>
  );
};

export default Row;

const Container = styled.section`
  padding: 0 0 26px;
`;

const Wrap = styled.div`
  width: 95%;
  height: 95%;
  padding-top: 56.25%;
  border-radius: 10px;
  box-shadow: rgb(0 0 0/69%) 0px 26px 30px -10px,
    rgb(0 0 0/73%) 0px 16px 10px -10px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
  border: 3px solid rgba(249, 249, 249, 0.1);
  z-index: 9999;

  img {
    inset: 0px;
    display: block;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    position: absolute;
    width: 100%;
    transition: opacity 500ms ease-in-out;
    z-index: 1;
  }

  &:hover {
    box-shadow: rgb(0 0 0 / 80%) 0px 40px 58px -16px,
      rgb(0 0 0 / 72%) 0px 30px 22px -10px;
    transform: scale(0.98);
    border-color: rgba(249, 249, 249, 0.8);
  }
`;
