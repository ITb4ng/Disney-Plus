import React from "react";

const SearchHeader = ({ term, resultCount, isFetching, onClose }) => {
  return (
    <header className="search-header">
      <div className="search-header__left">
        <h2>{term ? `검색어 "${term}"` : "검색"}</h2>
        <p className="search-header__meta">
          {term
            ? isFetching
              ? "검색 중..."
              : `${resultCount}개 결과`
            : "검색어를 입력해 주세요"}
        </p>
      </div>

      <button
        type="button"
        className="search-header__close"
        onClick={onClose}
        aria-label="검색 닫기"
      >
        <span>닫기</span>
      </button>
    </header>
  );
};

export default SearchHeader;
