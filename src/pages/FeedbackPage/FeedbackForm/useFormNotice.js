import { useCallback, useEffect, useState } from "react";
import { FEEDBACK_NOTICE_VARIANTS, getFeedbackNoticeAutoClose } from "../notice";

export function useFormNotice() {
  const [noticeBox, setNoticeBox] = useState(null);

  const showFormNotice = useCallback(
    (message, variant = FEEDBACK_NOTICE_VARIANTS.ERROR) => {
      setNoticeBox({
        variant,
        message,
        source: "form",
      });
    },
    []
  );

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

  return {
    noticeBox,
    showFormNotice,
  };
}
