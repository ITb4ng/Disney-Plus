import { FiAlertCircle, FiCheck, FiTrash2 } from "react-icons/fi";
import styled from "styled-components";

export const FEEDBACK_NOTICE_VARIANTS = {
  SUCCESS: "success",
  ERROR: "error",
  CONFIRM: "confirm",
  INFO: "info",
};

const NOTICE_ICONS = {
  [FEEDBACK_NOTICE_VARIANTS.SUCCESS]: FiCheck,
  [FEEDBACK_NOTICE_VARIANTS.ERROR]: FiAlertCircle,
  [FEEDBACK_NOTICE_VARIANTS.CONFIRM]: FiTrash2,
  [FEEDBACK_NOTICE_VARIANTS.INFO]: FiAlertCircle,
};

export function getFeedbackNoticeAutoClose(notice) {
  if (!notice || notice.persistent) return null;
  if (notice.primaryLabel || notice.secondaryLabel) return null;
  if (notice.variant === FEEDBACK_NOTICE_VARIANTS.ERROR) return 1500;
  return 1200;
}

export function FeedbackNoticeOverlay({
  notice,
  onPrimaryAction,
  onSecondaryAction,
}) {
  if (!notice) return null;

  const Icon = NOTICE_ICONS[notice.variant] || FiAlertCircle;
  const isConfirm = notice.variant === FEEDBACK_NOTICE_VARIANTS.CONFIRM;
  const hasActions = Boolean(notice.primaryLabel || notice.secondaryLabel);
  const primaryLabel =
    notice.primaryDisabled && notice.primaryPendingLabel
      ? notice.primaryPendingLabel
      : notice.primaryLabel;

  return (
    <>
      <NoticeBackdrop />

      <NoticeLayer>
        <NoticeCard
          role={isConfirm ? "dialog" : "status"}
          aria-modal={isConfirm ? "true" : undefined}
          aria-live="polite"
        >
          <NoticeIcon $variant={notice.variant}>
            <Icon />
          </NoticeIcon>

          <NoticeText>{notice.message}</NoticeText>

          {hasActions && (
            <NoticeActionRow $double={Boolean(notice.primaryLabel && notice.secondaryLabel)}>
              {notice.secondaryLabel && (
                <NoticeButton
                  type="button"
                  onClick={onSecondaryAction}
                  disabled={notice.secondaryDisabled}
                >
                  {notice.secondaryLabel}
                </NoticeButton>
              )}

              {notice.primaryLabel && (
                <NoticeButton
                  type="button"
                  onClick={onPrimaryAction}
                  disabled={notice.primaryDisabled}
                  $primary
                >
                  {primaryLabel}
                </NoticeButton>
              )}
            </NoticeActionRow>
          )}
        </NoticeCard>
      </NoticeLayer>
    </>
  );
}

const NoticeBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: auto;
  backdrop-filter: blur(4px);
  background: rgba(2, 8, 24, 0.1);
`;

const NoticeLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: grid;
  place-items: center;
  padding: 14px;
`;

const NoticeCard = styled.div`
  width: min(calc(100vw - 28px), 200px);
  min-height: 188px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  padding: 24px 16px 18px;
  border-radius: 24px;
  border: 1px solid rgba(93, 233, 226, 0.16);
  background:
    radial-gradient(circle at 50% -12%, rgba(74, 231, 223, 0.16), transparent 42%),
    radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.04), transparent 18%),
    linear-gradient(180deg, rgba(8, 15, 34, 0.97), rgba(4, 8, 21, 0.96));
  box-shadow:
    0 22px 56px rgba(1, 7, 22, 0.42),
    0 8px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  text-align: center;
`;

const NoticeIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: ${({ $variant }) =>
    $variant === FEEDBACK_NOTICE_VARIANTS.SUCCESS ? "#050b14" : "rgba(235, 246, 255, 0.96)"};
  background: ${({ $variant }) => {
    if ($variant === FEEDBACK_NOTICE_VARIANTS.SUCCESS) {
      return "linear-gradient(180deg, #8ffdf1, #56e4d8)";
    }

    if ($variant === FEEDBACK_NOTICE_VARIANTS.ERROR) {
      return "rgba(52, 17, 24, 0.96)";
    }

    return "rgba(14, 34, 53, 0.96)";
  }};
  box-shadow:
    inset 0 0 0 1px
      ${({ $variant }) => {
        if ($variant === FEEDBACK_NOTICE_VARIANTS.SUCCESS) {
          return "rgba(255, 255, 255, 0.32)";
        }

        if ($variant === FEEDBACK_NOTICE_VARIANTS.ERROR) {
          return "rgba(255, 122, 122, 0.22)";
        }

        return "rgba(143, 253, 241, 0.22)";
      }},
    0 0 0 6px
      ${({ $variant }) => {
        if ($variant === FEEDBACK_NOTICE_VARIANTS.SUCCESS) {
          return "rgba(86, 228, 216, 0.08)";
        }

        if ($variant === FEEDBACK_NOTICE_VARIANTS.ERROR) {
          return "rgba(255, 107, 107, 0.06)";
        }

        return "rgba(86, 228, 216, 0.04)";
      }},
    0 8px 18px rgba(22, 185, 170, 0.18);

  svg {
    width: 17px;
    height: 17px;
    stroke-width: 2.8;
  }
`;

const NoticeText = styled.p`
  margin: 0;
  color: rgba(244, 248, 255, 0.98);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.5;
  letter-spacing: -0.02em;
  text-wrap: balance;
`;

const NoticeActionRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ $double }) => ($double ? "1fr 1fr" : "1fr")};
  gap: 8px;
  margin-top: 2px;
`;

const NoticeButton = styled.button`
  min-height: 38px;
  padding: 10px 0;
  border: 1px solid
    ${({ $primary }) =>
      $primary ? "rgba(93, 233, 226, 0.24)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 999px;
  background: ${({ $primary }) =>
    $primary ? "rgba(93, 233, 226, 0.14)" : "rgba(255, 255, 255, 0.05)"};
  color: rgba(245, 249, 255, 0.96);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: -0.01em;
  cursor: pointer;

  &:disabled {
    opacity: 0.58;
    cursor: not-allowed;
  }
`;
