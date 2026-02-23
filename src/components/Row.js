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

// ✅ 스켈레톤 카드 개수 (취향)
const SKELETON_COUNT = 10;

const Row = ({ title, id, fetchUrl, showRank = false }) => {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  const swiperRef = useRef(null);

  // ✅ 스켈레톤용 상태
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

    const sync = () => setIsPhoneLayout(mqWidth.matches && mqTouch.matches);

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
      setIsLoading(true);
      setHasError(false);

      try {
        const { path, ...params } = query;
        const cleanPath = String(path).replace(/^\/+/, "");

        const res = await tmdbAxios.get("/", {
          params: { path: cleanPath, ...params },
        });

        const results = Array.isArray(res.data?.results) ? res.data.results : [];
        if (!ignore) setMovies(results);
      } catch (e) {
        console.error(`[Row:${id}] fetch failed`, e);
        if (!ignore) {
          setHasError(true);
          setMovies([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
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

      swiper.update();

      if (!didInitRef.current) {
        didInitRef.current = true;
        swiper.slideTo?.(0, 0);
      }

      syncNav(swiper);
    });

    return () => cancelAnimationFrame(rafId);
  }, [validMovies.length, id, isLoading]);

  /* -----------------------------
     화살표 사용 여부
  ----------------------------- */
  const useArrows = !isPhoneLayout;
  const showLeft = useArrows && !navState.isBeginning;
  const disableRight = useArrows && navState.isEnd;

  /* -----------------------------
     스켈레톤 데이터
  ----------------------------- */
  const skeletonSlides = useMemo(
    () =>
      Array.from({ length: SKELETON_COUNT }, (_, i) => ({
        _sk: true,
        id: `sk-${id}-${i}`,
      })),
    [id]
  );

  const renderList = isLoading ? skeletonSlides : validMovies;

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
            speed={900}
            spaceBetween={10}
            slidesPerView="auto"
            slidesPerGroupAuto={true}
            threshold={10}
          >
            {renderList.map((movie, index) => {
              // ✅ 스켈레톤 슬라이드
              if (movie?._sk) {
                return (
                  <SwiperSlide key={movie.id}>
                    <Wrap className="skWrap" aria-hidden="true">
                      <div className="skCard" />
                    </Wrap>
                  </SwiperSlide>
                );
              }

              // ✅ 정상 슬라이드
              const imgPath = movie.backdrop_path || movie.poster_path;
              const altText = movie.title || movie.name || "movie";
              const rank = index + 1;

              return (
                <SwiperSlide key={movie.id}>
                  <Wrap>
                    {/* ✅ Top Rated 등에서만 랭킹 표시 */}
                   {showRank && (
                      <span className="rank--outline rank--tl rank--main">{rank}</span>
                    )}

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

          {/* ✅ 에러 메시지 */}
          {!isLoading && hasError && <RowHint role="status">Failed to load</RowHint>}

          {/* ✅ 데이터는 로딩 끝났는데 비어있으면 */}
          {!isLoading && !hasError && validMovies.length === 0 && (
            <RowHint role="status">No items</RowHint>
          )}
        </SwiperArea>
      </RowShell>

      {modalOpen && <MovieModal {...movieSelected} setModalOpen={setModalOpen} />}
    </Container>
  );
};

export default Row;

/* ===========================
   styled-components (기존 유지)
=========================== */

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
  padding-top: 56.25%;

  border-radius: 8px;
  box-shadow: rgb(0 0 0/69%) 0px 26px 30px -10px,
    rgb(0 0 0/73%) 0px 16px 10px -10px;

  cursor: pointer;

  overflow: hidden;

  position: relative;
  transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;

  border: 3px solid rgba(249, 249, 249, 0.1);
  box-sizing: border-box;

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

  &.skWrap {
    cursor: default;
    border-color: rgba(249, 249, 249, 0.08);
    &:hover {
      transform: none;
      box-shadow: rgb(0 0 0/69%) 0px 26px 30px -10px,
        rgb(0 0 0/73%) 0px 16px 10px -10px;
      border-color: rgba(249, 249, 249, 0.08);
    }
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
  position: relative;
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

// ✅ 에러/빈상태 힌트 (아주 작게)
const RowHint = styled.div`
  position: absolute;
  left: 12px;
  bottom: 10px;
  font-size: 12px;
  opacity: 0.75;
  pointer-events: none;
`;
