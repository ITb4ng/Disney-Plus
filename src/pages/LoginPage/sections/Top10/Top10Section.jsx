import React, { useState } from "react";
import Top10Row from "./Top10Row";
import requests from "../../../../api/request";
import "./Top10Section.css";

export default function Top10Section() {
  const [swiper, setSwiper] = useState(null);
  const [nav, setNav] = useState({ isBeginning: true, isEnd: false });

  return (
    <section className="top10Section">
      <div className="top10TitleWrap">
        <h2>오늘 한국의 TOP 10</h2>
      </div>

      <div className="top10Shell">
        {/* LEFT ARROW ZONE (처음엔 숨김) */}
        <button
          type="button"
          className={`top10ArrowZone top10ArrowZone--left ${
            nav.isBeginning ? "is-hidden" : ""
          }`}
          onClick={() => swiper?.slidePrev()}
          disabled={nav.isBeginning}
          aria-label="이전"
        >
          <span className="top10ArrowIcon">‹</span>
        </button>

        {/* SWIPER AREA */}
        <div className="top10SwiperArea">
          <Top10Row
            id="TOP10"
            fetchParams={requests.fetchTop10KR}
            limit={10}
            onSwiperReady={setSwiper}
            onNavStateChange={setNav}
            disableNav={false}
          />
        </div>

        {/* RIGHT ARROW ZONE (끝이면 숨김) */}
        <button
          type="button"
          className={`top10ArrowZone top10ArrowZone--right ${
            nav.isEnd ? "is-hidden" : ""
          }`}
          onClick={() => swiper?.slideNext()}
          disabled={nav.isEnd}
          aria-label="다음"
        >
          <span className="top10ArrowIcon">›</span>
        </button>
      </div>
    </section>
  );
}
