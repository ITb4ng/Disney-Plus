import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import tmdbAxios from "../../api/tmdbaxios";
import { useDebounce } from "../../hooks/useDebounce";

import SearchHeader from "./components/SearchHeader";
import SearchInput from "./components/SearchInput";
import SearchFilterBar from "./components/SearchFilterBar";
import SearchResultGrid from "./components/SearchResultGrid";
import SearchEmptyState from "./components/SearchEmptyState";
import { useSearchTransition } from "../../contexts/SearchTransitionContext";

import "./SearchPage.css";

const VALID_TYPES = ["all", "movie", "tv"];
const VALID_SORTS = ["relevance", "latest", "rating"];
const RECENT_KEYWORDS_KEY = "search_recent_keywords_v1";
const RECOMMENDED_KEYWORDS_KEY = "search_recommended_keywords_v1";
const MAX_RECENT_KEYWORDS = 5;
const DEFAULT_RECOMMENDED = ["마블", "디즈니", "픽사", "스타워즈", "애니메이션"];

const normalizeType = (value) => (VALID_TYPES.includes(value) ? value : "all");
const normalizeSort = (value) => (VALID_SORTS.includes(value) ? value : "relevance");

const parseKeywordList = (storageKey, fallback = []) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;

    return parsed
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT_KEYWORDS);
  } catch {
    return fallback;
  }
};

const saveKeywordList = (storageKey, keywords) => {
  localStorage.setItem(storageKey, JSON.stringify(keywords));
};

const upsertKeyword = (list, keyword) => {
  const trimmed = keyword.trim();
  if (!trimmed) return list;
  return [trimmed, ...list.filter((item) => item !== trimmed)].slice(
    0,
    MAX_RECENT_KEYWORDS
  );
};

const sortResults = (results, sort) => {
  if (sort === "relevance") return results;

  const list = [...results];

  if (sort === "latest") {
    list.sort((a, b) => {
      const aDate = new Date(
        a.release_date || a.first_air_date || "1900-01-01"
      ).getTime();
      const bDate = new Date(
        b.release_date || b.first_air_date || "1900-01-01"
      ).getTime();
      return bDate - aDate;
    });
    return list;
  }

  list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  return list;
};

const fetchSearchResults = async ({ queryTerm, type, sort }) => {
  const path =
    type === "movie" ? "search/movie" : type === "tv" ? "search/tv" : "search/multi";

  const response = await tmdbAxios.get("", {
    params: {
      path,
      query: queryTerm,
      include_adult: false,
      language: "ko-KR",
    },
  });

  const rawResults = Array.isArray(response.data?.results)
    ? response.data.results
    : [];

  const filtered = rawResults
    .map((item) => {
      if (type === "movie") return { ...item, media_type: "movie" };
      if (type === "tv") return { ...item, media_type: "tv" };
      return item;
    })
    .filter((item) => {
      const mediaType = item.media_type;
      const isContent = mediaType === "movie" || mediaType === "tv";
      const hasImage = Boolean(item.backdrop_path || item.poster_path);
      return isContent && hasImage;
    });

  return sortResults(filtered, sort);
};

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { transitionToken, transitionSource } = useSearchTransition();
  const [isEntering, setIsEntering] = useState(false);

  const from = location.state?.from || "/main";

  const rawType = searchParams.get("type") || "all";
  const rawSort = searchParams.get("sort") || "relevance";
  const type = normalizeType(rawType);
  const sort = normalizeSort(rawSort);
  const term = (searchParams.get("q") || "").trim();

  const [inputValue, setInputValue] = useState(term);
  const skipNextDebounceSyncRef = useRef(false);
  const [recentKeywords, setRecentKeywords] = useState(() =>
    parseKeywordList(RECENT_KEYWORDS_KEY, [])
  );
  const [recommendedKeywords, setRecommendedKeywords] = useState(() =>
    parseKeywordList(RECOMMENDED_KEYWORDS_KEY, DEFAULT_RECOMMENDED)
  );

  const debouncedInput = useDebounce(inputValue, 450);

  const updateSearchParams = useCallback(
    (nextTerm, replace = true, nextType = type, nextSort = sort) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextTerm) {
            next.set("q", nextTerm);
          } else {
            next.delete("q");
          }
          next.set("type", normalizeType(nextType));
          next.set("sort", normalizeSort(nextSort));
          return next;
        },
        { replace }
      );
    },
    [setSearchParams, sort, type]
  );

  const addRecentKeyword = useCallback((keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setRecentKeywords((prev) => {
      const next = upsertKeyword(prev, trimmed);
      saveKeywordList(RECENT_KEYWORDS_KEY, next);
      return next;
    });

    setRecommendedKeywords((prev) => {
      const next = upsertKeyword(prev, trimmed);
      saveKeywordList(RECOMMENDED_KEYWORDS_KEY, next);
      return next;
    });
  }, []);

  const handleRemoveKeyword = useCallback((group, keyword) => {
    if (group === "recent") {
      setRecentKeywords((prev) => {
        const next = prev.filter((item) => item !== keyword);
        saveKeywordList(RECENT_KEYWORDS_KEY, next);
        return next;
      });
      return;
    }

    setRecommendedKeywords((prev) => {
      const next = prev.filter((item) => item !== keyword);
      saveKeywordList(RECOMMENDED_KEYWORDS_KEY, next);
      return next;
    });
  }, []);

  const handleClearKeywords = useCallback((group) => {
    if (group === "recent") {
      setRecentKeywords([]);
      saveKeywordList(RECENT_KEYWORDS_KEY, []);
      return;
    }

    setRecommendedKeywords([]);
    saveKeywordList(RECOMMENDED_KEYWORDS_KEY, []);
  }, []);

  useEffect(() => {
    setInputValue(term);
  }, [term]);

  useEffect(() => {
    const shouldAnimate =
      transitionSource === "nav" || transitionSource === "demo-action";
    if (!shouldAnimate) return;

    setIsEntering(true);
    const timer = window.setTimeout(() => {
      setIsEntering(false);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [transitionSource, transitionToken]);

  useEffect(() => {
    if (rawType === type && rawSort === sort) return;
    updateSearchParams(term, true, type, sort);
  }, [rawType, rawSort, sort, term, type, updateSearchParams]);

  useEffect(() => {
    const nextTerm = debouncedInput.trim();
    if (skipNextDebounceSyncRef.current) {
      skipNextDebounceSyncRef.current = false;
      return;
    }
    if (nextTerm === term) return;
    updateSearchParams(nextTerm, true);
  }, [debouncedInput, term, updateSearchParams]);

  const searchQuery = useQuery({
    queryKey: ["search", term, type, sort],
    enabled: term.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    queryFn: () => fetchSearchResults({ queryTerm: term, type, sort }),
  });

  useEffect(() => {
    if (!term || !searchQuery.isSuccess) return;
    addRecentKeyword(term);
  }, [addRecentKeyword, searchQuery.isSuccess, term]);

  const handleSearchSubmit = useCallback(
    (value) => {
      const nextTerm = value.trim();
      skipNextDebounceSyncRef.current = true;
      setInputValue(nextTerm);
      updateSearchParams(nextTerm, false);
      if (nextTerm) addRecentKeyword(nextTerm);
    },
    [addRecentKeyword, updateSearchParams]
  );

  const handlePickKeyword = useCallback(
    (keyword) => {
      const nextTerm = keyword.trim();
      if (!nextTerm) return;
      skipNextDebounceSyncRef.current = true;
      setInputValue(nextTerm);
      updateSearchParams(nextTerm, false);
      addRecentKeyword(nextTerm);
    },
    [addRecentKeyword, updateSearchParams]
  );

  const handleTypeChange = useCallback(
    (nextType) => {
      updateSearchParams(term, true, nextType, sort);
    },
    [sort, term, updateSearchParams]
  );

  const handleSortChange = useCallback(
    (nextSort) => {
      updateSearchParams(term, true, type, nextSort);
    },
    [term, type, updateSearchParams]
  );

  const goDetail = useCallback(
    (mediaType, movieId) => {
      navigate(`/detail/${mediaType}/${movieId}`, {
        state: { from: location.pathname + location.search },
      });
    },
    [location.pathname, location.search, navigate]
  );

  const results = searchQuery.data || [];
  const hasResults = results.length > 0;

  let stateMode = "idle";
  if (term && searchQuery.isPending && !searchQuery.data) stateMode = "loading";
  if (searchQuery.isError) stateMode = "error";
  if (term && !searchQuery.isPending && !searchQuery.isError && !hasResults) {
    stateMode = "empty";
  }

  return (
    <div className={`search-page page ${isEntering ? "search-page--entering" : ""}`}>
      <SearchHeader
        term={term}
        resultCount={results.length}
        isFetching={searchQuery.isFetching}
        onClose={() => navigate(from, { replace: true })}
      />

      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSearchSubmit}
        recentKeywords={recentKeywords}
        recommendedKeywords={recommendedKeywords}
        onPickKeyword={handlePickKeyword}
        onRemoveKeyword={handleRemoveKeyword}
        onClearKeywords={handleClearKeywords}
      />

      <SearchFilterBar
        type={type}
        sort={sort}
        onTypeChange={handleTypeChange}
        onSortChange={handleSortChange}
      />

      {hasResults ? (
        <SearchResultGrid results={results} onSelect={goDetail} />
      ) : (
        <SearchEmptyState
          mode={stateMode}
          term={term}
          onRetry={() => searchQuery.refetch()}
        />
      )}
    </div>
  );
};

export default SearchPage;
