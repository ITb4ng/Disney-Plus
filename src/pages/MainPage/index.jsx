import React, { useEffect, useMemo, useState } from "react";
import Banner from "../../components/banner";
import Row from "../../components/Row";
import Category from "../../components/category";
import styled from "styled-components";
import requests from "../../api/request";
// import Update from "../../components/Update";
import Feedback from "../../components/Feedback";
import DemoActionSection from "../../components/DemoAction";


const MainPage = () => {
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  // 브라우저 sessionStorage/localStorage 접근은 렌더마다 읽지 말고 memo로 한번만
  const isGuest = useMemo(() => localStorage.getItem("isGuest") === "1", []);

 

  useEffect(() => {
    const flag = sessionStorage.getItem("demo_banner");
    if (flag === "1") {
      setShowDemoBanner(true);
      sessionStorage.removeItem("demo_banner"); // 1회만
      const t = setTimeout(() => setShowDemoBanner(false), 4500);
      return () => clearTimeout(t);
    }
  }, []);

  // 디테일에서 넘오는 기존 메타데이터 초기화
  useEffect(() => {
    document.title = "Disney+ Renewal";
  }, []);


  // 체험용 게스트면 Row를 최소 구성으로 (2개 추천)
  const rows = useMemo(() => {
    if (isGuest) {
      return [
        { title: "Top Rated", id: "TR", fetchUrl: requests.fetchTopRated, showRank: true },
        { title: "Trending Now", id: "TN", fetchUrl: requests.fetchTrending },
      ];
    }

  // 일반 로그인(또는 기본)일 때는 기존 그대로
    return [
      { title: "Top Rated", id: "TR", fetchUrl: requests.fetchTopRated, showRank: true },
      { title: "Trending Now", id: "TN", fetchUrl: requests.fetchTrending },
      { title: "Action Movies", id: "AM", fetchUrl: requests.fetchActionMovies },
      { title: "Comedy Movies", id: "CM", fetchUrl: requests.fetchComedyMovies },
    ];
  }, [isGuest]);

  return (
    <>
      {showDemoBanner && <DemoBanner onClose={() => setShowDemoBanner(false)} />}

      <Container>
        <Banner />

        {/* 게스트 전용: 섹션 */}
        {isGuest && <DemoActionSection />}

        {/* 게스트는 카테고리 끔 */}
        {!isGuest && <Category/>}

        {rows.map((r) => (
          <Row
            key={r.id}
            title={r.title}
            id={r.id}
            fetchUrl={r.fetchUrl}
            showRank={r.showRank}
          />
        ))}

        {/* 피드백 유도(원하면 게스트는 내부에서 제한/로그인 유도) */}
        <Feedback variant="teaser" isGuest={isGuest} />
        
      </Container>
    </>
  );
};

export default MainPage;

const Container = styled.main`
  position: relative;
  min-height: calc(100vh - 250px);
  overflow-x: hidden;
  display: block;
  padding: 72px calc(3.5vw + 5px) 0;
`;

const DemoBanner = ({ onClose }) => {
  return (
    <DemoWrap role="status" aria-live="polite">
      <DemoInner>
        <Dot />
        <TextBlock>
          <DemoTitle>체험 계정으로 로그인 중</DemoTitle>
          <DemoDesc>일부 기능은 제한될 수 있어요.</DemoDesc>
        </TextBlock>

        <CloseBtn type="button" onClick={onClose} aria-label="배너 닫기">
          ✕
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

  padding: 12px 12px;
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