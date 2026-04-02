export function resolveAuthor(item) {
  if (item?.displayName && String(item.displayName).trim()) {
    return item.displayName;
  }

  if (!item?.uid) return "체험 계정";
  return "익명";
}

export function formatCreatedAt(createdAt) {
  const date = createdAt?.toDate?.();
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export function getBadgeType(item) {
  const isTrialPost = item?.displayName === "체험 계정" || !item?.uid;
  return isTrialPost ? "guest" : null;
}

export function getFeedbackPageViewModel({ loading, itemsCount, meUid, isSuper, isGuest }) {
  const itemCountLabel = loading ? "불러오는 중" : `${itemsCount}건`;

  const accountBadgeLabel = isSuper ? "관리자 계정" : isGuest ? "체험 계정" : "일반 계정";

  const accountBadgeTone = isGuest ? "guest" : isSuper ? "admin" : "default";

  const sectionGuideTitle = isSuper
    ? "관리자 계정으로 전체 피드백을 관리할 수 있습니다."
    : isGuest
      ? "체험 계정도 피드백 등록은 가능합니다."
      : "일반 계정은 등록, 수정, 삭제가 가능합니다.";

  const sectionGuide = isSuper
    ? "전체 피드백을 확인하고 수정과 삭제까지 바로 관리할 수 있습니다."
    : isGuest
      ? "체험 계정은 등록만 가능하며, 작성 후 수정과 삭제는 제한됩니다."
      : "직접 작성한 피드백은 수정과 삭제까지 직접 관리할 수 있습니다.";

  return {
    itemCountLabel,
    accountBadgeLabel,
    accountBadgeTone,
    sectionGuideTitle,
    sectionGuide,
  };
}
