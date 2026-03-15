import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import requests from "../../api/request";
import Banner from "../../components/Banner/banner";
import Category from "../../components/category";
import DemoActionSection from "../../components/DemoAction";
import Feedback from "../../components/Feedback";
import Row from "../../components/Row";
import { useAuth } from "../../contexts/AuthContext";
import {
  COMMON_DEBUG_STATES,
  pickDebugStateFromSearchParams,
} from "../../utils/debugState";
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
    const timer = window.setTimeout(() => setShowDemoBanner(false), 2000);
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

  const bannerDebugState =
    bannerDebugRaw === "no-image" || bannerDebugRaw === "cdn-fail"
      ? "image-error"
      : bannerDebugRaw;

  return (
    <>
      {showDemoBanner && <DemoBanner onClose={() => setShowDemoBanner(false)} />}

      <Container data-rows-loaded="1">
        <SectionBlock data-restore-anchor="main-banner">
          <Banner debugState={bannerDebugState} />
        </SectionBlock>

        {isGuest && (
          <SectionBlock data-restore-anchor="main-demo-action">
            <DemoActionSection />
          </SectionBlock>
        )}
        {!isGuest && (
          <SectionBlock data-restore-anchor="main-category">
            <Category />
          </SectionBlock>
        )}

        {rows.map((row) => (
          <SectionBlock key={row.id} data-restore-anchor={`row-${row.id}`}>
            <Row
              title={row.title}
              id={row.id}
              fetchUrl={row.fetchUrl}
              showRank={row.showRank}
              debugState={rowDebugState}
            />
          </SectionBlock>
        ))}

        <SectionBlock data-restore-anchor="main-feedback">
          <Feedback variant="teaser" isGuest={isGuest} />
        </SectionBlock>
      </Container>
    </>
  );
}

const Container = styled.main`
  position: relative;
  min-height: calc(100vh - 250px);
  overflow-x: hidden;
  display: block;
  padding: 72px calc(3.5vw + 5px) 0;
`;

const SectionBlock = styled.section``;

const DemoBanner = ({ onClose }) => {
  return (
    <DemoWrap role="status" aria-live="polite">
      <DemoInner>
        <Dot />
        <TextBlock>
          <DemoTitle>체험 계정으로 로그인 중</DemoTitle>
          <DemoDesc>일부 기능은 제한된 상태로 제공됩니다.</DemoDesc>
        </TextBlock>

        <CloseBtn type="button" onClick={onClose} aria-label="배너 닫기">
          ×
        </CloseBtn>
      </DemoInner>
    </DemoWrap>
  );
};

const DemoWrap = styled.div`
  position: fixed;
  top: calc(env(safe-area-inset-top) + 12px);
  left: 0;
  right: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 0 14px;
`;

const DemoInner = styled.div`
  width: min(760px, 100%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(12, 14, 22, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(2, 214, 232, 0.95);
  box-shadow: 0 0 0 4px rgba(2, 214, 232, 0.14);
`;

const TextBlock = styled.div`
  display: grid;
  gap: 2px;
`;

const DemoTitle = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.2;
`;

const DemoDesc = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const CloseBtn = styled.button`
  margin-left: auto;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.92);
  }
`;
