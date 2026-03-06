import React, { useState } from "react";

const KeywordBlock = ({
  title,
  group,
  keywords,
  onPickKeyword,
  onRemoveKeyword,
  onClearKeywords,
}) => {
  return (
    <div className="keyword-block">
      <div className="keyword-block__head">
        <h3>{title}</h3>
        <button
          type="button"
          className="icon-x-button keyword-clear-all"
          onClick={() => onClearKeywords(group)}
          aria-label={`${title} 전체 삭제`}
          disabled={!keywords.length}
        />
      </div>

      {keywords.length ? (
        <div className="keyword-list">
          {keywords.map((keyword) => (
            <div
              key={`${group}-${keyword}`}
              className={`keyword-item ${
                group === "recommended" ? "keyword-item--recommended" : ""
              }`}
            >
              <button
                type="button"
                className="keyword-chip"
                onClick={() => onPickKeyword(keyword)}
              >
                {keyword}
              </button>

              <button
                type="button"
                className="icon-x-button keyword-remove"
                aria-label={`${keyword} 삭제`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveKeyword(group, keyword);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="keyword-empty">{title}가 없습니다.</p>
      )}
    </div>
  );
};

const SearchInput = ({
  value,
  onChange,
  onSubmit,
  recentKeywords,
  recommendedKeywords,
  onPickKeyword,
  onRemoveKeyword,
  onClearKeywords,
}) => {
  const hasValue = value.trim().length > 0;
  const [isMobileKeywordOpen, setIsMobileKeywordOpen] = useState(false);


  const hasAnyKeywords =
    recentKeywords.length > 0 || recommendedKeywords.length > 0;

  return (
    <section className="search-input-wrap">
      
      <form
        className="search-top-input"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
      >
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="검색어를 입력해 주세요"
          aria-label="검색어 입력"
          style={{ fontSize: 16 }}
        />

        {hasValue && (
          <button
            type="button"
            className="search-top-input__clear"
            onClick={() => onChange("")}
            aria-label="검색어 지우기"
          >
            <span className="search-top-input__clear-icon" />
          </button>
        )}
      </form>

      {/* desktop / tablet */}
      <div className="keyword-section">
        <KeywordBlock
          title="최근 검색어"
          group="recent"
          keywords={recentKeywords}
          onPickKeyword={onPickKeyword}
          onRemoveKeyword={onRemoveKeyword}
          onClearKeywords={onClearKeywords}
        />

        <KeywordBlock
          title="추천 검색어"
          group="recommended"
          keywords={recommendedKeywords}
          onPickKeyword={onPickKeyword}
          onRemoveKeyword={onRemoveKeyword}
          onClearKeywords={onClearKeywords}
        />
      </div>
        
      {/* mobile */}
      {hasAnyKeywords && (
        <div className="mobile-keyword-panel">
          <button
            type="button"
            className="mobile-keyword-panel__toggle"
            onClick={() => setIsMobileKeywordOpen((prev) => !prev)}
            aria-expanded={isMobileKeywordOpen}
            aria-label={
              isMobileKeywordOpen
                ? "검색어 패널 접기"
                : "검색어 패널 펼치기"
            }
          >
            <span>최근 / 추천 검색어</span>
            <span
              className={`mobile-keyword-panel__chevron ${
                isMobileKeywordOpen ? "is-open" : ""
              }`}
            />
          </button>

          {isMobileKeywordOpen && (
            <div className="mobile-keyword-panel__body">
              <section className="mobile-keyword-panel__section">
                <div className="mobile-keyword-panel__section-head">
                  <h3>최근 검색어</h3>
                  <button
                    type="button"
                    className="icon-x-button keyword-clear-all"
                    onClick={() => onClearKeywords("recent")}
                    aria-label="최근 검색어 전체 삭제"
                    disabled={!recentKeywords.length}
                  />
                </div>

                {recentKeywords.length ? (
                  <div className="keyword-list">
                    {recentKeywords.map((keyword) => (
                      <div key={`mobile-recent-${keyword}`} className="keyword-item">
                        <button
                          type="button"
                          className="keyword-chip"
                          onClick={() => onPickKeyword(keyword)}
                        >
                          {keyword}
                        </button>

                        <button
                          type="button"
                          className="icon-x-button keyword-remove"
                          aria-label={`${keyword} 삭제`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemoveKeyword("recent", keyword);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="keyword-empty">최근 검색어가 없습니다.</p>
                )}
              </section>

              <div className="mobile-keyword-panel__divider" />

              <section className="mobile-keyword-panel__section">
                <div className="mobile-keyword-panel__section-head">
                  <h3>추천 검색어</h3>
                  <button
                    type="button"
                    className="icon-x-button keyword-clear-all"
                    onClick={() => onClearKeywords("recommended")}
                    aria-label="추천 검색어 전체 삭제"
                    disabled={!recommendedKeywords.length}
                  />
                </div>

                {recommendedKeywords.length ? (
                  <div className="keyword-list">
                    {recommendedKeywords.map((keyword) => (
                      <div
                        key={`mobile-recommended-${keyword}`}
                        className="keyword-item keyword-item--recommended"
                      >
                        <button
                          type="button"
                          className="keyword-chip"
                          onClick={() => onPickKeyword(keyword)}
                        >
                          {keyword}
                        </button>

                        <button
                          type="button"
                          className="icon-x-button keyword-remove"
                          aria-label={`${keyword} 삭제`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemoveKeyword("recommended", keyword);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="keyword-empty">추천 검색어가 없습니다.</p>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchInput;