import { useEffect, useState } from "react";
import "./HeroSection.css";
import { slides } from "./slides";
import BundlePromo from "./Bundle";
import { IoMdPause, IoMdPlay } from "react-icons/io";

export default function HeroSection() {
  const total = slides.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const [isMd, setIsMd] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1024px)").matches;
  });

  // matchMedia listener
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

  // active guard (slides가 바뀌거나 total이 줄어도 안전)
  useEffect(() => {
    if (total === 0) return;
    if (active >= total) setActive(0);
  }, [active, total]);

  // autoplay
  useEffect(() => {
    if (paused) return;
    if (total <= 1) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);

    return () => clearInterval(timer);
  }, [paused, total]);


  return (
    <section className="hero">
      {/* background */}
      <div className="hero-bg" aria-hidden="true">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`hero-bg-slide ${idx === active ? "is-active" : ""}`}
            style={{
              backgroundImage: `url(${isMd ? slide.image.md : slide.image.xl})`,
            }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      {/* content */}
      <div className="hero-layout">
        <div className="hero-left">
          <BundlePromo />
        </div>
        <div className="hero-right" />
      </div>

      {/* caption (데스크탑/태블릿에서만: 모바일은 깔끔하게 숨김) */}
      {!isMd && (
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

      {/* nav + play/pause */}
      {total > 1 && (
        <div className="hero-navWrap" aria-label="히어로 네비게이션">
          <div className="hero-nav" role="tablist" aria-label="슬라이드 선택">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`hero-nav-bar ${idx === active ? "is-active" : ""}`}
                onClick={() => setActive(idx)}
                aria-label={`${idx + 1}번째 슬라이드`}
                aria-selected={idx === active}
                role="tab"
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-mediaToggle"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "재생" : "일시정지"}
            title={paused ? "재생" : "일시정지"}
          >
            {paused ? <IoMdPlay /> : <IoMdPause />}
          </button>
        </div>
      )}

      {/* 단일 slide일 때도 배경은 나오게 */}
      {total === 0 && (
        <div className="hero-empty">
          <p>슬라이드가 비어있음</p>
        </div>
      )}
    </section>
  );
}