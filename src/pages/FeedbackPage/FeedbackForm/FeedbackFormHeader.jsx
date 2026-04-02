import {
  CrumbBlock,
  Breadcrumb,
  CrumbButton,
  CrumbCurrent,
  CrumbSep,
  GhostButton,
  HeadRow,
  TrialBanner,
  TrialBannerStrong,
  TrialBannerSubtle,
} from "./styles";

function FeedbackFormHeader({ mode, isGuest, onBackToList }) {
  return (
    <>
      <HeadRow>
        <CrumbBlock>
          <Breadcrumb aria-label="현재 위치">
            <CrumbButton type="button" onClick={onBackToList}>
              피드백
            </CrumbButton>
            <CrumbSep aria-hidden="true">/</CrumbSep>
            <CrumbCurrent aria-current="page">{mode === "create" ? "등록" : "수정"}</CrumbCurrent>
          </Breadcrumb>
        </CrumbBlock>

        <GhostButton type="button" onClick={onBackToList}>
          목록으로
        </GhostButton>
      </HeadRow>

      {isGuest ? (
        <TrialBanner>
          <TrialBannerStrong>체험 계정</TrialBannerStrong>으로 이용 중입니다.
          <TrialBannerSubtle>
            {" "}
            피드백 등록은 가능하지만 수정과 삭제는 제한됩니다.
          </TrialBannerSubtle>
        </TrialBanner>
      ) : null}
    </>
  );
}

export default FeedbackFormHeader;
