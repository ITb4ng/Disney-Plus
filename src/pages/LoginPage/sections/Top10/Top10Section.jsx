import React, { useState } from "react";
import Top10Row from "./Top10Row";
import requests from "../../../../api/request";
import "./Top10Section.css";

export default function Top10Section() {
  const [swiper, setSwiper] = useState(null);
  const [nav, setNav] = useState({ isBeginning: true, isEnd: false }); // ✅ 디폴트: 처음

  return (
    <section className="top10Section">
      <div className="top10TitleWrap">
        <h2>오늘 한국의 TOP 10</h2>
      </div>

      <div className="top10RailWrap">
        <Top10Row
          id="TOP10"
          fetchParams={requests.fetchTop10KR}
          limit={10}
          onSwiperReady={setSwiper}
          onNavStateChange={setNav} // ✅ 여기로 상태 전달받음
        />
      </div>

      <div className="top10Controls">
        {/* 처음이면 < 비활성 */}
        <button
          className={`navBtn ${nav.isBeginning ? "navBtn--disabled" : ""}`}
          onClick={() => swiper?.slidePrev()}
          disabled={nav.isBeginning}
          aria-label="prev"
        >
          {"<"}
        </button>

        {/* 끝이면 > 비활성 */}
        <button
          className={`navBtn ${nav.isEnd ? "navBtn--disabled" : ""}`}
          onClick={() => swiper?.slideNext()}
          disabled={nav.isEnd}
          aria-label="next"
        >
          {">"}
        </button>
      </div>
    </section>
  );
}
