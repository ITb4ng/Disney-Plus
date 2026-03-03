// Update.jsx
import React, { useMemo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, matchPath } from "react-router-dom";

/**
 * props
 * - variant: "teaser" | "page"  (기본 teaser)
 * - isGuest: boolean (게스트 전용 노출 제어용)
 * - updates: [{ id, title, summary, date }] (없으면 더미)
 */

const ROUTES = {
  updates: "/updates",
  // 확장 여지 (필요하면 사용)
  // updateDetail: (id) => `/updates/${id}`,
};

const VARIANT = {
  TEASER: "teaser",
  PAGE: "page",
};

const MAX_ITEMS = 3;

/**
 * ✅ 더미 데이터(체험 가이드형)
 * - "최근 개선사항" 느낌 대신
 * - "유저가 지금 뭘 하면 되는지" 안내하는 톤
 */
const DEFAULT_GUIDE_ITEMS = [
  {
    id: "g1",
    title: "검색으로 콘텐츠 찾아보기",
    summary: "상단 검색창에서 영화/시리즈를 검색해보고, 결과에서 디테일 페이지로 이동해보세요.",
    date: "TIP",
  },
  {
    id: "g2",
    title: "디테일 페이지 인터랙션 확인",
    summary: "비네팅/스크롤 연출과 정보 레이아웃을 확인해보세요. 모바일에서도 흐트러짐 없이 유지됩니다.",
    date: "TIP",
  },
  {
    id: "g3",
    title: "반응형 레이아웃 테스트",
    summary: "창 크기를 줄이거나 모바일에서 접속해보세요. Nav / Row / Banner가 자연스럽게 재배치됩니다.",
    date: "TIP",
  },
];

const Update = ({ variant = VARIANT.TEASER, isGuest = true, updates = null }) => {
  const nav = useNavigate();
  const { pathname } = useLocation();

  // ✅ Hook은 조건문보다 위
  const goUpdates = useCallback(() => nav(ROUTES.updates), [nav]);

  const items = useMemo(() => {
    const src =
      Array.isArray(updates) && updates.length ? updates : DEFAULT_GUIDE_ITEMS;
    return src.slice(0, MAX_ITEMS);
  }, [updates]);

  // ✅ 그 다음에 조건부 return
  if (!isGuest && variant === VARIANT.TEASER) return null;

  // ✅ 라우트가 /updates 또는 하위 경로(/updates/...)인지까지 커버
  const isUpdatesRoute = !!matchPath({ path: "/updates/*" }, pathname);

  // 라우트 페이지에서 사용 중이면, 상단 타이틀/레이아웃만 조금 다르게
  const isPage = variant === VARIANT.PAGE || isUpdatesRoute;

  return (
    <Section $isPage={isPage} aria-label="체험 가이드">
      <Card>
        {/* 헤더 */}
        <Header>
          <HeaderLeft>
            <Eyebrow>이렇게 체험해 보세요</Eyebrow>
            <Title $isPage={isPage}>주요 기능 안내</Title>
            <SubTitle>
              이 프로젝트에서 구현된 핵심 기능을 빠르게 둘러볼 수 있어요.
            </SubTitle>
          </HeaderLeft>

          <PillButton type="button" onClick={goUpdates}>
            전체 가이드 보기
          </PillButton>
        </Header>

        {/* 리스트 */}
        <List>
          {items.map((it) => (
            <ItemButton
              key={it.id}
              type="button"
              onClick={goUpdates}
              aria-label={`${it.title} 자세히 보기`}
            >
              <ItemRow>
                <IconBox aria-hidden="true" />
                <ItemBody>
                  <ItemTitle>{it.title}</ItemTitle>
                  <ItemSummary>{it.summary}</ItemSummary>
                </ItemBody>
                <ItemDate>{it.date}</ItemDate>
              </ItemRow>
            </ItemButton>
          ))}
        </List>

        {/* 푸터(페이지일 때만) */}
        {isPage && (
          <Footer>
            <FooterText>
              체험 중 불편한 점이 있으면 피드백으로 남겨주세요. 빠르게 반영합니다.
            </FooterText>
            <PillButton type="button" onClick={goUpdates}>
              피드백 남기기
            </PillButton>
          </Footer>
        )}
      </Card>
    </Section>
  );
};

export default Update;

/* =========================
   Styled Components (tokens)
========================= */

const TOKENS = {
  radius: {
    card: 16,
    item: 12,
    icon: 10,
    pill: 999,
  },
  space: {
    teaserTop: 14,
    pageTop: 24,
    teaserBottom: 16,
    pageBottom: 28,
  },
  border: {
    weak: "rgba(255,255,255,0.08)",
    mid: "rgba(255,255,255,0.15)",
  },
  bg: {
    cardGrad:
      "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
    item: "rgba(0,0,0,0.15)",
    pill: "rgba(255,255,255,0.06)",
    iconGrad:
      "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
  },
};

const Section = styled.section`
  margin-top: ${(p) =>
    p.$isPage ? `${TOKENS.space.pageTop}px` : `${TOKENS.space.teaserTop}px`};
  margin-bottom: ${(p) =>
    p.$isPage ? `${TOKENS.space.pageBottom}px` : `${TOKENS.space.teaserBottom}px`};
  padding: 0;
`;

const Card = styled.div`
  border-radius: ${TOKENS.radius.card}px;
  overflow: hidden;
  background: ${TOKENS.bg.cardGrad};
  border: 1px solid ${TOKENS.border.weak};
`;

const Header = styled.div`
  padding: 18px 18px 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.div`
  font-size: 14px;
  opacity: 0.85;
`;

const Title = styled.h2`
  margin: 6px 0 0;
  font-size: ${(p) => (p.$isPage ? "22px" : "18px")};
`;

const SubTitle = styled.div`
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.72;
  line-height: 1.45;
  max-width: 560px;
`;

const PillButton = styled.button`
  cursor: pointer;
  border-radius: ${TOKENS.radius.pill}px;
  padding: 10px 14px;
  border: 1px solid ${TOKENS.border.mid};
  background: ${TOKENS.bg.pill};
  color: inherit;
  font-size: 13px;
  white-space: nowrap;
  flex: 0 0 auto;

  &:hover {
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.32);
    outline-offset: 2px;
  }
`;

const List = styled.div`
  padding: 0 12px 14px;
`;

const ItemButton = styled.button`
  width: 100%;
  text-align: left;
  cursor: pointer;
  padding: 12px 12px;
  margin-top: 10px;
  border-radius: ${TOKENS.radius.item}px;
  border: 1px solid ${TOKENS.border.weak};
  background: ${TOKENS.bg.item};
  color: inherit;

  &:hover {
    filter: brightness(1.06);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }
`;

const ItemRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const IconBox = styled.div`
  width: 42px;
  height: 42px;
  border-radius: ${TOKENS.radius.icon}px;
  flex: 0 0 auto;
  background: ${TOKENS.bg.iconGrad};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const ItemSummary = styled.div`
  font-size: 12px;
  opacity: 0.75;
  margin-top: 4px;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ItemDate = styled.div`
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
`;

const Footer = styled.div`
  padding: 14px 18px 18px;
  border-top: 1px solid ${TOKENS.border.weak};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const FooterText = styled.div`
  font-size: 13px;
  opacity: 0.8;
`;