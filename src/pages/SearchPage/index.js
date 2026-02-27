import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tmdbAxios from "../../api/tmdbaxios";
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();

  const urlQ = useMemo(() => new URLSearchParams(search).get("q") ?? "", [search]);
  const [inputValue, setInputValue] = useState(urlQ);

  // URL이 바뀌면(데스크탑 nav input으로 검색 등) SearchPage input도 동기화
  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  const debounced = useDebounce(urlQ, 450);

  useEffect(() => {
    const term = (debounced ?? "").trim();

    if (!term) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    let alive = true;

    const run = async () => {
      try {
        setIsLoading(true);
        const res = await tmdbAxios.get("", {
          params: {
            path: "search/multi",
            include_adult: false,
            query: term,
            language: "ko-KR",
          },
        });

        if (!alive) return;
        setSearchResults(Array.isArray(res.data?.results) ? res.data.results : []);
      } catch (e) {
        console.log("search error:", e);
        if (!alive) return;
        setSearchResults([]);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [debounced]);

  const filteredResults = useMemo(() => {
    return searchResults.filter(
      (item) =>
        item.media_type !== "person" &&
        (item.backdrop_path !== null || item.poster_path !== null)
    );
  }, [searchResults]);

  const term = urlQ.trim();

  const onChangeQ = (v) => {
    setInputValue(v);
    const t = v.trim();

    if (!t) {
      navigate("/search", { replace: true }); // ✅ q 제거하고 search에 머무름
      return;
    }

    navigate(`/search?q=${encodeURIComponent(t)}`, { replace: true }); // ✅ history 폭증 방지
  };

  return (
    <div className="search-page page">
      {/* ✅ 헤더: 좌측 정보, 우측 닫기(모든 디바이스 공통) */}
      <header className="search-header">
        <div className="search-header__left">
          <h2>{term ? `검색어 "${term}"` : "검색"}</h2>
          <p className="search-header__meta">
            {term ? (isLoading ? "검색 중…" : `${filteredResults.length}개 결과`) : "검색어를 입력해 주세요"}
          </p>
        </div>

        <button
          type="button"
          className="search-header__close"
          onClick={() => {
            // ✅ 검색 종료 = 메인으로 복귀
            navigate("/main", { replace: true });
          }}
          aria-label="검색 닫기"
        >
          닫기
        </button>
      </header>

      {/* ✅ 모바일용 상단 인풋 (데스크탑에서는 CSS로 숨겨도 됨) */}
      <div className="search-top-input">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder="검색어를 입력하세요"
          aria-label="검색어 입력"
          style={{ fontSize: 16 }} // ✅ iOS 줌 방지
        />
        {inputValue && (
          <button
            type="button"
            className="search-top-input__clear"
            onClick={() => onChangeQ("")}
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      <section className="search-container">
        {!term ? (
          <div className="no-results__text">
            <p>검색어를 입력해 주세요.</p>
          </div>
        ) : isLoading ? (
          <div className="no-results__text">
            <p>검색 중…</p>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((item) => {
            const title = item.title || item.name || "제목 없음";
            const date = item.release_date || item.first_air_date || "";
            const year = date ? date.slice(0, 4) : "";
            const typeLabel = item.media_type === "tv" ? "시리즈" : "영화";

            const img =
              item.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                : item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : "";

            return (
              <button
                className="card"
                key={`${item.media_type}-${item.id}`}
                type="button"
                onClick={() => navigate(`/detail/${item.media_type}/${item.id}`)}
                aria-label={`${title} 상세로 이동`}
              >
                <div className="card__media">
                  {img ? (
                    <img src={img} alt={title} loading="lazy" />
                  ) : (
                    <div className="card__fallback">No Image</div>
                  )}

                  <div className="card__overlay">
                    <div className="card__title" title={title}>
                      {title}
                    </div>
                    <div className="card__meta">
                      {typeLabel}
                      {year ? ` · ${year}` : ""}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="no-results__text">
            <p>검색어 "{term}" 에 맞는 결과가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;