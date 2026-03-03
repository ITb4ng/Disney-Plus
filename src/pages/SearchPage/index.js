import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tmdbAxios from "../../api/tmdbaxios";
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // ✅ 통째로 받기
  const { search } = location;

  // ✅ URL q 파싱
  const urlQ = useMemo(() => new URLSearchParams(search).get("q") ?? "", [search]);

  // ✅ input은 하나의 소스
  const [inputValue, setInputValue] = useState(urlQ);

  // ✅ (요청사항) 프리셋 진입 여부 플래그
  // - 최초 1회만 “프리셋 진입인지” 판별하고 고정
  const didInitPreset = useRef(false);
  const [isPreset, setIsPreset] = useState(false);


  // ✅ URL이 바뀌면 SearchPage input도 동기화
  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  // ✅ 최초 진입 시 “프리셋 진입” 여부 결정
  useEffect(() => {
    if (didInitPreset.current) return;
    didInitPreset.current = true;

    // "q가 있으면 프리셋으로 들어온 것"으로 판단
    // (DemoActionSection에서 q를 넣어주는 케이스)
    setIsPreset(!!urlQ.trim());
  }, [urlQ]);

  // ✅ 검색어는 URL 기준 (네 검색 로직이 debounced=urlQ라 그대로 유지)
  const debounced = useDebounce(urlQ, 450);

  const goDetail = (type, id) => {
    navigate(`/detail/${type}/${id}`, {
      state: { from: location.pathname + location.search },
    });
  };

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

  // ✅ 입력 변화 처리
  // - 유저가 타이핑 시작하면 “프리셋 상태”는 끝났다고 보는 게 자연스러움
  const onChangeQ = (v) => {
    setInputValue(v);

    // ✅ 유저 인터랙션이 발생하면 프리셋 라벨은 꺼버림
    // (단, 첫 렌더에서 urlQ->inputValue 동기화 같은 자동 세팅으로 꺼지지 않게 하려면
    //  input 이벤트에서만 끄는 게 맞음. 지금은 onChange에서만 끄니까 OK.)
    if (isPreset) setIsPreset(false);

    const t = v.trim();

    if (!t) {
      navigate("/search", { replace: true }); // ✅ q 제거하고 search에 머무름
      return;
    }

    navigate(`/search?q=${encodeURIComponent(t)}`, { replace: true }); // ✅ history 폭증 방지
  };

  return (
    <div className="search-page page">
      {/* ✅ 헤더 */}
      <header className="search-header">
        <div className="search-header__left">
          {/* ✅ preset이면 살짝 “체험용” 뉘앙스 추가 가능 */}
          <h2>
            {term ? `검색어 "${term}"` : "검색"}
            {isPreset && term ? <span className="search-header__badge">PRESET</span> : null}
          </h2>

          <p className="search-header__meta">
            {term
              ? isLoading
                ? "검색 중…"
                : `${filteredResults.length}개 결과`
              : isPreset
                ? "추천 검색어가 미리 입력되어 있어요"
                : "검색어를 입력해 주세요"}
          </p>
        </div>

        <button
          type="button"
          className="search-header__close"
          onClick={() => {
            navigate(-1 , { replace: true });
          }}
          aria-label="검색 닫기"
        >
          닫기
        </button>
      </header>

      {/* ✅ 상단 인풋 */}
      <div className="search-top-input">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder={isPreset ? "추천 검색어로 시작했어요" : "검색어를 입력하세요"}
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
            <p>{isPreset ? "추천 검색어로 시작해볼까요?" : "검색어를 입력해 주세요."}</p>
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

            const img = item.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
              : item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : "";

            return (
              <button
                className="card"
                key={`${item.media_type}-${item.id}`}
                type="button"
                onClick={() => goDetail(item.media_type, item.id)}
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