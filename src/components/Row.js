// Row.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";

import MovieModal from "./MovieModal";
import tmdbAxios from "../api/tmdbaxios";
import "./Row.css";

import "swiper/css";

const ARROW_ZONE = 72;
const PHONE_MAX = 960;

const Row = ({ title, id, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  const swiperRef = useRef(null);

  const [navState, setNavState] = useState({
    isBeginning: true,
    isEnd: false,
  });

  const didInitRef = useRef(false);

  /* -----------------------------
     📱 폰 레이아웃 감지
     - 960px 이하
     - 터치 기반 디바이스
  ----------------------------- */
  const [isPhoneLayout, setIsPhoneLayout] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqWidth = window.matchMedia(`(max-width: ${PHONE_MAX}px)`);
    const mqTouch = window.matchMedia("(hover: none) and (pointer: coarse)");

    const sync = () =>
      setIsPhoneLayout(mqWidth.matches && mqTouch.matches);

    sync();

    mqWidth.addEventListener?.("change", sync);
    mqTouch.addEventListener?.("change", sync);

    return () => {
      mqWidth.removeEventListener?.("change", sync);
      mqTouch.removeEventListener?.("change", sync);
    };
  }, []);

  /* -----------------------------
     fetchUrl 규격 통일
  ----------------------------- */
  const query = useMemo(() => {
    if (!fetchUrl) return null;

    if (typeof fetchUrl === "string") {
      return { path: fetchUrl };
    }

    if (typeof fetchUrl === "object") {
      const { path, ...params } = fetchUrl;
      if (!path) return null;
      return { path, ...params };
    }

    return null;
  }, [fetchUrl]);

  /* -----------------------------
     데이터 로드
  ----------------------------- */
  useEffect(() => {
    if (!query) return;

    let ignore = false;

    (async () => {
      try {
        const { path, ...params } = query;
        const cleanPath = String(path).replace(/^\/+/, "");

        const res = await tmdbAxios.get("/", {
          params: { path: cleanPath, ...params },
        });

        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : [];

        if (!ignore) setMovies(results);
      } catch (e) {
        console.error(`[Row:${id}] fetch failed`, e);
        if (!ignore) setMovies([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [query, id]);

  /* -----------------------------
     이미지 없는 데이터 제거
  ----------------------------- */
  const validMovies = useMemo(
    () => movies.filter((m) => m?.backdrop_path || m?.poster_path),
    [movies]
  );

  const handleClick = (movie) => {
    setModalOpen(true);
    setMovieSelection(movie);
  };

  const syncNav = (swiper) => {
    setNavState({
      isBeginning: swiper.isBeginning,
      isEnd: swiper.isEnd,
    });
  };

  /* -----------------------------
     Swiper 초기 동기화
  ----------------------------- */
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const rafId = requestAnimationFrame(() => {
      if (!swiper || swiper.destroyed) return;
      if (!swiper.slides || swiper.slides.length === 0) return;

      swiper.update();

      if (!didInitRef.current) {
        didInitRef.current = true;
        swiper.slideTo?.(0, 0);
      }

      syncNav(swiper);
    });

    return () => cancelAnimationFrame(rafId);
  }, [validMovies.length, id]);

  /* -----------------------------
     화살표 사용 여부
  ----------------------------- */
  const useArrows = !isPhoneLayout;
  const showLeft = useArrows && !navState.isBeginning;
  const disableRight = useArrows && navState.isEnd;

  /* -----------------------------
     Swiper 옵션
  ----------------------------- */
  const slidesPerGroup = isPhoneLayout ? 1 : 5;

  return (
    <Container id={id}>
      <Title>{title}</Title>

      <RowShell
        className="rowShell"
        data-left={showLeft ? "1" : "0"}
        data-touch={isPhoneLayout ? "1" : "0"}
      >
        {useArrows && (
          <ArrowZone
            className={`arrowZone left ${showLeft ? "" : "isHidden"}`}
            type="button"
            aria-label="Previous"
            aria-hidden={!showLeft}
            onClick={() => {
              if (!showLeft) return;
              swiperRef.current?.slidePrev();
            }}
          >
            <ArrowIcon>‹</ArrowIcon>
          </ArrowZone>
        )}

        {useArrows && (
          <ArrowZone
            className="arrowZone right"
            type="button"
            aria-label="Next"
            disabled={disableRight}
            aria-disabled={disableRight}
            onClick={() => {
              if (disableRight) return;
              swiperRef.current?.slideNext();
            }}
          >
            <ArrowIcon>›</ArrowIcon>
          </ArrowZone>
        )}

        <SwiperArea className="swiperArea">
          <Swiper
            modules={[A11y]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              syncNav(swiper);
            }}
            onSlideChange={syncNav}
            onResize={syncNav}
            watchOverflow
            loop={false}
            speed={450}
            spaceBetween={0}
            slidesPerView="auto"
            slidesPerGroup={slidesPerGroup}
            threshold={8}
          >
            {validMovies.map((movie) => {
              const imgPath =
                movie.backdrop_path || movie.poster_path;
              const altText =
                movie.title || movie.name || "movie";

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
        </SwiperArea>
      </RowShell>

      {modalOpen && (
        <MovieModal
          {...movieSelected}
          setModalOpen={setModalOpen}
        />
      )}
    </Container>
  );
};

export default Row;

/* ---------------- styled-components ---------------- */

const Container = styled.section`
  padding: 0 0 26px;
`;

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 600;

  @media (max-width: 1024px) {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 10px;
  }

  @media (max-width: 375px) {
    font-size: 17px;
  }

  @media (max-width: 340px) {
    font-size: 16px;
  }
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

  img {
    inset: 0;
    display: block;
    height: 100%;
    object-fit: cover;
    position: absolute;
    width: 100%;
  }

  &:hover {
    box-shadow: rgb(0 0 0 / 80%) 0px 40px 58px -16px,
      rgb(0 0 0 / 72%) 0px 30px 22px -10px;
    transform: scale(0.98);
    border-color: rgba(249, 249, 249, 0.8);
  }
`;

const RowShell = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
`;

const SwiperArea = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const ArrowZone = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 9;
  width: ${ARROW_ZONE}px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  cursor: pointer;
  background: transparent;
  transition: opacity 160ms ease;
  opacity: 0.9;

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }

  &.isHidden {
    opacity: 0;
    pointer-events: none;
  }

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

const ArrowIcon = styled.span`
  font-size: 34px;
  line-height: 1;
  user-select: none;
  color: rgba(255, 255, 255, 0.9);
`;
