import React from "react";

const TYPE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "movie", label: "영화" },
  { value: "tv", label: "시리즈" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "관련도" },
  { value: "latest", label: "최신순" },
  { value: "rating", label: "평점순" },
];

const SearchFilterBar = ({ type, sort, onTypeChange, onSortChange }) => {
  return (
    <section className="search-filter-bar" aria-label="검색 필터">
      <div className="search-filter-bar__group">
        <span className="search-filter-bar__label">콘텐츠 유형</span>
        <div className="search-filter-bar__chips">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${type === option.value ? "is-active" : ""}`}
              onClick={() => onTypeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="search-filter-bar__group search-filter-bar__group--sort">
        <label htmlFor="search-sort" className="search-filter-bar__label">
          정렬
        </label>
        <select
          id="search-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="search-filter-bar__select"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default SearchFilterBar;
