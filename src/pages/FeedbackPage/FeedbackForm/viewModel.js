import { feedbackMessages, feedbackValidationMessages } from "../messages";

export const TITLE_MIN_LENGTH = 2;
export const TITLE_MAX_LENGTH = 120;
export const MESSAGE_MIN_LENGTH = 5;
export const MESSAGE_MAX_LENGTH = 5000;

export function getFeedbackDisplayName(userData, isGuest) {
  if (isGuest) return "체험 계정";

  const normalized = String(userData?.displayName || "").trim() || "익명";
  return normalized.slice(0, 40);
}

export function validateFeedbackForm({
  title,
  message,
  meUid,
  isEdit,
  canEdit,
}) {
  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!trimmedTitle || !trimmedMessage) {
    return feedbackMessages.formRequired;
  }

  if (!meUid) {
    return feedbackMessages.loginPending;
  }

  if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    return feedbackValidationMessages.titleMin(TITLE_MIN_LENGTH);
  }

  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    return feedbackValidationMessages.titleMax(TITLE_MAX_LENGTH);
  }

  if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
    return feedbackValidationMessages.messageMin(MESSAGE_MIN_LENGTH);
  }

  if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
    return feedbackValidationMessages.messageMax(MESSAGE_MAX_LENGTH);
  }

  if (isEdit && !canEdit) {
    return feedbackMessages.guestEditForbidden;
  }

  return null;
}

export function getFeedbackFormText(mode) {
  const isCreate = mode === "create";

  return {
    pageLabel: isCreate ? "등록" : "수정",
    submitLabel: isCreate ? "등록" : "수정",
    pendingLabel: isCreate ? "등록 중..." : "수정 중...",
  };
}
