import {
  DebugBadge,
  HeaderBlock,
  HeaderMetaChip,
  HeaderMetaLabel,
  HeaderMetaRow,
  HeaderMetaValue,
  HeaderRow,
  PageLead,
  PageTitle,
  SectionGuideCard,
  SectionGuideText,
  SectionGuideTitle,
} from "./styles";

function FeedbackPageHeader({ debugState, pageView }) {
  return (
    <>
      <HeaderBlock>
        <HeaderRow>
          <PageTitle>피드백</PageTitle>
          {debugState && <DebugBadge>debug: {debugState}</DebugBadge>}
        </HeaderRow>

        <PageLead>
          남겨주신 의견은 꼼꼼히 확인하고
          <br />
          더 나은 사용 경험으로 이어질 수 있도록 개선하겠습니다.
        </PageLead>

        <HeaderMetaRow>
          <HeaderMetaChip>
            <HeaderMetaLabel>피드백</HeaderMetaLabel>
            <HeaderMetaValue>{pageView.itemCountLabel}</HeaderMetaValue>
          </HeaderMetaChip>

          <HeaderMetaChip $tone={pageView.accountBadgeTone}>
            <HeaderMetaLabel>접속 계정</HeaderMetaLabel>
            <HeaderMetaValue>{pageView.accountBadgeLabel}</HeaderMetaValue>
          </HeaderMetaChip>
        </HeaderMetaRow>
      </HeaderBlock>

      <SectionGuideCard>
        <SectionGuideTitle>{pageView.sectionGuideTitle}</SectionGuideTitle>
        <SectionGuideText>{pageView.sectionGuide}</SectionGuideText>
      </SectionGuideCard>
    </>
  );
}

export default FeedbackPageHeader;
