import { useCallback } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { feedbackMessages } from "./messages";
import { NOTICE_TYPES } from "./state";

export function useFeedbackDelete({
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
}) {
  const handleDeleteRequest = useCallback(
    (itemId) => {
      if (pendingId || refreshing) return;
      showDeleteConfirmNotice({ itemId });
    },
    [pendingId, refreshing, showDeleteConfirmNotice]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!noticeBox || noticeBox.type !== NOTICE_TYPES.DELETE_CONFIRM) return;

    if (noticeBox.source === "debug") {
      showDeleteSuccessNotice({ persistent: true, source: "debug" });
      return;
    }

    const targetId = noticeBox.itemId;
    if (!targetId) return;

    try {
      setPendingId(targetId);
      setNoticeBox((current) =>
        current?.type === NOTICE_TYPES.DELETE_CONFIRM
          ? { ...current, primaryDisabled: true }
          : current
      );

      await deleteDoc(doc(db, "feedback", targetId));
      await fetchList({ soft: true });
      showDeleteSuccessNotice();
    } catch (deleteError) {
      console.error("delete error:", deleteError);
      showErrorNotice(feedbackMessages.deleteFailure);
    } finally {
      setPendingId(null);
    }
  }, [fetchList, noticeBox, setNoticeBox, setPendingId, showDeleteSuccessNotice, showErrorNotice]);

  const noticePrimaryAction =
    noticeBox?.type === NOTICE_TYPES.DELETE_CONFIRM ? handleDeleteConfirm : undefined;
  const noticeSecondaryAction =
    noticeBox?.type === NOTICE_TYPES.DELETE_CONFIRM ? closeNoticeBox : undefined;

  return {
    handleDeleteRequest,
    noticePrimaryAction,
    noticeSecondaryAction,
  };
}
