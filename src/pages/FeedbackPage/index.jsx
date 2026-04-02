import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import FeedbackContent from "./FeedbackContent";
import FeedbackPageHeader from "./FeedbackPageHeader";
import FeedbackToolbar from "./FeedbackToolbar";
import { feedbackMessages } from "./messages";
import { BackButton, BackButtonArea, PageWrap } from "./styles";
import { useFeedbackDelete } from "./useFeedbackDelete";
import { FeedbackNoticeOverlay, useFeedbackNotice } from "./useFeedbackNotice";
import { applyFeedbackDebugState, DEBUG_STATES, getDebugState } from "./state";
import { getFeedbackPageViewModel } from "./viewModel";

const SUPER_UIDS = ["xAoBncJDaUfVvoRWuSzYocD9NiF2"];

const FeedbackPage = () => {
  const nav = useNavigate();
  const location = useLocation();

  const auth = useMemo(() => getAuth(), []);
  const meUid = auth.currentUser?.uid ?? null;
  const meEmail = auth.currentUser?.email ?? null;
  const debugState = useMemo(() => getDebugState(location.search), [location.search]);
  const isGuest = meEmail === "demo@disney.dev" || debugState === DEBUG_STATES.GUEST;
  const isSuper = !!meUid && SUPER_UIDS.includes(meUid);
  const canMutate = !!meUid && !isGuest;

  const from = location.state?.from || "/main";
  const fromScrollY = location.state?.scrollY;
  const feedbackNotice = location.state?.feedbackNotice;
  const feedbackListState = useMemo(
    () => (typeof fromScrollY === "number" ? { from, scrollY: fromScrollY } : { from }),
    [from, fromScrollY]
  );

  const [sort, setSort] = useState("new");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(false);

  const applyDebugState = useCallback(
    (state) =>
      applyFeedbackDebugState(state, {
        setError,
        setPendingId,
        setItems,
        setLoading,
        setRefreshing,
      }),
    []
  );

  const clearLocationStateKey = useCallback(
    (key) => {
      const nextState = { ...(location.state || {}) };
      delete nextState[key];

      nav(location.pathname + location.search, {
        replace: true,
        state: Object.keys(nextState).length ? nextState : undefined,
      });
    },
    [location.pathname, location.search, location.state, nav]
  );

  const {
    noticeBox,
    setNoticeBox,
    showDeleteConfirmNotice,
    showDeleteSuccessNotice,
    showErrorNotice,
    closeNoticeBox,
  } = useFeedbackNotice({
    debugState,
    feedbackNotice,
    clearLocationStateKey,
  });

  const fetchList = useCallback(
    async ({ soft = false } = {}) => {
      if (applyDebugState(debugState)) return;

      try {
        setError(false);

        if (soft) setRefreshing(true);
        else setLoading(true);

        const snapshot = await getDocs(
          query(
            collection(db, "feedback"),
            orderBy("createdAt", sort === "old" ? "asc" : "desc"),
            limit(30)
          )
        );

        setItems(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      } catch (fetchError) {
        console.error("feedback list error:", fetchError);
        setItems([]);
        setError(true);
        showErrorNotice(feedbackMessages.listFetchError);
      } finally {
        if (soft) setRefreshing(false);
        else setLoading(false);
      }
    },
    [applyDebugState, debugState, showErrorNotice, sort]
  );

  useEffect(() => {
    fetchList({ soft: false });
  }, [fetchList]);

  const openCreateForm = useCallback(() => {
    nav("/feedback/new", { state: feedbackListState });
  }, [feedbackListState, nav]);

  const handleRefresh = useCallback(() => {
    fetchList({ soft: true });
  }, [fetchList]);

  const handleEdit = useCallback(
    (itemId, canEdit) => {
      if (!canEdit || !canMutate) return;
      nav(`/feedback/${itemId}/edit`, { state: feedbackListState });
    },
    [canMutate, feedbackListState, nav]
  );

  const { handleDeleteRequest, noticePrimaryAction, noticeSecondaryAction } =
    useFeedbackDelete({
      fetchList,
      noticeBox,
      setNoticeBox,
      setPendingId,
      pendingId,
      refreshing,
      showDeleteConfirmNotice,
      showDeleteSuccessNotice,
      showErrorNotice,
      closeNoticeBox,
    });

  const pageView = getFeedbackPageViewModel({
    loading,
    itemsCount: items.length,
    meUid,
    isSuper,
    isGuest,
  });

  return (
    <PageWrap>
      <FeedbackNoticeOverlay
        notice={noticeBox}
        onPrimaryAction={noticePrimaryAction}
        onSecondaryAction={noticeSecondaryAction}
      />

      <FeedbackPageHeader debugState={debugState} pageView={pageView} />

      <FeedbackToolbar
        sort={sort}
        refreshing={refreshing}
        onSortChange={setSort}
        onRefresh={handleRefresh}
        onCreate={openCreateForm}
      />

      <FeedbackContent
        loading={loading}
        error={error}
        items={items}
        refreshing={refreshing}
        meUid={meUid}
        isSuper={isSuper}
        canMutate={canMutate}
        pendingId={pendingId}
        onRetry={() => fetchList({ soft: false })}
        onCreate={openCreateForm}
        onEdit={handleEdit}
        onDeleteRequest={handleDeleteRequest}
      />

      <BackButtonArea>
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
          <FiChevronLeft aria-hidden="true" />
          이전 화면
        </BackButton>
      </BackButtonArea>
    </PageWrap>
  );
};

export default FeedbackPage;
