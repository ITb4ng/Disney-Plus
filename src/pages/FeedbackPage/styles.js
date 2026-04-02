import styled, { css, keyframes } from "styled-components";

export const FeedbackSkeletonList = () => (
  <SkeletonGrid>
    {Array.from({ length: 5 }).map((_, index) => (
      <SkeletonCard key={index}>
        <SkeletonLineWide />
        <SkeletonLineMid />
        <SkeletonLineSmall />
      </SkeletonCard>
    ))}
  </SkeletonGrid>
);

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
`;

const badgeStyle = css`
  flex-shrink: 0;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.01em;
  white-space: nowrap;

  @media (max-width: 640px) {
    padding: 5px 10px;
    font-size: 10px;
  }
`;

export const PageWrap = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--nav-h, 72px) + 18px) clamp(16px, 4vw, 24px) 28px;

  @media (max-width: 640px) {
    padding: calc(var(--nav-h, 72px) + 14px) 14px
      calc(120px + env(safe-area-inset-bottom));
  }
`;

export const HeaderBlock = styled.div`
  display: grid;
  gap: 10px;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h2`
  margin: 0;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 28px;
    line-height: 1.12;
    letter-spacing: -0.02em;
  }
`;

export const PageLead = styled.p`
  margin: 0;
  max-width: 640px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.7;
  letter-spacing: -0.01em;

  @media (max-width: 640px) {
    font-size: 13px;
    line-height: 1.6;
  }
`;

export const HeaderMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-wrap: wrap;
  }
`;

export const HeaderMetaChip = styled.span`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 36px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) => {
      if ($tone === "guest") return "rgba(255, 205, 112, 0.2)";
      if ($tone === "admin") return "rgba(2, 214, 232, 0.24)";
      if ($tone === "muted") return "rgba(255, 255, 255, 0.08)";
      return "rgba(255, 255, 255, 0.08)";
    }};
  background: ${({ $tone }) => {
    if ($tone === "guest") return "rgba(255, 205, 112, 0.08)";
    if ($tone === "admin") return "rgba(2, 214, 232, 0.1)";
    return "rgba(255, 255, 255, 0.04)";
  }};
`;

export const HeaderMetaLabel = styled.span`
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
`;

export const HeaderMetaValue = styled.span`
  color: rgba(255, 255, 255, 0.96);
  font-size: 13px;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.015em;
`;

export const DebugBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(2, 214, 232, 0.22);
  background: rgba(2, 214, 232, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 800;
`;

export const SectionGuideCard = styled.div`
  display: grid;
  gap: 6px;
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgba(2, 214, 232, 0.08), transparent 28%),
    rgba(255, 255, 255, 0.03);

  @media (max-width: 640px) {
    margin-top: 12px;
    padding: 13px 14px;
    border-radius: 14px;
  }
`;

export const SectionGuideTitle = styled.div`
  color: rgba(255, 255, 255, 0.94);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
`;

export const SectionGuideText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  line-height: 1.65;
`;

export const ToolbarCard = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  @media (max-width: 640px) {
    justify-content: space-between;
    width: 100%;
  }
`;

export const ToolbarRight = styled.div`
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

export const ToolbarLabel = styled.span`
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const SegmentGroup = styled.div`
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

export const SegmentButton = styled.button`
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

export const MobileSortGroup = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 1fr 42px;
    gap: 8px;
    width: 100%;
    align-items: center;
  }
`;

export const SortSelect = styled.select`
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

export const RefreshIconButton = styled.button`
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

export const GhostButton = styled.button`
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.84);
  }
`;

export const PrimaryButton = styled.button`
  min-height: 40px;
  padding: 10px 16px;
  border: 1px solid rgba(91, 233, 225, 0.28);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(102, 240, 232, 0.28), rgba(39, 186, 178, 0.22));
  color: rgba(246, 252, 255, 0.98);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  box-shadow:
    0 10px 22px rgba(10, 124, 138, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);

  &:hover {
    border-color: rgba(118, 244, 237, 0.38);
    background: linear-gradient(180deg, rgba(118, 244, 237, 0.34), rgba(39, 186, 178, 0.26));
  }

  @media (max-width: 640px) {
    min-height: 42px;
    font-size: 13px;
  }
`;

export const ContentSection = styled.section`
  position: relative;
  margin-top: 14px;
`;

export const OverlayBox = styled.div`
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

export const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  animation: ${spin} 0.9s linear infinite;
`;

export const OverlayText = styled.div`
  font-size: 12px;
  opacity: 0.85;
`;

export const StateCard = styled.div`
  display: grid;
  gap: 8px;
  padding: 18px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);

  @media (max-width: 640px) {
    padding: 16px 14px;
  }
`;

export const StateTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.94);

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const StateDescription = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.68);

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

export const StateActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const CardList = styled.div`
  display: grid;
  gap: 10px;
`;

export const FeedbackCard = styled.article`
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent 28%),
    rgba(0, 0, 0, 0.18);
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  ${({ $clickable }) =>
    $clickable
      ? `
        &:hover {
          border-color: rgba(2, 214, 232, 0.18);
          background:
            radial-gradient(circle at top right, rgba(2, 214, 232, 0.08), transparent 30%),
            rgba(0, 0, 0, 0.2);
        }

        &:focus-visible {
          outline: 2px solid rgba(2, 214, 232, 0.32);
          outline-offset: 2px;
        }
      `
      : ""}

  @media (max-width: 640px) {
    padding: 13px;
    border-radius: 12px;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const CardHeaderInner = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 640px) {
    gap: 10px;
  }
`;

export const TitleBadgeRow = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;

  @media (max-width: 640px) {
    gap: 6px;
  }
`;

export const CardBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
`;

export const CardTitle = styled.div`
  min-width: 0;
  overflow: hidden;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;

  @media (max-width: 640px) {
    font-size: 15px;
    line-height: 1.35;
  }
`;

export const GuestBadge = styled.span`
  ${badgeStyle}
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 205, 112, 0.1);
  color: rgba(255, 255, 255, 0.95);
`;

export const DangerButton = styled.button`
  flex-shrink: 0;
  min-height: 34px;
  padding: 7px 12px;
  border: 1px solid rgba(255, 104, 104, 0.42);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 104, 104, 0.18), rgba(255, 104, 104, 0.1));
  color: rgba(255, 245, 245, 0.98);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.01em;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);

  &:hover {
    border-color: rgba(255, 122, 122, 0.56);
    background: linear-gradient(180deg, rgba(255, 104, 104, 0.24), rgba(255, 104, 104, 0.14));
  }

  @media (max-width: 640px) {
    min-height: 30px;
    padding: 6px 10px;
    font-size: 11px;
  }
`;

export const CardMessage = styled.p`
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.82);
  white-space: pre-wrap;
  word-break: keep-all;

  @media (max-width: 640px) {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.58;
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
`;

export const CardMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 12px;

  @media (max-width: 640px) {
    gap: 5px;
    margin-top: 10px;
  }
`;

export const CardMetaText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;

export const CardMetaLabel = styled.span`
  color: rgba(255, 255, 255, 0.52);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.01em;
`;

export const CardMetaValue = styled.span`
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
`;

export const CardMetaDivider = styled.span`
  color: rgba(255, 255, 255, 0.28);
  font-size: 12px;
  line-height: 1;
`;

export const BackButtonArea = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 28px;

  @media (max-width: 640px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    margin-top: 0;
    pointer-events: none;
    padding: 14px 14px calc(8px + env(safe-area-inset-bottom));

    &::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 52px;
      background: linear-gradient(
        180deg,
        rgba(8, 11, 20, 0) 0%,
        rgba(8, 11, 20, 0.62) 60%,
        rgba(8, 11, 20, 0.82) 100%
      );
      backdrop-filter: blur(4px);
      pointer-events: none;
    }
  }
`;

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;

  @media (max-width: 640px) {
    position: relative;
    z-index: 1;
    width: auto;
    min-height: 40px;
    padding: 10px 14px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 999px;
    backdrop-filter: blur(8px);
    background: rgba(13, 19, 33, 0.64);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.82);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: -0.01em;
    pointer-events: auto;

    svg {
      width: 15px;
      height: 15px;
      opacity: 0.76;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const SkeletonCard = styled.div`
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.18);
`;

const SkeletonBase = styled.div`
  height: 12px;
  border-radius: 999px;
  background:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.12) 22%,
      rgba(255, 255, 255, 0.2) 38%,
      rgba(255, 255, 255, 0.08) 54%,
      rgba(255, 255, 255, 0.06) 100%
    );
  background-size: 220% 100%;
  animation: ${shimmer} 1.6s linear infinite;
`;

const SkeletonLineWide = styled(SkeletonBase)`
  width: 55%;
  margin-bottom: 10px;
`;

const SkeletonLineMid = styled(SkeletonBase)`
  width: 80%;
  margin-bottom: 8px;
`;

const SkeletonLineSmall = styled(SkeletonBase)`
  width: 35%;
`;
