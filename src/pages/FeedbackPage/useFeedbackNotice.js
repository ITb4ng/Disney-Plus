import { useCallback, useEffect, useState } from "react";
import {
  FeedbackNoticeOverlay,
  FEEDBACK_NOTICE_VARIANTS,
  getFeedbackNoticeAutoClose,
} from "./notice";
import { feedbackMessages } from "./messages";
import { DEBUG_STATES, NOTICE_TYPES } from "./state";

export { FeedbackNoticeOverlay };

export function useFeedbackNotice({ debugState, feedbackNotice, clearLocationStateKey }) {
  const [noticeBox, setNoticeBox] = useState(null);

  const showCreateSuccessNotice = useCallback(
    ({ message = feedbackMessages.createSuccess, persistent = false, source = "action" } = {}) => {
      setNoticeBox({
        type: NOTICE_TYPES.CREATE_SUCCESS,
        variant: FEEDBACK_NOTICE_VARIANTS.SUCCESS,
        message,
        persistent,
        source,
      });
    },
    []
  );

  const showDeleteConfirmNotice = useCallback(
    ({ itemId = null, persistent = false, source = "action" } = {}) => {
      setNoticeBox({
        type: NOTICE_TYPES.DELETE_CONFIRM,
        variant: FEEDBACK_NOTICE_VARIANTS.CONFIRM,
        message: feedbackMessages.deleteConfirm,
        itemId,
        persistent,
        source,
        primaryLabel: "확인",
        primaryPendingLabel: "삭제 중...",
        primaryDisabled: false,
        secondaryLabel: "취소",
      });
    },
    []
  );

  const showDeleteSuccessNotice = useCallback(
    ({ message = feedbackMessages.deleteSuccess, persistent = false, source = "action" } = {}) => {
      setNoticeBox({
        type: NOTICE_TYPES.DELETE_SUCCESS,
        variant: FEEDBACK_NOTICE_VARIANTS.SUCCESS,
        message,
        persistent,
        source,
      });
    },
    []
  );

  const showErrorNotice = useCallback((message, source = "action") => {
    setNoticeBox({
      type: NOTICE_TYPES.ERROR,
      variant: FEEDBACK_NOTICE_VARIANTS.ERROR,
      message,
      source,
    });
  }, []);

  const closeNoticeBox = useCallback(() => {
    setNoticeBox(null);
  }, []);

  useEffect(() => {
    if (debugState === DEBUG_STATES.CREATE_TOAST) {
      showCreateSuccessNotice({ persistent: true, source: "debug" });
      return;
    }

    if (debugState === DEBUG_STATES.DELETE_TOAST) {
      showDeleteConfirmNotice({ persistent: true, source: "debug" });
      return;
    }

    setNoticeBox((current) => (current?.source === "debug" ? null : current));
  }, [debugState, showCreateSuccessNotice, showDeleteConfirmNotice]);

  useEffect(() => {
    if (!noticeBox) return;

    const autoCloseMs = getFeedbackNoticeAutoClose(noticeBox);
    if (!autoCloseMs) return;

    const timerId = window.setTimeout(() => {
      setNoticeBox((current) => (current === noticeBox ? null : current));
    }, autoCloseMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [noticeBox]);

  useEffect(() => {
    if (!feedbackNotice?.message) return;

    setNoticeBox({
      ...feedbackNotice,
      source: feedbackNotice.source ?? "route",
    });

    clearLocationStateKey("feedbackNotice");
  }, [clearLocationStateKey, feedbackNotice]);

  return {
    noticeBox,
    setNoticeBox,
    showCreateSuccessNotice,
    showDeleteConfirmNotice,
    showDeleteSuccessNotice,
    showErrorNotice,
    closeNoticeBox,
  };
}
