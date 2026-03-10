import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiRefreshCcw } from "react-icons/fi";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import styled, { keyframes, css } from "styled-components";

const SUPER_UIDS = ["xAoBncJDaUfVvoRWuSzYocD9NiF2"]; // ✅ 파일 상단으로 고정

const FeedbackPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const auth = useMemo(() => getAuth(), []);
  const isGuest = useMemo(() => localStorage.getItem("isGuest") === "1", []);
  const meUid = auth.currentUser?.uid ?? null;
  const from = location.state?.from || "/main";
  const fromScrollY = location.state?.scrollY;

  
  const [sort, setSort] = useState("new"); // "new" | "old"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // 최초 로드
  const [refreshing, setRefreshing] = useState(false); // 정렬/새로고침
  const [pendingId, setPendingId] = useState(null); // 삭제 중 id

  const canMutate = !!meUid && !isGuest;

  const fetchList = useCallback(
    async ({ soft = false } = {}) => {
      try {
        if (soft) setRefreshing(true);
        else setLoading(true);

        const dir = sort === "old" ? "asc" : "desc";
        const q = query(
          collection(db, "feedback"),
          orderBy("createdAt", dir),
          limit(30)
        );

        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("feedback list error:", e);
      } finally {
        if (soft) setRefreshing(false);
        else setLoading(false);
      }
    },
    [sort]
  );

  useEffect(() => {
    fetchList({ soft: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) fetchList({ soft: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const removeItem = async (id) => {
    if (!window.confirm("이 피드백을 삭제할까요?")) return;

    try {
      setPendingId(id);
      await deleteDoc(doc(db, "feedback", id));
      await fetchList({ soft: true });
    } catch (e) {
      console.error("delete error:", e);
    } finally {
      setPendingId(null);
    }
  };

  // ✅ 작성자 표시 규칙 (기존 문서/체험 문서까지 커버)
  const resolveAuthor = (it) => {
    if (it?.displayName && String(it.displayName).trim()) return it.displayName;
    if (!it?.uid) return "체험계정"; // uid 자체가 없던 오래된/체험 데이터
    return "익명";
  };

  return (
    <PageWrap>
      <TitleH2>피드백</TitleH2>

      {isGuest && (
        <TrialBanner>
          <strong style={{ fontWeight: 900 }}>체험용 계정</strong>으로 이용 중입니다.
          <span style={{ opacity: 0.85 }}>
            {" "}
            피드백은 작성 가능하지만 수정/삭제는 제한됩니다.
          </span>
        </TrialBanner>
      )}

      <Toolbar $loading={refreshing}>
        <LeftGroup>
          <Label>정렬</Label>

          {/* ✅ 데스크탑/태블릿 */}
          <SegWrap className="sort-seg">
            <SegButton
              type="button"
              onClick={() => setSort("new")}
              $active={sort === "new"}
              disabled={refreshing}
              aria-pressed={sort === "new"}
            >
              최신 순
            </SegButton>

            <SegButton
              type="button"
              onClick={() => setSort("old")}
              $active={sort === "old"}
              disabled={refreshing}
              aria-pressed={sort === "old"}
            >
              가장 오래된 순
            </SegButton>
          </SegWrap>

          {/* ✅ 모바일 */}
          <MobileSortRow className="sort-mobile">
            <SortSelect
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              disabled={refreshing}
              aria-label="정렬 기준 선택"
            >
              <option value="new">날짜: 최신 순</option>
              <option value="old">날짜: 오래된 순</option>
            </SortSelect>

            <IconButton
              type="button"
              onClick={() => fetchList({ soft: true })}
              disabled={refreshing}
              aria-label="새로고침"
              title="새로고침"
            >
              <FiRefreshCcw />
            </IconButton>
          </MobileSortRow>
        </LeftGroup>

        <RightGroup>
          <GhostButton
            className="refresh-desktop"
            type="button"
            onClick={() => fetchList({ soft: true })}
            disabled={refreshing}
          >
            {refreshing ? "새로고침 중..." : "새로고침"}
          </GhostButton>

          <PrimaryButton type="button" onClick={() => nav("/feedback/new")}>
            등록
          </PrimaryButton>
        </RightGroup>
      </Toolbar>

      <ListWrap>
        {refreshing && (
          <Overlay>
            <Spinner />
            <OverlayText>불러오는 중...</OverlayText>
          </Overlay>
        )}

        {loading ? (
          <SkeletonList />
        ) : items.length === 0 ? (
          <EmptyText>등록된 피드백이 없습니다.</EmptyText>
        ) : (
          items.map((it) => {
            const isSuper = !!meUid && SUPER_UIDS.includes(meUid);
            const isOwner = !!meUid && it.uid === meUid;
            const isTrialPost = it.displayName === "체험계정" || !it.uid;

            const canEdit = isSuper || isOwner;
            const canDelete = isSuper || isOwner;
            const isPending = pendingId === it.id;

            // ✅ 배지는 최대 1개만: 관리자 > 내가 작성함 > 체험용
            const BadgeEl = isTrialPost ? (
              <TrialBadge>게스트</TrialBadge>
            ) : isSuper ? (
              <AdminBadge>관리자</AdminBadge>
            ) : isOwner ? (
              <MineBadge>나</MineBadge>
            ) : null;
            
            const goEdit = () => {
              if (!canEdit) return;
              if (!canMutate) return;
              nav(`/feedback/${it.id}/edit`);
            };

            const author = resolveAuthor(it);
            const timeText = it.createdAt?.toDate?.()
              ? it.createdAt.toDate().toLocaleString()
              : "";

            return (
              <Card
                key={it.id}
                $clickable={canEdit && canMutate}
                role="button"
                tabIndex={0}
                onClick={goEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goEdit();
                }}
              >
                <TitleRow>
                  
                  <TitleText>{it.title}</TitleText>

                  {canDelete && (
                    <RightInlineGroup>
                      {BadgeEl}
                      {canMutate && canDelete && (
                        <DangerButton
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(it.id);
                          }}
                          disabled={isPending || refreshing}
                        >
                          {isPending ? "삭제 중..." : "삭제"}
                        </DangerButton>
                      )}
                    </RightInlineGroup>
                  )}
                </TitleRow>

                <Message>{it.message}</Message>

                {/* ✅ 작성자 + 날짜 */}
                <MetaRow>
                  <MetaItem>{author}</MetaItem>
                  {author && timeText ? <Dot aria-hidden="true">·</Dot> : null}
                  <MetaItem>{timeText}</MetaItem>
                </MetaRow>
              </Card>
            );
          })
        )}
      </ListWrap>

      <BackWrap>
        <BackButton
          data-testid="feedback-back-btn"
          onClick={() =>
            nav(from, {
              replace: true,
              state:
                typeof fromScrollY === "number"
                  ? { restoreScroll: true, restoreScrollY: fromScrollY }
                  : undefined,
            })
          }
        >
          ← 뒤로가기
        </BackButton>
      </BackWrap>
    </PageWrap>
  );
};

export default FeedbackPage;

/* =========================
   Skeleton
========================= */
const SkeletonList = () => {
  return (
    <SkList>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkCard key={i}>
          <SkLineWide />
          <SkLineMid />
          <SkLineSmall />
        </SkCard>
      ))}
    </SkList>
  );
};

const enterUp = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.99); filter: blur(2px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
`;

const softPulse = keyframes`
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-1px); }
  100% { transform: translateY(0); }
`;

const sheen = keyframes`
  from { background-position: 0% 0%; }
  to   { background-position: 120% 0%; }
`;

const reduceMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
`;

export const PageWrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--nav-h, 72px) + 18px) clamp(16px, 4vw, 24px) 28px;

  @media (max-width: 640px) {
    padding-bottom: calc(28px + 64px + env(safe-area-inset-bottom));
  }
`;

export const TitleH2 = styled.h2`
  margin: 0;
`;

export const TrialBanner = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.4;
`;

/* =========================
   Toolbar
========================= */

const Toolbar = styled.div`
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  flex-wrap: wrap;

  animation: ${enterUp} 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both;

  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.22;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 35%,
      transparent 70%
    );
    background-size: 220% 100%;
    animation: ${sheen} 2.8s ease-in-out infinite;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      animation: ${enterUp} 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both,
        ${softPulse} 650ms ease-in-out infinite;
    `}

  ${reduceMotion}

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    border-radius: 16px;
  }
`;

export const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  @media (max-width: 640px) {
    justify-content: space-between;
    width: 100%;
  }
`;

export const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 640px) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .refresh-desktop {
    @media (max-width: 640px) {
      display: none;
    }
  }
`;

export const Label = styled.span`
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
`;

export const SegWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.18);

  @media (max-width: 640px) {
    display: none;
  }
`;

export const SegButton = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) => ($active ? "rgba(255,255,255,0.14)" : "transparent")};
  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.08)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.70)"};
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  min-height: 40px;
`;

/* =========================
   Buttons
========================= */

export const GhostButton = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
`;

export const PrimaryButton = styled.button`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
`;

export const DangerButton = styled.button`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 90, 90, 0.35);
  background: rgba(255, 90, 90, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
`;

/* =========================
   List
========================= */

export const ListWrap = styled.div`
  margin-top: 14px;
  position: relative;
  display: grid;
  gap: 10px;
`;

export const EmptyText = styled.div`
  opacity: 0.75;
`;

export const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.18);
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const TitleText = styled.div`
  font-weight: 900;
  font-size: 16px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    white-space: normal;
    line-height: 1.25;
  }
`;

export const RightInlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const MineBadge = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(2, 214, 232, 0.1);
  color: rgba(255, 255, 255, 0.95);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
`;

export const AdminBadge = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 210, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;
export const TrialBadge = styled.span`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;

export const Message = styled.div`
  margin-top: 6px;
  opacity: 0.85;
`;

export const MetaRow = styled.div`
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.65;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const MetaItem = styled.span`
  white-space: nowrap;
`;

export const Dot = styled.span`
  opacity: 0.45;
`;

/* =========================
   Overlay
========================= */

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
  pointer-events: none;
`;

export const OverlayText = styled.div`
  font-size: 12px;
  opacity: 0.85;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: rgba(255, 255, 255, 0.9);
  animation: ${spin} 0.9s linear infinite;
`;

/* =========================
   Back
========================= */

export const BackWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 28px;

  @media (max-width: 640px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(16px + env(safe-area-inset-bottom));
    z-index: 999;
    margin-top: 0;
    pointer-events: none;
  }
`;

export const BackButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s ease;

  @media (max-width: 640px) {
    pointer-events: auto;
    backdrop-filter: blur(10px);
    background: rgba(10, 12, 18, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.14);
    min-height: 48px;
    padding: 12px 18px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

/* =========================
   Skeleton
========================= */

export const SkList = styled.div`
  display: grid;
  gap: 10px;
`;

export const SkCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.18);
`;

export const SkBase = styled.div`
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
`;

export const SkLineWide = styled(SkBase)`
  width: 55%;
  margin-bottom: 10px;
`;

export const SkLineMid = styled(SkBase)`
  width: 80%;
  margin-bottom: 8px;
`;

export const SkLineSmall = styled(SkBase)`
  width: 35%;
`;

/* =========================
   Mobile sort
========================= */

export const MobileSortRow = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 1fr 44px;
    gap: 10px;
    width: 100%;
    align-items: center;
  }
`;

export const SortSelect = styled.select`
  width: 100%;
  min-height: 44px;
  padding: 10px 40px 10px 14px;
  border-radius: 999px;

  color-scheme: dark;

  option {
    background: #0b0f17;
    color: rgba(255, 255, 255, 0.92);
  }

  border: 1px solid rgba(255, 255, 255, 0.14);
  background-color: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.92);

  font-size: 13px;
  font-weight: 800;

  outline: none;
  cursor: pointer;

  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  background-image: url("data:image/svg+xml;utf8,\
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'>\
  <path d='M5 7l5 6 5-6'/>\
  </svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 14px;

  transition: border 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: rgba(2, 214, 232, 0.7);
    box-shadow: 0 0 0 2px rgba(2, 214, 232, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const IconButton = styled.button`
  min-height: 44px;
  min-width: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:active {
    transform: translateY(1px);
  }
`;
