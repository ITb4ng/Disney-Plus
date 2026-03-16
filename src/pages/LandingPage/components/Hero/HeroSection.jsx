import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./HeroSection.css";
import { slides } from "./slides";
import BundlePromo from "./BundlePromo";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";

const IMAGE_TIMEOUT_MS = 8000;
const AUTO_RESUME_DELAY_MS = 12000;
const INITIAL_NEIGHBOR_PREFETCH_DELAY_MS = 1600;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      reject(new Error("timeout"));
    }, IMAGE_TIMEOUT_MS);

    img.onload = () => {
      clearTimeout(timer);
      resolve(url);
    };

    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("load-failed"));
    };

    img.src = url;
  });
}

export default function HeroSection({ debugState = "success" }) {
  const total = slides.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [showPlayHintPulse, setShowPlayHintPulse] = useState(false);
  const [isMd, setIsMd] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1024px)").matches;
  });

  const [visualMap, setVisualMap] = useState({});

  // URL-level cache: avoid retrying the same failed CDN URL repeatedly.
  const imageStatusMapRef = useRef({});
  const loadingKeySetRef = useRef(new Set());
  const autoResumeTimerRef = useRef(null);
  const initialPrefetchDoneRef = useRef(false);

  const isDebugLoading = debugState === "loading";
  const isDebugError = debugState === "error";
  const isDebugEmpty = debugState === "empty";
  const isDebugCdnFail = debugState === "cdn-fail";

  const mode = isMd ? "md" : "xl";
  const isAutoPaused = paused || interactionPaused;

  const getSlideKey = useCallback(
    (idx) => {
      const slide = slides[idx];
      if (!slide) return `missing-${idx}`;
      return `${slide.id}:${mode}`;
    },
    [mode]
  );

  const getCandidateUrls = useCallback(
    (idx) => {
      if (isDebugCdnFail) return [];

      const slide = slides[idx];
      if (!slide?.image) return [];

      const preferred = isMd ? slide.image.md : slide.image.xl;
      const secondary = isMd ? slide.image.xl : slide.image.md;

      return [...new Set([preferred, secondary].filter(Boolean))];
    },
    [isMd, isDebugCdnFail]
  );

  const resolveSlideImage = useCallback(
    async (idx) => {
      const key = getSlideKey(idx);
      const candidates = getCandidateUrls(idx);

      const current = visualMap[key];
      if (current?.status === "loaded" || current?.status === "failed") return;
      if (loadingKeySetRef.current.has(key)) return;

      loadingKeySetRef.current.add(key);
      setVisualMap((prev) => ({
        ...prev,
        [key]: {
          status: "loading",
          url: prev[key]?.url ?? null,
        },
      }));

      try {
        for (const url of candidates) {
          const cached = imageStatusMapRef.current[url];

          if (cached === "loaded") {
            setVisualMap((prev) => ({ ...prev, [key]: { status: "loaded", url } }));
            return;
          }

          if (cached === "failed") continue;

          try {
            await loadImage(url);
            imageStatusMapRef.current[url] = "loaded";
            setVisualMap((prev) => ({ ...prev, [key]: { status: "loaded", url } }));
            return;
          } catch {
            imageStatusMapRef.current[url] = "failed";
          }
        }

        setVisualMap((prev) => ({ ...prev, [key]: { status: "failed", url: null } }));
      } finally {
        loadingKeySetRef.current.delete(key);
      }
    },
    [getCandidateUrls, getSlideKey, visualMap]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 1024px)");
    const onChange = (e) => setIsMd(e.matches);

    mql.addEventListener?.("change", onChange);
    mql.addListener?.(onChange);

    return () => {
      mql.removeEventListener?.("change", onChange);
      mql.removeListener?.(onChange);
    };
  }, []);

  useEffect(() => {
    if (total === 0) return;
    if (active >= total) setActive(0);
  }, [active, total]);

  useEffect(() => {
    if (isAutoPaused || isDebugLoading || isDebugError || isDebugEmpty) return;
    if (total <= 1) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPaused, total, isDebugLoading, isDebugError, isDebugEmpty]);

  useEffect(() => {
    return () => {
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
      }
    };
  }, []);

  // Pause autoplay after user navigation action, then resume after inactivity.
  const pauseAutoByInteraction = useCallback(() => {
    if (paused) return;

    setInteractionPaused(true);
    setShowPlayHintPulse(true);

    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }

    autoResumeTimerRef.current = setTimeout(() => {
      setInteractionPaused(false);
      setShowPlayHintPulse(false);
    }, AUTO_RESUME_DELAY_MS);
  }, [paused]);

  const handleManualToggle = useCallback(() => {
    if (isAutoPaused) {
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
      }

      setInteractionPaused(false);
      setPaused(false);
      setShowPlayHintPulse(false);
      return;
    }

    setPaused(true);
    setShowPlayHintPulse(false);
  }, [isAutoPaused]);

  const handleNavSelect = useCallback(
    (idx) => {
      setActive(idx);
      pauseAutoByInteraction();
    },
    [pauseAutoByInteraction]
  );

  // Initial-load optimization:
  // Load active slide first, prefetch neighbors after a short delay.
  useEffect(() => {
    if (total === 0 || isDebugError || isDebugEmpty) return;

    resolveSlideImage(active);

    if (total > 1) {
      if (!initialPrefetchDoneRef.current) {
        initialPrefetchDoneRef.current = true;

        const warmupTimer = setTimeout(() => {
          resolveSlideImage((active + 1) % total);
          resolveSlideImage((active - 1 + total) % total);
        }, INITIAL_NEIGHBOR_PREFETCH_DELAY_MS);

        return () => clearTimeout(warmupTimer);
      }

      resolveSlideImage((active + 1) % total);
      resolveSlideImage((active - 1 + total) % total);
    }
  }, [active, total, resolveSlideImage, isDebugError, isDebugEmpty]);

  const activeState = useMemo(() => {
    const key = getSlideKey(active);
    return visualMap[key] || { status: "idle", url: null };
  }, [active, getSlideKey, visualMap]);

  const showEmpty = total === 0 || isDebugEmpty;
  return (
    <section
      className={`hero ${isDebugLoading ? "hero--debug-loading" : ""} ${
        active === 0 ? "hero--first-slide" : ""
      }`}
      data-restore-anchor="landing-hero"
    >
      <div className="hero-bg" aria-hidden="true">
        {slides.map((slide, idx) => {
          const isActive = idx === active;
          const key = getSlideKey(idx);
          const state = visualMap[key] || { status: "idle", url: null };
          const hasSafeBg = isActive && !state.url;
          const isFallback = isActive && (isDebugCdnFail || state.status === "failed");
          const isLoading = isActive && state.status === "loading";

          return (
            <div
              key={slide.id}
              className={`hero-bg-slide ${isActive ? "is-active" : ""} ${
                hasSafeBg ? "is-safe-bg" : ""
              } ${isFallback ? "is-fallback" : ""} ${isLoading ? "is-loading" : ""}`}
              style={{ backgroundImage: state.url ? `url(${state.url})` : "none" }}
            />
          );
        })}
        <div className="hero-overlay" />
      </div>

      {isDebugError && (
        <div className="hero-state hero-state--error" role="alert" aria-live="polite">
          <strong>이미지 배너를 불러올 수 없습니다.</strong>
          <p>네트워크나 인터넷 상태를 확인해주세요.</p>
        </div>
      )}

      {isDebugLoading && !isDebugError && (
        <div className="hero-state hero-state--loading" role="status" aria-live="polite">
          <div className="hero-loading">
            <span className="hero-loading__spinner" aria-hidden="true" />
            <span className="hero-loading__text">콘텐츠를 불러오는 중...</span>
          </div>
        </div>
      )}

      <div className="hero-layout">
        <div className="hero-left">
          <BundlePromo />
          <button
            type="button"
            className="hero-scrollCue hero-scrollCue--inline"
            aria-label="Move to below content"
            onClick={() => {
              document
                .getElementById("home-content")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <FaAngleDown />
          </button>
        </div>

        <div className="hero-right" />
      </div>

      {!isMd && !isDebugError && (
        <div className="hero-caption-wrap" aria-hidden="true">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`hero-caption ${idx === active ? "is-active" : ""}`}
            >
              <span className="cap-title">{slide.title}</span>
              {slide.status ? <span className="cap-status">{slide.status}</span> : null}
            </div>
          ))}
        </div>
      )}

      {total > 1 && !isDebugError && !showEmpty && (
        <div className="hero-navWrap" aria-label="hero navigation">
          <div className="hero-nav" role="tablist" aria-label="select slide">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`hero-nav-bar ${idx === active ? "is-active" : ""}`}
                onClick={() => handleNavSelect(idx)}
                aria-label={`slide ${idx + 1}`}
                aria-selected={idx === active}
                role="tab"
              />
            ))}
          </div>

          <button
            type="button"
            className={`hero-mediaToggle ${showPlayHintPulse && isAutoPaused ? "is-pulse" : ""}`}
            onClick={handleManualToggle}
            aria-label={isAutoPaused ? "play" : "pause"}
            title={isAutoPaused ? "play" : "pause"}
          >
            {isAutoPaused ? <IoMdPlay /> : <IoMdPause />}
          </button>
        </div>
      )}

      {showEmpty && (
        <div className="hero-empty">
          <p>No slides available</p>
        </div>
      )}

      {activeState.status === "failed" && !isDebugError && !showEmpty && (
        <div className="hero-state hero-state--soft" aria-live="polite">
          <p>Fallback background is shown due to unstable image source.</p>
        </div>
      )}
    </section>
  );
}

