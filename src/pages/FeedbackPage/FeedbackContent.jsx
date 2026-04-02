import FeedbackCardItem from "./FeedbackCardItem";
import {
  CardList,
  ContentSection,
  FeedbackSkeletonList,
  GhostButton,
  OverlayBox,
  OverlayText,
  PrimaryButton,
  Spinner,
  StateActionRow,
  StateCard,
  StateDescription,
  StateTitle,
} from "./styles";

function FeedbackContent({
  loading,
  error,
  items,
  refreshing,
  meUid,
  isSuper,
  canMutate,
  pendingId,
  onRetry,
  onCreate,
  onEdit,
  onDeleteRequest,
}) {
  return (
    <ContentSection>
      {refreshing && !loading && (
        <OverlayBox>
          <Spinner />
          <OverlayText>불러오는 중...</OverlayText>
        </OverlayBox>
      )}

      {loading ? <FeedbackSkeletonList /> : null}

      {!loading && error ? (
        <StateCard>
          <StateTitle>피드백을 불러오지 못했습니다.</StateTitle>
          <StateDescription>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</StateDescription>
          <StateActionRow>
            <GhostButton type="button" onClick={onRetry}>
              다시 시도
            </GhostButton>
          </StateActionRow>
        </StateCard>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <StateCard>
          <StateTitle>등록된 피드백이 아직 없습니다.</StateTitle>
          <StateDescription>첫 번째 피드백을 남겨 주세요.</StateDescription>
          <StateActionRow>
            <PrimaryButton type="button" onClick={onCreate}>
              피드백 등록하기
            </PrimaryButton>
          </StateActionRow>
        </StateCard>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <CardList>
          {items.map((item) => (
            <FeedbackCardItem
              key={item.id}
              item={item}
              meUid={meUid}
              isSuper={isSuper}
              canMutate={canMutate}
              pendingId={pendingId}
              refreshing={refreshing}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </CardList>
      ) : null}
    </ContentSection>
  );
}

export default FeedbackContent;
