import React, { useEffect, useRef, useState } from "react";
import "./CategorySection.css";

const brands = [
  {
    name: "disney",
    logo: "/images/viewers-disney.png",
    video: "/videos/disney.mp4",
  },
  {
    name: "marvel",
    logo: "/images/viewers-marvel.png",
    video: "/videos/marvel.mp4",
  },
  {
    name: "pixar",
    logo: "/images/viewers-pixar.png",
    video: "/videos/pixar.mp4",
  },
  {
    name: "starwars",
    logo: "/images/viewers-starwars.png",
    video: "/videos/star-wars.mp4",
  },
  {
    name: "national",
    logo: "/images/viewers-national.png",
    video: "/videos/national-geographic.mp4",
  },
  {
    name: "hulu",
    logo:
      "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/ABD0973AB7BC9CD31EEBA7B9A1DDF29F4F176DFDECACBF1BCDB123F2D5957F9C/compose?aspectRatio=1.78&format=webp&width=600",
    video:
      "https://vod-bgc-oc-east-1.media.dssott.com/bgui/ps01/disney/bgui/2025/11/20/1763651704-xyz.mp4",
  },
];

const CategorySection = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeBrand, setActiveBrand] = useState(null);
  const rootRef = useRef(null);
  const videoRefs = useRef(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqTouch = window.matchMedia("(hover: none) and (pointer: coarse)");
    const mqAnyCoarse = window.matchMedia("(any-pointer: coarse)");

    const sync = () => {
      const hasTouchPoints =
        Number(window.navigator?.maxTouchPoints || window.navigator?.msMaxTouchPoints || 0) > 0;
      const touchCapable = hasTouchPoints || mqTouch.matches || mqAnyCoarse.matches;
      setIsTouchDevice(touchCapable);

      if (!touchCapable) {
        setActiveBrand(null);
      }
    };

    sync();
    mqTouch.addEventListener?.("change", sync);
    mqAnyCoarse.addEventListener?.("change", sync);

    return () => {
      mqTouch.removeEventListener?.("change", sync);
      mqAnyCoarse.removeEventListener?.("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!isTouchDevice) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setActiveBrand(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isTouchDevice]);

  useEffect(() => {
    if (!isTouchDevice) {
      videoRefs.current.forEach((video) => {
        if (!video) return;
        video.muted = true;
      });
      return;
    }

    videoRefs.current.forEach((video, brandName) => {
      if (!video) return;

      video.muted = true;

      if (brandName === activeBrand) {
        const playPromise = video.play?.();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return;
      }

      video.pause?.();
      try {
        video.currentTime = 0;
      } catch {
        // 메타데이터 로드 전에는 seek이 막힐 수 있어 무시한다.
      }
    });
  }, [activeBrand, isTouchDevice]);

  return (
    <div className="category" ref={rootRef}>
      {brands.map((brand) => (
        <button
          key={brand.name}
          type="button"
          className={`category-card ${
            isTouchDevice && activeBrand === brand.name ? "isActive" : ""
          }`}
          aria-pressed={isTouchDevice ? activeBrand === brand.name : undefined}
          onClick={() => {
            if (!isTouchDevice) return;
            setActiveBrand((prev) => (prev === brand.name ? null : brand.name));
          }}
        >
          <img
            src={brand.logo}
            alt={brand.name}
            className="category-logo"
            data-brand={brand.name}
          />
          <video
            autoPlay={!isTouchDevice}
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            ref={(node) => {
              if (node) {
                videoRefs.current.set(brand.name, node);
              } else {
                videoRefs.current.delete(brand.name);
              }
            }}
          >
            <source src={brand.video} type="video/mp4" />
          </video>
        </button>
      ))}
    </div>
  );
};

export default CategorySection;
