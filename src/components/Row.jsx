import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiRefreshCw,
  FiInbox,
} from "react-icons/fi";
import MovieModal from "./MovieModal";
import tmdbAxios from "../api/tmdbaxios";
import { useAuth } from "../contexts/AuthContext";
import "./Row.css";
import "swiper/css";

const ARROW_ZONE = 72;
const SKELETON_COUNT = 10;
const ERROR_FALLBACK_COUNT = 6;
const IMG_BASE = "https://image.tmdb.org/t/p/original";
const ROW_SWIPE_KEY = "row:swipe:v1";
const DEBUG_BROKEN_IMAGE_SRC = "/__debug__/force-image-error.jpg";

// 공용 데이터 상태 캐시
const ROW_CACHE = new Map();

function loadSwipeMap() {
  try {
    return JSON.parse(sessionStorage.getItem(ROW_SWIPE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSwipeMap(map) {
  sessionStorage.setItem(ROW_SWIPE_KEY, JSON.stringify(map));
}

function normalizeSwipeState(raw) {
  if (typeof raw === "number") {
    return { activeIndex: raw, translate: null, progress: null };
  }

  if (raw && typeof raw === "object") {
    return {
      activeIndex: Number.isFinite(Number(raw.activeIndex))
        ? Number(raw.activeIndex)
        : 0,
      translate: Number.isFinite(Number(raw.translate))
        ? Number(raw.translate)
        : null,
      progress: Number.isFinite(Number(raw.progress))
        ? Number(raw.progress)
        : null,
    };
  }

  return { activeIndex: 0, translate: null, progress: null };
}

/**
 * 카드 미디어 영역
 * - no-image: 이미지 경로 자ccb4가 없음
 * - cdn-fail: 이미지를 숨기고 fallback UI만 표시
 * - image-error: 존재하지 않는 이미지 경로를 넣어 onError를 강제로 발생시킴
 */
function CardMedia({
  imgPath,
  altText,
  titleText,
  yearText,
  isTop10,
  showOverlay,
  forceFailImage = false,
  debugState,
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imgPath, forceFailImage, debugState]);

  const isSuccessState = !debugState || debugState === "success";

  const shouldForceImageError =
    debugState === "image-error" && Boolean(imgPath) && !forceFailImage;

  const imageSrc = shouldForceImageError
    ? DEBUG_BROKEN_IMAGE_SRC
    : `${IMG_BASE}${imgPath}`;

  const hasImage = Boolean(imgPath) && !imgError && !forceFailImage;
  const showFallbackBadge = isSuccessState;
  const showCenteredReadyLabel = isTop10 && forceFailImage;

  return (
    <>
      {hasImage ? (
        <img
          src={imageSrc}
          alt={altText}
          loading="lazy"
          onError={() => {
            setImgError(true);
          }}
        />
      ) : (
        <FallbackMedia $isTop10={isTop10}>
          {showCenteredReadyLabel && (
            <CenteredFallbackLabel>이미지를 준비 중입니다</CenteredFallbackLabel>
          )}
          <FallbackInner>
            {showFallbackBadge && <FallbackBadge>이미지 준비 중</FallbackBadge>}
            <FallbackTitle>{titleText || "제목을 불러오지 못했습니다"}</FallbackTitle>
            {!!yearText && <FallbackMeta>{yearText}</FallbackMeta>}
          </FallbackInner>
        </FallbackMedia>
      )}

      {showOverlay && hasImage && (
        <div className="row__hoverOverlay" aria-hidden="true">
          <div className="row__hoverOverlayInner">
            <div className="row__hoverTitle">{titleText}</div>
            {!!yearText && <div className="row__hoverMeta">{yearText}</div>}
          </div>
        </div>
      )}
    </>
  );
}

function DefaultRowErrorState() {
  return (
    <DefaultStateWrap>
      <DefaultStateBox role="alert" aria-live="polite">
        <DefaultStateIcon>
          <FiAlertCircle />
        </DefaultStateIcon>
        <DefaultStateText>
          <DefaultStateTitle>콘텐츠를 불러오지 못했습니다.</DefaultStateTitle>
          <DefaultStateDesc>
            잠시 후 다시 시도해 주세요. 문제가 계속되면 페이지를 새로고침해 주세요.
          </DefaultStateDesc>
        </DefaultStateText>
        <DefaultStateRetry type="button" onClick={() => window.location.reload()}>
          <FiRefreshCw />
          <span>새로고침</span>
        </DefaultStateRetry>
      </DefaultStateBox>
    </DefaultStateWrap>
  );
}

function DefaultRowEmptyState() {
  return (
    <DefaultStateWrap>
      <DefaultStateBox aria-live="polite">
        <DefaultStateIcon>
          <FiInbox />
        </DefaultStateIcon>
        <DefaultStateText>
          <DefaultStateTitle>표시할 콘텐츠가 없습니다.</DefaultStateTitle>
          <DefaultStateDesc>
            다른 카테고리를 선택하거나 잠시 후 다시 시도해 주세요.
          </DefaultStateDesc>
        </DefaultStateText>
      </DefaultStateBox>
    </DefaultStateWrap>
  );
}

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

  // 기본 Row / Top10 공통 props
  variant = "default", // "default" | "top10"
  limit,
  disableOverlay = false,
  useExternalNav = false,
  onSwiperReady,
  onNavStateChange,
  emptyMessage = "표시할 콘텐츠가 없습니다.",
  errorMessage = "콘텐츠를 불러오는 중 오류가 발생했습니다.",

  // "loading" | "error" | "empty" | "no-image" | "image-error" | "cdn-fail"
  debugState,
}) => {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelection] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const navActionType = useNavigationType();
  const { userData } = useAuth();
  const swiperRef = useRef(null);

  const [isLoading, setIsLoading] = useState(Boolean(queryProp ?? fetchUrl));
  const [hasError, setHasError] = useState(false);

  const [navState, setNavState] = useState({
    isBeginning: true,
    isEnd: false,
  });

  const navStateRef = useRef({
    isBeginning: true,
    isEnd: false,
  });

  const isTop10 = variant === "top10";
  const isLoggedIn = Boolean(userData);
  const sourcePath = location.pathname || "/";
  const sourceTag = isTop10 ? "top10" : "row";

  const rowRouteKey = useMemo(
    () => `${location.pathname || "/"}${location.search || ""}`,
    [location.pathname, location.search]
  );

  const swipeStoreKey = useMemo(() => `${rowRouteKey}::${id}`, [rowRouteKey, id]);

  const isReloadEntry = useMemo(() => {
    try {
      const nav = performance.getEntriesByType("navigation")?.[0];
      return nav?.type === "reload";
    } catch {
      return false;
    }
  }, []);

  const isDetailRoute = location.pathname.startsWith("/detail/");

  const hasRestoreEntry = isDetailRoute
    ? isReloadEntry
    : location.state?.restoreScroll === true ||
      navActionType === "POP" ||
      isReloadEntry;

  const restoreSwipeState = useMemo(() => {
    if (!hasRestoreEntry) return normalizeSwipeState(0);
    const map = loadSwipeMap();
    return normalizeSwipeState(map[swipeStoreKey]);
  }, [hasRestoreEntry, swipeStoreKey]);

  const shouldRestoreSwipe =
    hasRestoreEntry &&
    (restoreSwipeState.activeIndex > 0 ||
      (Number.isFinite(restoreSwipeState.translate) &&
        Math.abs(Number(restoreSwipeState.translate)) > 2) ||
      (Number.isFinite(restoreSwipeState.progress) &&
        Number(restoreSwipeState.progress) > 0.01));

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqTouch = window.matchMedia("(hover: none) and (pointer: coarse)");
    const mqAnyCoarse = window.matchMedia("(any-pointer: coarse)");

    const sync = () => {
      const hasTouchPoints =
        Number(
          window.navigator?.maxTouchPoints || window.navigator?.msMaxTouchPoints || 0
        ) > 0;

      const touchCapable = hasTouchPoints || mqTouch.matches || mqAnyCoarse.matches;
      setIsTouchDevice(touchCapable);
    };

    sync();
    mqTouch.addEventListener?.("change", sync);
    mqAnyCoarse.addEventListener?.("change", sync);

    return () => {
      mqTouch.removeEventListener?.("change", sync);
      mqAnyCoarse.removeEventListener?.("change", sync);
    };
  }, []);

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

  const queryKey = useMemo(() => {
    const src = queryProp ?? fetchUrl;
    return typeof src === "string" ? src : JSON.stringify(src ?? {});
  }, [queryProp, fetchUrl]);

  useEffect(() => {
    if (debugState === "loading") {
      setIsLoading(true);
      setHasError(false);
      setMovies([]);
      return;
    }

    if (debugState === "error") {
      setIsLoading(false);
      setHasError(true);
      setMovies([]);
      onLoaded?.(0);
      return;
    }

    if (debugState === "empty") {
      setIsLoading(false);
      setHasError(false);
      setMovies([]);
      onLoaded?.(0);
      return;
    }

    if (!queryObj) {
      setIsLoading(false);
      setHasError(false);
      setMovies([]);
      onLoaded?.(0);
      return;
    }

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
          ROW_CACHE.set(queryKey, { movies: results, ts: Date.now() });
        }
      } catch (e) {
        console.error(`[Row:${id}] fetch failed`, e);

        if (!ignore) {
          setHasError(true);
          setMovies([]);
          onLoaded?.(0);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [queryObj, queryKey, id, onLoaded, debugState]);

  const normalizedMovies = useMemo(() => {
    const sourceMovies = movies.map((movie) => ({
      ...movie,
      _titleText:
        movie?.title ||
        movie?.name ||
        movie?.original_title ||
        movie?.original_name ||
        "제목 없는 콘텐츠",
      _dateText: movie?.release_date || movie?.first_air_date || "",
      _yearText: (movie?.release_date || movie?.first_air_date || "").slice(0, 4),
      _imgPath: movie?.backdrop_path || movie?.poster_path || "",
      _altText: movie?.title || movie?.name || "movie",
    }));

    if (debugState === "no-image") {
      return sourceMovies.length
        ? sourceMovies.map((movie) => ({
            ...movie,
            _imgPath: "",
          }))
        : Array.from({ length: isTop10 ? 10 : 6 }, (_, idx) => ({
            id: `no-image-${id}-${idx}`,
            _titleText: `이미지 없음 콘텐츠 ${idx + 1}`,
            _yearText: "2025",
            _imgPath: "",
            _altText: "fallback movie",
            media_type: "movie",
          }));
    }

    return sourceMovies;
  }, [movies, debugState, id, isTop10]);

  const limitedMovies = useMemo(() => {
    if (typeof limit === "number") {
      return normalizedMovies.slice(0, limit);
    }
    return normalizedMovies;
  }, [normalizedMovies, limit]);

  const errorFallbackSlides = useMemo(
    () =>
      Array.from(
        { length: isTop10 ? Math.min(limit || 10, 5) : ERROR_FALLBACK_COUNT },
        (_, i) => ({
          id: `fb-${id}-${i}`,
          _fb: true,
          _titleText: "이미지를 불러올 수 없는 콘텐츠",
          _yearText: "",
        })
      ),
    [id, isTop10, limit]
  );

  const handleClick = (movie) => {
    if (movie?._fb || movie?._sk) return;

    if (swiperRef.current && !swiperRef.current.destroyed) {
      syncNav(swiperRef.current);
    }

    if (mode === "navigate") {
      if (typeof onNavigate === "function") {
        onNavigate(movie);
        return;
      }

      const typeGuess = navType || movie?.media_type || "movie";

      navigate(`/detail/${typeGuess}/${movie.id}`, {
        replace: true,
        state: {
          from: location.pathname + location.search,
          scrollY: window.scrollY || 0,
        },
      });
      return;
    }

    const shouldHideModalImage =
      debugState === "no-image" || debugState === "cdn-fail";

    setModalOpen(true);
    setMovieSelection({
      ...movie,
      backdrop_path: shouldHideModalImage ? null : movie?.backdrop_path,
      poster_path: shouldHideModalImage ? null : movie?.poster_path,
      rowDebugState: debugState,
    });
  };

  const syncNav = useCallback(
    (swiper) => {
      const nextState = {
        isBeginning: swiper.isBeginning,
        isEnd: swiper.isEnd,
      };

      const prevState = navStateRef.current;

      if (
        prevState.isBeginning !== nextState.isBeginning ||
        prevState.isEnd !== nextState.isEnd
      ) {
        navStateRef.current = nextState;
        setNavState(nextState);
        onNavStateChange?.(nextState);
      }

      const activeIndex = Number(swiper?.activeIndex ?? 0);

      if (!isLoading && Number.isFinite(activeIndex) && activeIndex >= 0) {
        const map = loadSwipeMap();
        map[swipeStoreKey] = {
          activeIndex,
          translate: Number(swiper?.translate ?? 0),
          progress: Number(swiper?.progress ?? 0),
        };
        saveSwipeMap(map);
      }
    },
    [onNavStateChange, swipeStoreKey, isLoading]
  );

  const restoreSwipePosition = useCallback(
    (swiper, targetStateRaw) => {
      if (!swiper || swiper.destroyed) return;

      let tries = 0;
      const maxTries = 18;

      const settle = () => {
        if (!swiper || swiper.destroyed) return;

        swiper.update();

        const targetState = normalizeSwipeState(targetStateRaw);
        const maxIndex = Math.max(0, (swiper.slides?.length || 1) - 1);

        const hasTranslate = Number.isFinite(targetState.translate);
        const hasProgress = Number.isFinite(targetState.progress);
        let boundedTranslate = null;

        if (hasTranslate) {
          const a = Number(swiper.minTranslate?.());
          const b = Number(swiper.maxTranslate?.());
          const lower =
            Number.isFinite(a) && Number.isFinite(b) ? Math.min(a, b) : null;
          const upper =
            Number.isFinite(a) && Number.isFinite(b) ? Math.max(a, b) : null;

          boundedTranslate =
            lower !== null && upper !== null
              ? Math.max(lower, Math.min(upper, Number(targetState.translate)))
              : Number(targetState.translate);

          swiper.setTranslate?.(boundedTranslate);
          swiper.updateProgress?.(boundedTranslate);
          swiper.updateActiveIndex?.();
          swiper.updateSlidesClasses?.();
        } else if (hasProgress) {
          const boundedProgress = Math.max(0, Math.min(1, Number(targetState.progress)));
          swiper.setProgress?.(boundedProgress, 0);
          swiper.updateActiveIndex?.();
          swiper.updateSlidesClasses?.();
        } else {
          const boundedIndex = Math.min(targetState.activeIndex, maxIndex);
          swiper.slideTo?.(boundedIndex, 0, false);
        }

        const boundedIndex = Math.min(targetState.activeIndex, maxIndex);
        syncNav(swiper);

        const current = Number(swiper.activeIndex ?? 0);
        const reachedByIndex =
          Math.abs(current - boundedIndex) <= 1 ||
          (swiper.isEnd && boundedIndex >= maxIndex - 1);

        const reachedByTranslate =
          boundedTranslate !== null &&
          Number.isFinite(swiper.translate) &&
          Math.abs(Number(swiper.translate) - boundedTranslate) <= 2;

        const reached = reachedByIndex || reachedByTranslate;

        if (reached || tries >= maxTries) return;
        tries += 1;

        requestAnimationFrame(() => {
          setTimeout(settle, 36);
        });
      };

      settle();
    },
    [syncNav]
  );

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (isLoading) return;
    if (hasError) return;
    if (!limitedMovies.length) return;

    const rafId = requestAnimationFrame(() => {
      if (!swiper || swiper.destroyed) return;

      swiper.update();

      if (shouldRestoreSwipe) {
        restoreSwipePosition(swiper, restoreSwipeState);
      }

      syncNav(swiper);
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    isLoading,
    hasError,
    limitedMovies.length,
    shouldRestoreSwipe,
    restoreSwipeState,
    restoreSwipePosition,
    syncNav,
  ]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    const canSwipe = !isLoading;
    swiper.allowTouchMove = canSwipe;

    if (swiper.params) {
      swiper.params.allowTouchMove = canSwipe;
      swiper.params.simulateTouch = canSwipe;
    }

    swiper.update?.();
  }, [isLoading]);

  const useInternalArrows =
    !isLoading && !isTouchDevice && !useExternalNav && !isTop10;

  const showLeft = useInternalArrows && !navState.isBeginning;
  const disableRight = useInternalArrows && navState.isEnd;

  const skeletonSlides = useMemo(
    () =>
      Array.from({ length: SKELETON_COUNT }, (_, i) => ({
        _sk: true,
        id: `sk-${id}-${i}`,
      })),
    [id]
  );

  const renderList = isLoading
    ? skeletonSlides
    : hasError
    ? errorFallbackSlides
    : limitedMovies;

  const showOverlay = !disableOverlay && !isTop10;
  const isForcedCdnFail = debugState === "cdn-fail";

  const showBadge =
    showRank &&
    (!debugState || debugState === "success" || debugState === "loading");

  const showDefaultErrorState = !isTop10 && debugState === "error";
  const showDefaultEmptyState = !isTop10 && debugState === "empty";

  const top10Breakpoints = {
    1378: { slidesPerView: 5.4, slidesPerGroup: 5 },
    998: { slidesPerView: 4.4, slidesPerGroup: 4 },
    625: { slidesPerView: 3.4, slidesPerGroup: 3 },
    390: { slidesPerView: 2.05, slidesPerGroup: 2, spaceBetween: 14 },
    360: { slidesPerView: 1.92, slidesPerGroup: 1, spaceBetween: 12 },
    0: { slidesPerView: 1.72, slidesPerGroup: 1, spaceBetween: 10 },
  };

  const defaultSwiperProps = {
    watchOverflow: true,
    loop: false,
    speed: 900,
    spaceBetween: 10,
    slidesPerView: "auto",
    slidesPerGroupAuto: true,
    touchEventsTarget: "container",
    allowTouchMove: !isLoading,
    simulateTouch: !isLoading,
  };

  const top10SwiperProps = {
    loop: false,
    speed: 700,
    spaceBetween: 12,
    breakpoints: top10Breakpoints,
    touchEventsTarget: "container",
    allowTouchMove: !isLoading,
    simulateTouch: !isLoading,
  };

  const handleCardKeyDown = (e, movie) => {
    if (movie?._fb || movie?._sk) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(movie);
    }
  };

  return (
    <Container id={id} $isTop10={isTop10}>
      {title ? <Title $isTop10={isTop10}>{title}</Title> : null}

      {showDefaultErrorState ? (
        <DefaultRowErrorState />
      ) : showDefaultEmptyState ? (
        <DefaultRowEmptyState />
      ) : (
        <RowShell
          className="rowShell"
          data-testid="row-shell"
          data-left={showLeft ? "1" : "0"}
          data-loading={isLoading ? "1" : "0"}
          data-touch={isTouchDevice ? "1" : "0"}
          data-variant={isTop10 ? "top10" : "default"}
          $isTop10={isTop10}
        >
          {useInternalArrows && (
            <ArrowZone
              className={`arrowZone left ${showLeft ? "" : "isHidden"}`}
              type="button"
              data-testid="row-prev-button"
              aria-label="이전 콘텐츠"
              aria-hidden={!showLeft}
              onClick={() => {
                if (!showLeft) return;
                swiperRef.current?.slidePrev();
              }}
            >
              <ArrowButton aria-hidden="true">
                <ArrowIconLeft />
              </ArrowButton>
            </ArrowZone>
          )}

          {useInternalArrows && (
            <ArrowZone
              className="arrowZone right"
              type="button"
              data-testid="row-next-button"
              aria-label="다음 콘텐츠"
              disabled={disableRight}
              aria-disabled={disableRight}
              onClick={() => {
                if (disableRight) return;
                swiperRef.current?.slideNext();
              }}
            >
              <ArrowButton aria-hidden="true">
                <ArrowIconRight />
              </ArrowButton>
            </ArrowZone>
          )}

          <SwiperArea
            className="swiperArea"
            $isTop10={isTop10}
            data-variant={isTop10 ? "top10" : "default"}
          >
            <Swiper
              modules={[A11y]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                if (!isLoading) {
                  syncNav(swiper);
                }
                onSwiperReady?.(swiper);
              }}
              onSlideChange={syncNav}
              onResize={syncNav}
              {...(isTop10 ? top10SwiperProps : defaultSwiperProps)}
            >
              {renderList.map((movie, index) => {
                if (movie?._sk) {
                  return (
                    <SwiperSlide key={movie.id}>
                      <Wrap className="skWrap" aria-hidden="true" $isTop10={isTop10}>
                        <div className="skCard" />
                        <div className="skMeta">
                          <div className="skTitle" />
                          <div className="skYear" />
                        </div>
                      </Wrap>
                    </SwiperSlide>
                  );
                }

                if (movie?._fb) {
                  return (
                    <SwiperSlide key={movie.id}>
                      <Wrap className="fbWrap" aria-hidden="true" $isTop10={isTop10}>
                        {showBadge && <RankBadge $isTop10={isTop10}>{index + 1}</RankBadge>}
                        <FallbackMedia $isTop10={isTop10}>
                          <FallbackInner>
                            {!debugState && <FallbackBadge>이미지 없음</FallbackBadge>}
                            <FallbackTitle>{movie._titleText}</FallbackTitle>
                          </FallbackInner>
                        </FallbackMedia>
                      </Wrap>
                    </SwiperSlide>
                  );
                }

                const titleText = movie._titleText;
                const yearText = movie._yearText;
                const imgPath = movie._imgPath;
                const altText = movie._altText;
                const rank = index + 1;

                return (
                  <SwiperSlide key={movie.id}>
                    <Wrap
                      onClick={() => handleClick(movie)}
                      onKeyDown={(e) => handleCardKeyDown(e, movie)}
                      role="button"
                      tabIndex={0}
                      data-testid="row-card"
                      $isTop10={isTop10}
                    >
                      {showBadge && <RankBadge $isTop10={isTop10}>{rank}</RankBadge>}

                      <CardMedia
                        imgPath={imgPath}
                        altText={altText}
                        titleText={titleText}
                        yearText={yearText}
                        isTop10={isTop10}
                        showOverlay={showOverlay}
                        forceFailImage={isForcedCdnFail}
                        debugState={debugState}
                      />
                    </Wrap>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {!isLoading && hasError && (
              <RowHint role="status" $isTop10={isTop10}>
                {errorMessage}
              </RowHint>
            )}

            {!isLoading && !hasError && limitedMovies.length === 0 && (
              <RowHint role="status" $isTop10={isTop10}>
                {emptyMessage}
              </RowHint>
            )}
          </SwiperArea>
        </RowShell>
      )}

      {mode !== "navigate" && modalOpen && (
        <MovieModal
          {...movieSelected}
          setModalOpen={setModalOpen}
          isLoggedIn={isLoggedIn}
          sourcePath={sourcePath}
          sourceTag={sourceTag}
          debugState={debugState}
        />
      )}
    </Container>
  );
};

export default Row;

/* ===========================
   styled-components
=========================== */

const Container = styled.section`
  padding: ${({ $isTop10 }) => ($isTop10 ? "0" : "0 0 26px")};
`;

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: ${({ $isTop10 }) => ($isTop10 ? "0" : "22px")};
  font-weight: 600;
  display: ${({ $isTop10 }) => ($isTop10 ? "none" : "block")};

  @media (max-width: 1024px) {
    font-size: ${({ $isTop10 }) => ($isTop10 ? "0" : "20px")};
  }

  @media (max-width: 768px) {
    font-size: ${({ $isTop10 }) => ($isTop10 ? "0" : "18px")};
    margin-bottom: 10px;
  }

  @media (max-width: 375px) {
    font-size: ${({ $isTop10 }) => ($isTop10 ? "0" : "17px")};
  }

  @media (max-width: 340px) {
    font-size: ${({ $isTop10 }) => ($isTop10 ? "0" : "16px")};
  }
`;

const Wrap = styled.div`
  width: ${({ $isTop10 }) => ($isTop10 ? "100%" : "95%")};
  padding-top: 56.25%;
  border-radius: ${({ $isTop10 }) => ($isTop10 ? "10px" : "8px")};

  box-shadow: rgb(0 0 0 / 69%) 0px 26px 30px -10px,
    rgb(0 0 0 / 73%) 0px 16px 10px -10px;

  cursor: pointer;
  overflow: hidden;
  position: relative;
  touch-action: pan-y;
  -ms-touch-action: pan-y;
  transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;

  border: 3px solid rgba(249, 249, 249, 0.1);
  box-sizing: border-box;

  img {
    inset: 0;
    display: block;
    height: 100%;
    object-fit: cover;
    position: absolute;
    user-select: none;
    -webkit-user-drag: none;
    width: 100%;
  }

  ${({ $isTop10 }) =>
    $isTop10
      ? css`
          @media (hover: hover) and (pointer: fine) {
            &:hover {
              border-color: rgba(249, 249, 249, 0.5);
              transform: none;
            }
          }

          &:active {
            border-color: rgba(249, 249, 249, 0.38);
            transform: none;
          }
        `
      : css`
          @media (hover: hover) and (pointer: fine) {
            &:hover {
              box-shadow: rgb(0 0 0 / 80%) 0px 40px 58px -16px,
                rgb(0 0 0 / 72%) 0px 30px 22px -10px;
              transform: scale(0.98);
              border-color: rgba(249, 249, 249, 0.8);
            }
          }

          &:active {
            transform: scale(0.99);
            border-color: rgba(249, 249, 249, 0.62);
          }
        `}

  &.skWrap,
  &.fbWrap {
    cursor: default;
  }

  &.skWrap {
    border-color: rgba(249, 249, 249, 0.08);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        transform: none;
        box-shadow: rgb(0 0 0 / 69%) 0px 26px 30px -10px,
          rgb(0 0 0 / 73%) 0px 16px 10px -10px;
        border-color: rgba(249, 249, 249, 0.08);
      }
    }
  }

  &.fbWrap {
    border-color: rgba(249, 249, 249, 0.08);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        transform: none;
        border-color: rgba(249, 249, 249, 0.08);
        box-shadow: rgb(0 0 0 / 69%) 0px 26px 30px -10px,
          rgb(0 0 0 / 73%) 0px 16px 10px -10px;
      }
    }
  }
`;

const FallbackMedia = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08), transparent 45%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)),
    #0b0f1a;
`;

const CenteredFallbackLabel = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;

  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(2px);
`;

const FallbackInner = styled.div`
  width: 100%;
  padding: 14px;
`;

const FallbackBadge = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 10px;
`;

const FallbackTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
`;

const FallbackMeta = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
`;

const RankBadge = styled.span`
  position: absolute;
  z-index: 3;
  pointer-events: none;
  user-select: none;
  line-height: 1;

  left: ${({ $isTop10 }) => ($isTop10 ? "12px" : "10px")};
  top: ${({ $isTop10 }) => ($isTop10 ? "auto" : "10px")};
  bottom: ${({ $isTop10 }) => ($isTop10 ? "10px" : "auto")};

  font-size: ${({ $isTop10 }) =>
    $isTop10 ? "clamp(44px, 5vw, 64px)" : "clamp(34px, 3vw, 48px)"};
  font-weight: 900;
  color: rgba(255, 255, 255, 0.96);

  text-shadow:
    -1px -1px 0 rgba(7, 11, 20, 0.72),
    1px -1px 0 rgba(7, 11, 20, 0.72),
    -1px 1px 0 rgba(7, 11, 20, 0.72),
    1px 1px 0 rgba(7, 11, 20, 0.72),
    0 8px 22px rgba(0, 0, 0, 0.45);

  @media (max-width: 768px) {
    left: ${({ $isTop10 }) => ($isTop10 ? "10px" : "8px")};
    top: ${({ $isTop10 }) => ($isTop10 ? "auto" : "8px")};
    bottom: ${({ $isTop10 }) => ($isTop10 ? "8px" : "auto")};

    font-size: ${({ $isTop10 }) =>
      $isTop10 ? "clamp(34px, 8vw, 48px)" : "clamp(28px, 7vw, 40px)"};
  }
`;

const RowShell = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;

  &[data-loading="1"] .swiper,
  &[data-loading="1"] .swiper-wrapper,
  &[data-loading="1"] .swiper-slide {
    pointer-events: none;
    touch-action: pan-y;
  }
`;

const SwiperArea = styled.div`
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;

  .swiper-slide {
    ${({ $isTop10 }) =>
      !$isTop10 &&
      css`
        width: min(320px, 24vw);
        max-width: 320px;

        @media (max-width: 1024px) {
          width: min(280px, 34vw);
          max-width: 280px;
        }

        @media (max-width: 768px) {
          width: min(240px, 68vw);
          max-width: 240px;
        }
      `}
  }
`;

const ArrowButton = styled.span`
  width: 44px;
  height: 44px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: rgba(8, 12, 22, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  backdrop-filter: blur(8px);
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
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

  padding: 0;
  border: none;
  cursor: pointer;
  background: transparent;

  transition:
    opacity 180ms ease,
    transform 180ms ease,
    background 180ms ease;

  opacity: 0.96;

  &.left {
    left: 0;
    background: linear-gradient(
      to right,
      rgba(4, 8, 16, 0.72) 0%,
      rgba(4, 8, 16, 0.32) 48%,
      rgba(4, 8, 16, 0) 100%
    );
  }

  &.right {
    right: 0;
    background: linear-gradient(
      to left,
      rgba(4, 8, 16, 0.72) 0%,
      rgba(4, 8, 16, 0.32) 48%,
      rgba(4, 8, 16, 0) 100%
    );
  }

  &:hover:not(:disabled) {
    opacity: 1;
  }

  &:hover:not(:disabled) ${ArrowButton} {
    transform: scale(1.06);
    background: rgba(8, 12, 22, 0.9);
    border-color: rgba(255, 255, 255, 0.22);
  }

  &:active:not(:disabled) ${ArrowButton} {
    transform: scale(0.98);
  }

  &.isHidden {
    opacity: 0;
    pointer-events: none;
    transform: translateX(-8px);
  }

  &:disabled {
    opacity: 0.22;
    cursor: default;
  }

  &:disabled ${ArrowButton} {
    transform: none;
    background: rgba(8, 12, 22, 0.42);
    border-color: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 1024px) {
    width: 56px;
  }

  @media (max-width: 768px) {
    display: none !important;
  }
`;

const ArrowIconLeft = styled(FiChevronLeft)`
  width: 22px;
  height: 22px;
  color: rgba(255, 255, 255, 0.96);
  flex-shrink: 0;
`;

const ArrowIconRight = styled(FiChevronRight)`
  width: 22px;
  height: 22px;
  color: rgba(255, 255, 255, 0.96);
  flex-shrink: 0;
`;

const RowHint = styled.div`
  position: absolute;
  left: ${({ $isTop10 }) => ($isTop10 ? "0" : "12px")};
  right: ${({ $isTop10 }) => ($isTop10 ? "0" : "auto")};
  bottom: 10px;
  font-size: 12px;
  opacity: 0.8;
  pointer-events: none;
  text-align: ${({ $isTop10 }) => ($isTop10 ? "center" : "left")};
`;

const DefaultStateWrap = styled.div`
  width: 100%;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;

  @media (max-width: 480px) {
    border-radius: 8px;
    padding: 12px;
  }
`;

const DefaultStateBox = styled.div`
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    min-height: 72px;
    gap: 10px;
  }
`;

const DefaultStateIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }
`;

const DefaultStateText = styled.div`
  display: grid;
  gap: 4px;
`;

const DefaultStateTitle = styled.strong`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.94);

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DefaultStateDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);

  @media (max-width: 480px) {
    font-size: 11px;
    line-height: 1.4;
  }
`;

const DefaultStateRetry = styled.button`
  margin-left: auto;
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.94);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  cursor: pointer;

  @media (max-width: 480px) {
    min-height: 30px;
    padding: 0 10px;
    font-size: 12px;
  }
`;