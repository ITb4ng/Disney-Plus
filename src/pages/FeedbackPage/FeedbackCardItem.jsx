import { getBadgeType, formatCreatedAt, resolveAuthor } from "./viewModel";
import {
  CardBadgeRow,
  CardHeader,
  CardHeaderInner,
  CardMessage,
  CardMetaDivider,
  CardMetaLabel,
  CardMetaRow,
  CardMetaText,
  CardMetaValue,
  CardTitle,
  DangerButton,
  FeedbackCard,
  GuestBadge,
  TitleBadgeRow,
} from "./styles";

function FeedbackCardItem({
  item,
  meUid,
  isSuper,
  canMutate,
  pendingId,
  refreshing,
  onEdit,
  onDeleteRequest,
}) {
  const badgeType = getBadgeType(item);
  const isOwner = !!meUid && item.uid === meUid;
  const canEdit = isSuper || isOwner;
  const canDelete = isSuper || isOwner;
  const isPending = pendingId === item.id;
  const author = resolveAuthor(item);
  const createdAt = formatCreatedAt(item.createdAt);

  return (
    <FeedbackCard
      $clickable={canEdit && canMutate}
      role={canEdit && canMutate ? "button" : undefined}
      tabIndex={canEdit && canMutate ? 0 : -1}
      onClick={() => onEdit(item.id, canEdit)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(item.id, canEdit);
        }
      }}
    >
      <CardHeader>
        <CardHeaderInner>
          <TitleBadgeRow>
            <CardTitle title={item.title}>{item.title}</CardTitle>

            <CardBadgeRow>
              {badgeType === "guest" && <GuestBadge>체험계정</GuestBadge>}
            </CardBadgeRow>
          </TitleBadgeRow>

          {canDelete && canMutate && (
            <DangerButton
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteRequest(item.id);
              }}
              disabled={isPending || refreshing}
            >
              {isPending ? "삭제 중..." : "삭제"}
            </DangerButton>
          )}
        </CardHeaderInner>
      </CardHeader>

      <CardMessage title={item.message}>{item.message}</CardMessage>

      <CardMetaRow>
        {author ? (
          <CardMetaText>
            <CardMetaLabel>작성자</CardMetaLabel>
            <CardMetaValue>{author}</CardMetaValue>
          </CardMetaText>
        ) : null}

        {author && createdAt ? <CardMetaDivider aria-hidden="true">·</CardMetaDivider> : null}

        {createdAt ? (
          <CardMetaText>
            <CardMetaLabel>작성일</CardMetaLabel>
            <CardMetaValue>{createdAt}</CardMetaValue>
          </CardMetaText>
        ) : null}
      </CardMetaRow>
    </FeedbackCard>
  );
}

export default FeedbackCardItem;
