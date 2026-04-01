export const DEBUG_STATES = {
  LOADING: "loading",
  EMPTY: "empty",
  ERROR: "error",
  GUEST: "guest",
  REFRESHING: "refreshing",
  CREATE_TOAST: "create-toast",
  DELETE_TOAST: "delete-toast",
};

export const NOTICE_TYPES = {
  CREATE_SUCCESS: "create-success",
  UPDATE_SUCCESS: "update-success",
  DELETE_CONFIRM: "delete-confirm",
  DELETE_SUCCESS: "delete-success",
  ERROR: "error",
};

export const DEBUG_SAMPLE_ITEMS = [
  {
    id: "debug-1",
    uid: "sample-user-1",
    displayName: "블루미키",
    title: "피드백 카드의 정보 계층이 조금 더 또렷하면 좋겠어요",
    message:
      "모바일에서는 제목과 메타 정보가 너무 가까우면 읽기 어렵습니다. 제목, 본문, 메타 순서가 더 분명하게 보이면 훨씬 좋을 것 같아요.",
    createdAt: {
      toDate: () => new Date(),
    },
  },
  {
    id: "debug-2",
    uid: null,
    displayName: "체험 계정",
    title: "체험 계정 안내 문구가 더 짧고 직관적이면 좋겠습니다",
    message:
      "수정과 삭제 제한이 있다는 점은 잘 보이는데, 지금 내 계정 상태가 무엇인지도 함께 더 자연스럽게 보이면 좋겠어요.",
    createdAt: {
      toDate: () => new Date(Date.now() - 1000 * 60 * 60),
    },
  },
];

export function getDebugState(search) {
  const params = new URLSearchParams(search);
  const value = params.get("debug");

  if (!value) return null;

  const allowed = Object.values(DEBUG_STATES);
  return allowed.includes(value) ? value : null;
}

export function applyFeedbackDebugState(state, setters) {
  const { setError, setPendingId, setItems, setLoading, setRefreshing } = setters;

  setError(false);
  setPendingId(null);

  if (state === DEBUG_STATES.LOADING) {
    setItems([]);
    setLoading(true);
    setRefreshing(false);
    return true;
  }

  if (state === DEBUG_STATES.EMPTY) {
    setItems([]);
    setLoading(false);
    setRefreshing(false);
    return true;
  }

  if (state === DEBUG_STATES.ERROR) {
    setItems([]);
    setLoading(false);
    setRefreshing(false);
    setError(true);
    return true;
  }

  if (state === DEBUG_STATES.GUEST) {
    setItems(DEBUG_SAMPLE_ITEMS);
    setLoading(false);
    setRefreshing(false);
    return true;
  }

  if (state === DEBUG_STATES.REFRESHING) {
    setItems(DEBUG_SAMPLE_ITEMS);
    setLoading(false);
    setRefreshing(true);
    return true;
  }

  return false;
}
