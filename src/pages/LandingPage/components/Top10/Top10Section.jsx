import React, { useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiRefreshCw,
  FiInbox,
} from "react-icons/fi";
import Row from "../../../../components/Row";
import requests from "../../../../api/request";
import "./Top10Section.css";

function Top10ErrorState() {
  return (
    <div className="top10StateWrap">
      <div className="top10ErrorBox" role="alert" aria-live="polite">
        <div className="top10ErrorIconWrap">
          <FiAlertCircle className="top10ErrorIcon" />
        </div>

        <div className="top10ErrorText">
          <strong className="top10ErrorTitle">TOP 10 콘텐츠를 불러오지 못했습니다.</strong>
          <p className="top10ErrorDesc">
            잠시 후 다시 시도해 주세요. 문제가 계속되면 네트워크나 API 상태를 확인해 주세요.
          </p>
        </div>

        <button
          type="button"
          className="top10RetryButton"
          onClick={() => window.location.reload()}
        >
          <FiRefreshCw />
          <span>다시 시도</span>
        </button>
      </div>
    </div>
  );
}

function Top10EmptyState() {
  return (
    <div className="top10StateWrap">
      <div className="top10EmptyBox" aria-live="polite">
        <div className="top10EmptyIconWrap">
          <FiInbox className="top10EmptyIcon" />
        </div>

        <div className="top10EmptyText">
          <strong className="top10EmptyTitle">현재 표시할 TOP 10 콘텐츠가 없습니다.</strong>
          <p className="top10EmptyDesc">데이터를 준비하는 중입니다. 잠시 후 다시 확인해 주세요.</p>
        </div>
      </div>
    </div>
  );
}

function Top10CdnFailState() {
  return (
    <div className="top10CdnFailState" role="status" aria-live="polite">
      <span className="top10CdnFailState__label">CDN FAIL TEST</span>
      <span className="top10CdnFailState__text">
        이미지 경로 오류 상태를 시뮬레이션하는 중입니다.
      </span>
    </div>
  );
}

export default function Top10Section({ id, userData, debugState }) {
  const [swiper, setSwiper] = useState(null);
  const [nav, setNav] = useState({
    isBeginning: true,
    isEnd: false,
  });

  const isError = debugState === "error";
  const isEmpty = debugState === "empty";
  const isCdnFail = debugState === "cdn-fail";
  const isStateLayout = !!debugState && debugState !== "success";
  const rowDebugState =
    debugState === "loading" ||
    debugState === "no-image" ||
    debugState === "image-error" ||
    debugState === "cdn-fail"
      ? debugState
      : undefined;

  return (
    <section
      id={id}
      className={`top10Section ${isStateLayout ? "top10Section--state" : ""}`}
      data-restore-anchor="landing-top10"
    >
      <div className="top10TitleWrap">
        <h2>오늘의 추천 TOP 10</h2>
      </div>

      {isError && <Top10ErrorState />}
      {isEmpty && <Top10EmptyState />}
      {isCdnFail && <Top10CdnFailState />}

      {!isError && !isEmpty && (
        <div
          className="top10Shell"
          data-start={nav.isBeginning ? "1" : "0"}
          data-end={nav.isEnd ? "1" : "0"}
        >
          <button
            type="button"
            className={`top10ArrowZone top10ArrowZone--left ${
              nav.isBeginning ? "is-hidden" : ""
            }`}
            onClick={() => swiper?.slidePrev()}
            disabled={nav.isBeginning}
            aria-label="이전"
          >
            <span className="top10ArrowButton" aria-hidden="true">
              <FiChevronLeft className="top10ArrowSvg" />
            </span>
          </button>

          <div className="top10SwiperArea">
            <Row
              id="TOP10"
              fetchUrl={requests.fetchTop10KR}
              variant="top10"
              showRank
              useExternalNav
              limit={10}
              userData={userData}
              onSwiperReady={setSwiper}
              onNavStateChange={setNav}
              debugState={rowDebugState}
            />
          </div>

          <button
            type="button"
            className={`top10ArrowZone top10ArrowZone--right ${nav.isEnd ? "is-hidden" : ""}`}
            onClick={() => swiper?.slideNext()}
            disabled={nav.isEnd}
            aria-label="다음"
          >
            <span className="top10ArrowButton" aria-hidden="true">
              <FiChevronRight className="top10ArrowSvg" />
            </span>
          </button>
        </div>
      )}
    </section>
  );
}