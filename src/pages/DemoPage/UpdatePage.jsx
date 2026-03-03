// 고려해 볼 컴포넌트
import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

// 라우트 하드코딩 방지
const ROUTES = {
  updates: "/updates",
  feedback: "/feedback", 
};

const UpdatePage = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ hooks는 위에서
  const goBack = useCallback(() => nav(-1), [nav]);
  const goFeedback = useCallback(() => nav(ROUTES.feedback), [nav]);

  // /updates 및 하위 경로까지 페이지 판별 
  const isUpdatesRoute = !!matchPath({ path: "/updates/*" }, pathname);

  useEffect(() => {
    let alive = true;

    const fetchUpdates = async () => {
      setLoading(true);
      setErrMsg("");

      try {
        const q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (!alive) return;
        setUpdates(data);
      } catch (err) {
        console.error("🔥 Firestore 읽기 실패:", err);
        if (!alive) return;
        setErrMsg("업데이트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchUpdates();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ UI용으로 데이터 정규화 (title/message/createdAt 필드 기준)
  const items = useMemo(() => {
    return (updates || []).map((u) => {
      const title = u.title ?? "제목 없음";
      const summary = u.summary ?? u.message ?? "";
      const createdAt = u.createdAt?.toDate?.() ?? null;

      return {
        id: u.id,
        title,
        summary,
        createdAt,
      };
    });
  }, [updates]);

  return (
    <PageWrap $isUpdatesRoute={isUpdatesRoute} aria-label="업데이트 페이지">
      <TopBar>
        <Left>
          <TopTitles>
            <Eyebrow>What&apos;s New</Eyebrow>
            <PageTitle>최근 업데이트</PageTitle>
          </TopTitles>
        </Left>

        <Right>
          <PillButton type="button" onClick={goFeedback}>
            의견 남기기
          </PillButton>
        </Right>
      </TopBar>

      <ContentCard>
        {loading && (
          <StateBox>
            <StateTitle>불러오는 중…</StateTitle>
            <StateDesc>Firestore가 느린 건 네 탓은 아니지만, 기다려야 함.</StateDesc>
          </StateBox>
        )}

        {!loading && errMsg && (
          <StateBox>
            <StateTitle>에러</StateTitle>
            <StateDesc>{errMsg}</StateDesc>
          </StateBox>
        )}

        {!loading && !errMsg && items.length === 0 && (
          <StateBox>
            <StateTitle>아직 업데이트가 없어요</StateTitle>
            <StateDesc>첫 공지를 등록하면 여기에 리스트로 뜹니다.</StateDesc>
          </StateBox>
        )}

        {!loading && !errMsg && items.length > 0 && (
          <List>
            {items.map((it) => (
              <ListItem key={it.id}>
                <ItemRow>
                  <IconBox aria-hidden="true" />
                  <ItemBody>
                    <ItemTitle>{it.title}</ItemTitle>
                    {it.summary ? <ItemSummary>{it.summary}</ItemSummary> : null}
                  </ItemBody>
                  <ItemMeta>
                    {it.createdAt ? formatKoreanDateTime(it.createdAt) : "-"}
                  </ItemMeta>
                </ItemRow>
              </ListItem>
            ))}
          </List>
        )}
      </ContentCard>
      <BackButton type="button" onClick={goBack} aria-label="뒤로 가기">
            ←
      </BackButton>
    </PageWrap>
  );
};

export default UpdatePage;

/* =========================
   utils
========================= */

function formatKoreanDateTime(d) {
  // 초까지 필요 없으면 options에서 second 빼도 됨
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================
   styled-components
========================= */

const TOKENS = {
  radius: {
    card: 18,
    item: 14,
    icon: 12,
    pill: 999,
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

// ✅ “nav값 계산”의 핵심: 페이지 상단 여백을 토큰으로 통일
// - 전역에서 --nav-h 를 정의해두면 베스트 (ex: 72px)
// - 없으면 72px 기본값으로 폴백
const PageWrap = styled.main`
  padding: calc(var(--nav-h, 72px) + 18px) 18px 28px;
  max-width: 980px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid ${TOKENS.border.weak};
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;

  &:hover {
    filter: brightness(1.07);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.28);
    outline-offset: 2px;
  }
`;

const TopTitles = styled.div``;

const Eyebrow = styled.div`
  font-size: 13px;
  opacity: 0.75;
`;

const PageTitle = styled.h2`
  margin: 6px 0 0;
  font-size: 22px;
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

const ContentCard = styled.section`
  border-radius: ${TOKENS.radius.card}px;
  overflow: hidden;
  background: ${TOKENS.bg.cardGrad};
  border: 1px solid ${TOKENS.border.weak};
`;

const StateBox = styled.div`
  padding: 18px;
`;

const StateTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
`;

const StateDesc = styled.div`
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.75;
  line-height: 1.5;
`;

const List = styled.div`
  padding: 12px;
`;

const ListItem = styled.div`
  border-radius: ${TOKENS.radius.item}px;
  border: 1px solid ${TOKENS.border.weak};
  background: ${TOKENS.bg.item};
  padding: 12px;
  margin-top: 10px;

  &:first-child {
    margin-top: 0;
  }
`;

const ItemRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
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
  font-weight: 800;
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

const ItemMeta = styled.div`
  font-size: 12px;
  opacity: 0.6;
  white-space: nowrap;
`;