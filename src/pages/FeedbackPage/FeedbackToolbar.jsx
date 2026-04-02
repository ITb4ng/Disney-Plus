import { FiRefreshCcw } from "react-icons/fi";
import {
  GhostButton,
  MobileSortGroup,
  PrimaryButton,
  RefreshIconButton,
  SegmentButton,
  SegmentGroup,
  SortSelect,
  ToolbarCard,
  ToolbarLabel,
  ToolbarLeft,
  ToolbarRight,
} from "./styles";

function FeedbackToolbar({ sort, refreshing, onSortChange, onRefresh, onCreate }) {
  return (
    <ToolbarCard>
      <ToolbarLeft>
        <ToolbarLabel>정렬</ToolbarLabel>

        <SegmentGroup>
          <SegmentButton
            type="button"
            onClick={() => onSortChange("new")}
            $active={sort === "new"}
            disabled={refreshing}
            aria-pressed={sort === "new"}
          >
            최신순
          </SegmentButton>

          <SegmentButton
            type="button"
            onClick={() => onSortChange("old")}
            $active={sort === "old"}
            disabled={refreshing}
            aria-pressed={sort === "old"}
          >
            오래된 순
          </SegmentButton>
        </SegmentGroup>

        <MobileSortGroup>
          <SortSelect
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            disabled={refreshing}
            aria-label="정렬 기준 선택"
          >
            <option value="new">날짜: 최신순</option>
            <option value="old">날짜: 오래된 순</option>
          </SortSelect>

          <RefreshIconButton
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="새로고침"
            title="새로고침"
          >
            <FiRefreshCcw />
          </RefreshIconButton>
        </MobileSortGroup>
      </ToolbarLeft>

      <ToolbarRight>
        <GhostButton
          className="refresh-desktop"
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "새로고침 중..." : "새로고침"}
        </GhostButton>

        <PrimaryButton type="button" onClick={onCreate}>
          등록
        </PrimaryButton>
      </ToolbarRight>
    </ToolbarCard>
  );
}

export default FeedbackToolbar;
