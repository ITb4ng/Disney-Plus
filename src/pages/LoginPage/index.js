import { useEffect, useState } from "react";
import "./index.css";
import { slides } from "./slides";
import BundlePromo from "./Bundle";

export default function LoginPage() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, total]);

  return (
    <section className="login-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* background */}
      <div className="hero-bg">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`hero-bg-slide ${idx === active ? "is-active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      {/* CONTENT LAYOUT (좌측 promo / 우측은 이미지가 보이게 비워둠) */}
      <div className="hero-layout">
        <div className="hero-left">
          <BundlePromo />
        </div>
        <div className="hero-right" />
      </div>

      {/* floating caption (하단 중앙) */}
      <div className="hero-caption-wrap">
        {slides.map((slide, idx) => (
          <div key={slide.id} className={`hero-caption ${idx === active ? "is-active" : ""}`}>
            <span className="cap-title">{slide.title}</span>
            {slide.status && <span className="cap-status">{slide.status}</span>}
          </div>
        ))}
      </div>

      {/* thin bar nav */}
      <div className="hero-nav">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`hero-nav-bar ${idx === active ? "is-active" : ""}`}
            onClick={() => setActive(idx)}
            aria-label={`${idx + 1}번째 슬라이드`}
          />
        ))}
      </div>
    </section>
  );
}
