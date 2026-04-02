import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled, { css } from "styled-components";
import requests from "../../api/request";
import Row from "../../components/Row";
import { useAuth } from "../../contexts/AuthContext";
import {
  COMMON_DEBUG_STATES,
  pickDebugStateFromSearchParams,
} from "../../utils/debugState";
import Banner from "./components/Banner";
import CategorySection from "./components/CategorySection";
import DemoActionSection from "./components/DemoActionSection";
import FeedbackTeaser from "./components/FeedbackTeaser";

export default function MainPage() {
  const [searchParams] = useSearchParams();
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const shouldShowDemoBannerRef = useRef(false);
  const { userData } = useAuth();

  const isGuest = useMemo(() => {
    const guestFlag = localStorage.getItem("isGuest") === "1";
    const isDemoUser = userData?.email === "demo@disney.dev";
    return guestFlag && isDemoUser;
  }, [userData?.email]);

  useEffect(() => {
    if (userData?.email && userData.email !== "demo@disney.dev") {
      localStorage.removeItem("isGuest");
    }
  }, [userData?.email]);

  useEffect(() => {
    const flag = sessionStorage.getItem("demo_banner");
    if (flag === "1") {
      shouldShowDemoBannerRef.current = true;
      sessionStorage.removeItem("demo_banner");
    }

    if (!shouldShowDemoBannerRef.current) return undefined;

    setShowDemoBanner(true);
    const timer = window.setTimeout(() => setShowDemoBanner(false), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = "Disney+ Renewal";
  }, []);

  const rows = useMemo(() => {
    if (isGuest) {
      return [
        {
          title: "Top Rated",
          id: "TR",
          fetchUrl: requests.fetchTopRated,
          showRank: true,
        },
        {
          title: "Trending Now",
          id: "TN",
          fetchUrl: requests.fetchTrending,
        },
      ];
    }

    return [
      {
        title: "Top Rated",
        id: "TR",
        fetchUrl: requests.fetchTopRated,
        showRank: true,
      },
      {
        title: "Trending Now",
        id: "TN",
        fetchUrl: requests.fetchTrending,
      },
      {
        title: "Action Movies",
        id: "AM",
        fetchUrl: requests.fetchActionMovies,
      },
      {
        title: "Comedy Movies",
        id: "CM",
        fetchUrl: requests.fetchComedyMovies,
      },
    ];
  }, [isGuest]);

  const rowDebugState = pickDebugStateFromSearchParams(searchParams, "rowDebug", {
    fallback: "success",
    allowed: COMMON_DEBUG_STATES,
  });

  const bannerDebugRaw = pickDebugStateFromSearchParams(searchParams, "bannerDebug", {
    fallback: "success",
    allowed: [...COMMON_DEBUG_STATES, "image-error"],
  });

  return (
    <>
      {showDemoBanner && <DemoBanner onClose={() => setShowDemoBanner(false)} />}

      <Container data-rows-loaded="1">
        <SectionBlock
          $variant="banner"
          data-restore-anchor="main-banner"
        >
          <Banner debugState={bannerDebugRaw} />
        </SectionBlock>

        {isGuest && (
          <SectionBlock
            $variant="feature"
            data-restore-anchor="main-demo-action"
          >
            <DemoActionSection />
          </SectionBlock>
        )}

        {!isGuest && (
          <SectionBlock
            $variant="feature"
            data-restore-anchor="main-category"
          >
            <CategorySection />
          </SectionBlock>
        )}

        {rows.map((row) => (
          <SectionBlock
            key={row.id}
            $variant="row"
            data-restore-anchor={`row-${row.id}`}
          >
            <Row
              title={row.title}
              id={row.id}
              fetchUrl={row.fetchUrl}
              showRank={row.showRank}
              debugState={rowDebugState}
            />
          </SectionBlock>
        ))}

        <SectionBlock
          $variant="feedback"
          data-restore-anchor="main-feedback"
        >
          <FeedbackTeaser isGuest={isGuest} />
        </SectionBlock>
      </Container>
    </>
  );
}

const Container = styled.main`
  --main-page-content-max: 1680px;
  --main-page-gap-banner: clamp(28px, 3vw, 40px);
  --main-page-gap-feature: clamp(18px, 2vw, 28px);
  --main-page-gap-feedback: clamp(12px, 1.6vw, 20px);

  position: relative;
  display: block;
  min-height: calc(100vh - 250px);
  overflow-x: hidden;
  padding: 72px calc(3.5vw + 5px) 0;
`;

const SectionBlock = styled.section`
  width: min(100%, var(--main-page-content-max));
  margin: 0 auto;

  ${({ $variant }) =>
    $variant === "banner" &&
    css`
      margin-bottom: var(--main-page-gap-banner);
    `}

  ${({ $variant }) =>
    $variant === "feature" &&
    css`
      margin-bottom: var(--main-page-gap-feature);
    `}

  ${({ $variant }) =>
    $variant === "feedback" &&
    css`
      margin-top: var(--main-page-gap-feedback);
      padding-bottom: 36px;
    `}
`;

function DemoBanner({ onClose }) {
  return (
    <DemoWrap role="status" aria-live="polite">
      <DemoInner>
        <Dot />
        <TextBlock>
          <DemoTitle>{"체험 계정으로 로그인 중"}</DemoTitle>
          <DemoDesc>{"일부 기능은 제한된 상태로 제공됩니다."}</DemoDesc>
        </TextBlock>
        <CloseBtn type="button" onClick={onClose} aria-label={"배너 닫기"}>
          {"×"}
        </CloseBtn>
      </DemoInner>
    </DemoWrap>
  );
}
const DemoWrap = styled.div`
  position: fixed;
  top: calc(env(safe-area-inset-top) + 12px);
  left: 0;
  right: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 0 14px;

  @media (max-width: 640px) {
    padding: 0 10px;
  }
`;

const DemoInner = styled.div`
  width: min(760px, 100%);
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 13px 11px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(12, 14, 22, 0.84);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);

  @media (max-width: 640px) {
    min-height: 56px;
    gap: 9px;
    padding: 10px 11px 10px 10px;
  }

  @media (max-width: 420px) {
    width: 100%;
    min-height: 54px;
    gap: 8px;
    padding: 9px 10px 9px 9px;
    border-radius: 12px;
  }
`;

const Dot = styled.div`
  flex: 0 0 auto;
  align-self: center;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba(2, 214, 232, 0.95);
  box-shadow: 0 0 0 4px rgba(2, 214, 232, 0.14);
`;

const TextBlock = styled.div`
  flex: 1;
  min-width: 0;
  align-self: center;
  display: grid;
  align-content: center;
  gap: 2px;
`;

const DemoTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.92);
`;

const DemoDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.68);
`;

const CloseBtn = styled.button`
  flex: 0 0 auto;
  align-self: center;
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 255, 255, 0.74);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.94);
  }

  @media (max-width: 640px) {
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }
`;
