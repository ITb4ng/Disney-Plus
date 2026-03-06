import React from "react";

const SearchEmptyState = ({ mode, term, onRetry }) => {
  if (mode === "idle") {
    return (
      <div className="search-state">
        <p>검색어를 입력하면 결과를 보여드릴게요.</p>
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div className="search-state">
        <p>검색 중...</p>
      </div>
    );
  }

  if (mode === "error") {
    return (
      <div className="search-state search-state--error">
        <p>검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
        <button type="button" onClick={onRetry} className="search-state__retry">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="search-state">
      <p>"{term}"에 대한 검색 결과가 없습니다.</p>
    </div>
  );
};

export default SearchEmptyState;
