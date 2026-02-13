// Row.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";

import MovieModal from "./MovieModal";
import tmdbAxios from "../api/tmdbaxios";
import "./Row.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const ARROW_ZONE = 72;

const Row = ({ title, id, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  const swiperRef = useRef(null);

  // ✅ nav 상태: 처음/끝 체크
  const [navState, setNavState] = useState({ isBeginning: true, isEnd: false });

  // ✅ 초기 1회 정렬용
  const didInitRef = useRef(false);

  // ✅ fetchUrl 규격 통일
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

  // ✅ 데이터 로드
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

        const results = Array.isArray(res.data?.results) ? res.data.results : [];
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

  // ✅ 이미지 없는 건 제외 (loop 안 쓰는 대신 최소한 안정)
  const validMovies = useMemo(
    () => movies.filter((m) => m?.backdrop_path || m?.poster_path),
    [movies]
  );

  const handleClick = (movie) => {
    setModalOpen(true);
    setMovieSelection(movie);
  };

  // ✅ Swiper 상태 동기화(공용)
  const syncNav = (swiper) => {
    setNavState({ isBeginning: swiper.isBeginning, isEnd: swiper.isEnd });
  };

  // ✅ 데이터 로딩 완료 시: update + (초기 1회만) 0번 정렬
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    let rafId = requestAnimationFrame(() => {
      if (!swiper || swiper.destroyed) return;
      if (!swiper.el) return;
      if (!swiper.slides || swiper.slides.length === 0) return;

      try {
        swiper.update();
        swiper.navigation?.update?.();
        // ✅ loop=false라서 slideTo만 사용 (초기 1회만)
        if (!didInitRef.current) {
          didInitRef.current = true;
          swiper.slideTo?.(0, 0);
        }
        syncNav(swiper);
      } catch (e) {
        console.debug(`[Row:${id}] swiper post-update skipped`, e);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [validMovies.length, id]);

  // ✅ 좌측 화살표는 "처음엔 숨김" (공홈 느낌)
  const showLeft = !navState.isBeginning;
  // ✅ 우측은 끝이면 비활성
  const disableRight = navState.isEnd;

  return (
    <Container id={id}>
      <Title>{title}</Title>

      <RowShell className="rowShell" data-left={showLeft ? "1" : "0"}>
        {/* 좌 히트존 (처음엔 숨김: 공간 차지 X, overlay만) */}
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
          <ArrowIcon className="icon">‹</ArrowIcon>
        </ArrowZone>

        {/* 우 히트존 */}
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
          <ArrowIcon className="icon">›</ArrowIcon>
        </ArrowZone>

        {/* 스크롤/카드 영역
            ✅ 왼쪽 화살표가 안 보일 때는 padding-left 0으로 "딱 붙게"
            ✅ 오른쪽은 항상 화살표가 있으니 padding-right는 유지 (취향)
        */}
        <SwiperArea className="swiperArea"
        
        >
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              // mount 시 nav 동기화
              syncNav(swiper);
            }}
            onSlideChange={syncNav}
            onResize={syncNav}
            onReachBeginning={syncNav}
            onReachEnd={syncNav}
            navigation={false}
            pagination={false}
            watchOverflow
            loop={false}
            speed={450}
            spaceBetween={12}
            slidesPerView="auto"
            slidesPerGroup={2}
            slidesOffsetBefore={0}
            slidesOffsetAfter={0}
            threshold={8}
            preventClicks
            preventClicksPropagation
          >
            {validMovies.map((movie) => {
              const imgPath = movie.backdrop_path || movie.poster_path;
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
        </SwiperArea>
      </RowShell>

      {modalOpen && (
        <MovieModal {...movieSelected} setModalOpen={setModalOpen} />
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

/* 좌우 히트존 (overlay, 레이아웃 공간 차지 X) */
const ArrowZone = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 9;
  width: ${ARROW_ZONE}px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  cursor: pointer;

  transition: background 160ms ease, opacity 160ms ease, transform 160ms ease;
  opacity: 0.9;

  &.left {
    left: 0;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.45),
      rgba(0, 0, 0, 0)
    );
  }

  &.right {
    right: 0;
    background: linear-gradient(
      to left,
      rgba(0, 0, 0, 0.45),
      rgba(0, 0, 0, 0)
    );
  }

  &:hover {
    opacity: 1;
  }

  /* ✅ 처음엔 left 버튼 숨김: 공간 안 먹고, 클릭도 막음 */
  &.isHidden {
    opacity: 0;
    pointer-events: none;
    transform: translateX(-6px);
  }

  &:disabled {
    cursor: default;
    opacity: 0.25;
  }

  &:disabled:hover {
    opacity: 0.25;
  }

  @media (max-width: 768px) {
    display: none;
  }
  @media (max-width: 1024px) {
    --arrow-zone: 52px;
  } 
`;

const ArrowIcon = styled.span`
  font-size: 34px;
  line-height: 1;
  user-select: none;

  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
`;
