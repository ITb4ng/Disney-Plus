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
import styled, { css, keyframes } from "styled-components";
import { db } from "../../firebase";

const SUPER_UIDS = ["xAoBncJDaUfVvoRWuSzYocD9NiF2"]; // 관리자 UID 목록

const FeedbackPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const auth = useMemo(() => getAuth(), []);
  const meUid = auth.currentUser?.uid ?? null;
  const meEmail = auth.currentUser?.email ?? null;
  const isGuest = useMemo(() => meEmail === "demo@disney.dev", [meEmail]);
  const from = location.state?.from || "/main";
  const fromScrollY = location.state?.scrollY;
  const feedbackListState = useMemo(
    () => (typeof fromScrollY === "number" ? { from, scrollY: fromScrollY } : { from }),
    [from, fromScrollY]
  );

  const [sort, setSort] = useState("new");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const canMutate = !!meUid && !isGuest;

  const fetchList = useCallback(
    async ({ soft = false } = {}) => {
      try {
        if (soft) setRefreshing(true);
        else setLoading(true);

        const dir = sort === "old" ? "asc" : "desc";
        const q = query(collection(db, "feedback"), orderBy("createdAt", dir), limit(30));
        const snap = await getDocs(q);
        setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (error) {
        console.error("feedback list error:", error);
      } finally {
        if (soft) setRefreshing(false);
        else setLoading(false);
      }
    },
    [sort]
  );

  useEffect(() => {
    fetchList({ soft: false });
  }, [fetchList]);

  const removeItem = async (id) => {
    if (!window.confirm("피드백을 삭제할까요?")) return;

    try {
      setPendingId(id);
      await deleteDoc(doc(db, "feedback", id));
      await fetchList({ soft: true });
    } catch (error) {
      console.error("delete error:", error);
    } finally {
      setPendingId(null);
    }
  };

  // 기존 문서와 체험 계정 문서까지 고려해서 표시 이름을 정합니다.
  const resolveAuthor = (item) => {
    if (item?.displayName && String(item.displayName).trim()) return item.displayName;
    if (!item?.uid) return "체험계정";
    return "익명";
  };

  return (
    <PageWrap>
      <TitleH2>피드백</TitleH2>

      {isGuest && (
        <TrialBanner>
          <TrialBannerStrong>체험 계정</TrialBannerStrong>으로 이용 중입니다.
          <TrialBannerSubtle>
            {" "}
            피드백 작성은 가능하지만 수정과 삭제는 제한됩니다.
          </TrialBannerSubtle>
        </TrialBanner>
      )}

      <Toolbar $loading={refreshing}>
        <LeftGroup>
          <Label>정렬</Label>

          <SegWrap className="sort-seg">
            <SegButton
              type="button"
              onClick={() => setSort("new")}
              $active={sort === "new"}
              disabled={refreshing}
              aria-pressed={sort === "new"}
            >
              최신순
            </SegButton>

            <SegButton
              type="button"
              onClick={() => setSort("old")}
              $active={sort === "old"}
              disabled={refreshing}
              aria-pressed={sort === "old"}
            >
              오래된순
            </SegButton>
          </SegWrap>

          <MobileSortRow className="sort-mobile">
            <SortSelect
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              disabled={refreshing}
              aria-label="정렬 기준 선택"
            >
              <option value="new">날짜: 최신순</option>
              <option value="old">날짜: 오래된순</option>
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

          <PrimaryButton
            type="button"
            onClick={() => nav("/feedback/new", { state: feedbackListState })}
          >
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
          items.map((item) => {
            const isSuper = !!meUid && SUPER_UIDS.includes(meUid);
            const isOwner = !!meUid && item.uid === meUid;
            const isTrialPost = item.displayName === "체험계정" || !item.uid;
            const canEdit = isSuper || isOwner;
            const canDelete = isSuper || isOwner;
            const isPending = pendingId === item.id;

            const badge = isTrialPost ? (
              <TrialBadge>게스트</TrialBadge>
            ) : isSuper ? (
              <AdminBadge>관리자</AdminBadge>
            ) : isOwner ? (
              <MineBadge>내 글</MineBadge>
            ) : null;

            const goEdit = () => {
              if (!canEdit || !canMutate) return;
              nav(`/feedback/${item.id}/edit`, { state: feedbackListState });
            };

            const author = resolveAuthor(item);
            const timeText = item.createdAt?.toDate?.()
              ? item.createdAt.toDate().toLocaleString()
              : "";

            return (
              <Card
                key={item.id}
                $clickable={canEdit && canMutate}
                role="button"
                tabIndex={0}
                onClick={goEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") goEdit();
                }}
              >
                <TitleRow>
                  <TitleText>{item.title}</TitleText>

                  <RightInlineGroup>
                    {badge}
                    {canDelete && canMutate && (
                      <DangerButton
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeItem(item.id);
                        }}
                        disabled={isPending || refreshing}
                      >
                        {isPending ? "삭제 중..." : "삭제"}
                      </DangerButton>
                    )}
                  </RightInlineGroup>
                </TitleRow>

                <Message>{item.message}</Message>

                <MetaRow>
                  <MetaItem>{author}</MetaItem>
                  {author && timeText ? <Dot aria-hidden="true">•</Dot> : null}
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
          뒤로가기
        </BackButton>
      </BackWrap>
    </PageWrap>
  );
};

export default FeedbackPage;
const SkeletonList = () => (
  <SkList>
    {Array.from({ length: 5 }).map((_, index) => (
      <SkCard key={index}>
        <SkLineWide />
        <SkLineMid />
        <SkLineSmall />
      </SkCard>
    ))}
  </SkList>
);

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

const PageWrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--nav-h, 72px) + 18px) clamp(16px, 4vw, 24px) 28px;

  @media (max-width: 640px) {
    padding: calc(var(--nav-h, 72px) + 14px) 14px
      calc(24px + 64px + env(safe-area-inset-bottom));
  }
`;

const TitleH2 = styled.h2`
  margin: 0;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 28px;
    line-height: 1.12;
    letter-spacing: -0.02em;
  }
`;

const TrialBanner = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  line-height: 1.6;

  @media (max-width: 640px) {
    margin-top: 10px;
    padding: 10px 11px;
    font-size: 11px;
    line-height: 1.55;
  }
`;

const TrialBannerStrong = styled.strong`
  font-weight: 900;
`;

const TrialBannerSubtle = styled.span`
  opacity: 0.85;
`;

const Toolbar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  flex-wrap: wrap;
  overflow: hidden;
  animation: ${enterUp} 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both;

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
    gap: 10px;
    padding: 12px;
    border-radius: 14px;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  @media (max-width: 640px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    gap: 10px;
  }

  .refresh-desktop {
    @media (max-width: 640px) {
      display: none;
    }
  }
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const SegWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);

  @media (max-width: 640px) {
    display: none;
  }
`;

const SegButton = styled.button`
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid
    ${({ $active }) => ($active ? "rgba(255,255,255,0.14)" : "transparent")};
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.08)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.70)"};
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
`;

const GhostButton = styled.button`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  min-height: 40px;
`;

const PrimaryButton = styled.button`
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  min-height: 40px;

  @media (max-width: 640px) {
    min-height: 42px;
    font-size: 13px;
  }
`;

const DangerButton = styled.button`
  padding: 6px 10px;
  border: 1px solid rgba(255, 90, 90, 0.35);
  border-radius: 999px;
  background: rgba(255, 90, 90, 0.1);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;

  @media (max-width: 640px) {
    min-height: 30px;
    padding: 6px 9px;
    font-size: 10px;
  }
`;

const ListWrap = styled.div`
  position: relative;
  display: grid;
  gap: 10px;
  margin-top: 14px;
`;

const EmptyText = styled.div`
  line-height: 1.6;
  opacity: 0.75;
`;

const Card = styled.div`
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.18);
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  @media (max-width: 640px) {
    padding: 13px;
    border-radius: 12px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
`;

const TitleText = styled.div`
  flex: 1;
  overflow: hidden;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.3;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.35;
    white-space: normal;
  }
`;

const RightInlineGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-end;
    gap: 6px;
  }
`;

const MineBadge = styled.span`
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(2, 214, 232, 0.1);
  color: rgba(255, 255, 255, 0.95);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
`;

const AdminBadge = styled.span`
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 210, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;

const TrialBadge = styled.span`
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
`;

const Message = styled.p`
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.65;
  opacity: 0.86;

  @media (max-width: 640px) {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.58;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.65;

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
    font-size: 11px;
  }
`;

const MetaItem = styled.span`
  white-space: nowrap;
`;

const Dot = styled.span`
  opacity: 0.45;
`;

const Overlay = styled.div`
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

const OverlayText = styled.div`
  font-size: 12px;
  opacity: 0.85;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  animation: ${spin} 0.9s linear infinite;
`;

const BackWrap = styled.div`
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

const BackButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.2s ease;

  @media (max-width: 640px) {
    min-height: 48px;
    padding: 12px 18px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(10px);
    background: rgba(10, 12, 18, 0.72);
    pointer-events: auto;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const SkList = styled.div`
  display: grid;
  gap: 10px;
`;

const SkCard = styled.div`
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.18);
`;

const SkBase = styled.div`
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
`;

const SkLineWide = styled(SkBase)`
  width: 55%;
  margin-bottom: 10px;
`;

const SkLineMid = styled(SkBase)`
  width: 80%;
  margin-bottom: 8px;
`;

const SkLineSmall = styled(SkBase)`
  width: 35%;
`;

const MobileSortRow = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 1fr 42px;
    gap: 8px;
    width: 100%;
    align-items: center;
  }
`;

const SortSelect = styled.select`
  width: 100%;
  min-height: 44px;
  padding: 10px 40px 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.92);
  color-scheme: dark;
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

  option {
    background: #0b0f17;
    color: rgba(255, 255, 255, 0.92);
  }

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

  @media (max-width: 640px) {
    min-height: 42px;
    font-size: 12px;
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 640px) {
    min-width: 42px;
    min-height: 42px;
  }
`;
