// Row.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import MovieModal from "./MovieModal";
import tmdbAxios from "../api/tmdbaxios";
import "./Row.css";
import "swiper/css";

const ARROW_ZONE = 72;
const PHONE_MAX = 960;

// ✅ 스켈레톤 카드 개수 (취향)
const SKELETON_COUNT = 10;

// ✅ Row 결과 캐시 (리마운트/스크롤 왕복 방어)
const ROW_CACHE = new Map();

const Row = ({
  title,
  id,
  fetchUrl,
  showRank = false,
  mode = "modal",
  navType,
  onNavigate,
  onLoaded,
  query: queryProp,
}) => {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  // ✅ 스켈레톤용 상태 (초기: query가 있으면 true)
  const [isLoading, setIsLoading] = useState(Boolean(queryProp ?? fetchUrl));
  const [hasError, setHasError] = useState(false);

  const [navState, setNavState] = useState({
    isBeginning: true,
    isEnd: false,
  });

  const didInitRef = useRef(false);

  /* -----------------------------
     📱 폰 레이아웃 감지
     - 960px 이하 + 터치 디바이스
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
     query 규격 통일
     - queryProp 우선
     - fetchUrl fallback
     - path=[object Object] 방지
  ----------------------------- */
  const queryObj = useMemo(() => {
    const src = queryProp ?? fetchUrl;
    if (!src) return null;

    if (typeof src === "string") return { path: src };

    if (typeof src === "object") {
      const { path, params, ...rest } = src;

      const normalizedPath =
        typeof path === "string"
          ? path
          : path && typeof path === "object" && typeof path.path === "string"
          ? path.path
          : "";

      if (!normalizedPath) return null;

      return {
        path: normalizedPath,
        ...(params && typeof params === "object" ? params : {}),
        ...rest,
      };
    }

    return null;
  }, [queryProp, fetchUrl]);

  // ✅ 캐시 키 (queryProp/fetchUrl 기준)
  const queryKey = useMemo(() => {
    const src = queryProp ?? fetchUrl;
    return typeof src === "string" ? src : JSON.stringify(src ?? {});
  }, [queryProp, fetchUrl]);

  /* -----------------------------
     데이터 로드
     ✅ 캐시 hit: 즉시 복원(스켈레톤 재등장 방지)
     ✅ 성공 시 캐시 저장(네 코드에 없던 핵심)
  ----------------------------- */
  useEffect(() => {
    // ✅ query 없으면 로딩 끝
    if (!queryObj) {
      setIsLoading(false);
      setHasError(false);
      setMovies([]);
      onLoaded?.(0);
      return;
    }

    // ✅ 캐시 hit면 네트워크/스켈레톤 없이 복원
    const cached = ROW_CACHE.get(queryKey);
    if (cached?.movies) {
      setMovies(cached.movies);
      setIsLoading(false);
      setHasError(false);
      onLoaded?.(cached.movies.length);
      return;
    }

    let ignore = false;

    (async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const { path, ...params } = queryObj;

        if (typeof path !== "string") {
          throw new Error(`[Row:${id}] invalid path: ${String(path)}`);
        }

        const cleanPath = path.replace(/^\/+/, "");

        const res = await tmdbAxios.get("", {
          params: { path: cleanPath, ...params },
        });

        const results = Array.isArray(res.data?.results) ? res.data.results : [];

        if (!ignore) {
          setMovies(results);
          onLoaded?.(results.length);

          // ✅ 중요: 캐시에 저장해서 리마운트/스크롤 왕복 시 스켈레톤 재등장 방지
          ROW_CACHE.set(queryKey, { movies: results, ts: Date.now() });
        }
      } catch (e) {
        console.error(`[Row:${id}] fetch failed`, e);
        if (!ignore) {
          setHasError(true);
          setMovies([]);
          onLoaded?.(0);

          // (선택) 실패도 캐시할지 말지 취향
          // ROW_CACHE.set(queryKey, { movies: [], ts: Date.now() });
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [queryObj, queryKey, id, onLoaded]);

  /* -----------------------------
     이미지 없는 데이터 제거
  ----------------------------- */
  const validMovies = useMemo(
    () => movies.filter((m) => m?.backdrop_path || m?.poster_path),
    [movies]
  );

  const handleClick = (movie) => {
    if (mode === "navigate") {
      if (typeof onNavigate === "function") {
        onNavigate(movie);
        return;
      }
      const typeGuess = navType || movie?.media_type || "movie";
      navigate(`/detail/${typeGuess}/${movie.id}`, { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
     - 데이터 들어왔을 때 업데이트
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
     스켈레톤 리스트
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

              const titleText =
                movie?.title ||
                movie?.name ||
                movie?.original_title ||
                movie?.original_name ||
                "제목 없음";

              const dateText = movie?.release_date || movie?.first_air_date || "";
              const yearText = dateText ? dateText.slice(0, 4) : "";

              const imgPath = movie.backdrop_path || movie.poster_path;
              const altText = movie.title || movie.name || "movie";
              const rank = index + 1;

              return (
                <SwiperSlide key={movie.id}>
                  <Wrap onClick={() => handleClick(movie)} role="button" tabIndex={0}>
                    {/* ✅ Top Rated 등에서만 랭킹 표시 */}
                    {showRank && (
                      <span className="rank--outline rank--tl rank--main">{rank}</span>
                    )}

                    <img
                      src={`https://image.tmdb.org/t/p/original${imgPath}`}
                      alt={altText}
                      loading="lazy"
                    />

                    {/* ✅ Hover Overlay (텍스트만) */}
                    <div className="row__hoverOverlay" aria-hidden="true">
                      <div className="row__hoverOverlayInner">
                        <div className="row__hoverTitle">{titleText}</div>
                        {!!yearText && <div className="row__hoverMeta">{yearText}</div>}
                      </div>
                    </div>
                  </Wrap>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* ✅ 에러 메시지 */}
          {!isLoading && hasError && <RowHint role="status">Failed to load</RowHint>}

          {/* ✅ 데이터 로딩 끝났는데 비어있으면 */}
          {!isLoading && !hasError && validMovies.length === 0 && (
            <RowHint role="status">No items</RowHint>
          )}
        </SwiperArea>
      </RowShell>

      {/* ✅ Modal */}
      {mode !== "navigate" && modalOpen && (
        <MovieModal {...movieSelected} setModalOpen={setModalOpen} />
      )}
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