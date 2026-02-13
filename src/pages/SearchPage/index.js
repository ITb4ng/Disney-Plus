import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import tmdbAxios from "../../api/tmdbaxios"; // ✅ 프록시 규격 axios로 통일
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { search } = useLocation();

  const searchTerm = useMemo(() => {
    return new URLSearchParams(search).get("q") ?? "";
  }, [search]);

  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  useEffect(() => {
    const term = (debouncedSearchTerm ?? "").trim();
    if (!term) {
      setSearchResults([]);
      return;
    }
    fetchSearchMovie(term);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const fetchSearchMovie = async (term) => {
    try {
      // ✅ 프록시 규격: path + query params
      const response = await tmdbAxios.get("", {
        params: {
          path: "search/multi",
          include_adult: false,
          query: term,
          language: "ko-KR",
        },
      });

      setSearchResults(Array.isArray(response.data?.results) ? response.data.results : []);
    } catch (error) {
      console.log("search error:", error);
      setSearchResults([]);
    }
  };

  const filteredResults = searchResults.filter(
    (movie) => movie.backdrop_path !== null && movie.media_type !== "person"
  );

  if (filteredResults.length > 0) {
    return (
      <section className="search-container">
        {filteredResults.map((movie) => {
          const movieImageUrl = "https://image.tmdb.org/t/p/w500" + movie.backdrop_path;

          return (
            <div className="movie" key={movie.id}>
              <div
                className="movie__column-poster"
                onClick={() => {
                  console.log("CLICK", movie.media_type, movie.id);
                  navigate(`/detail/${movie.media_type}/${movie.id}`);
                }}
              >
                <img src={movieImageUrl} alt={movie.title || movie.name || "movie"} className="movie__poster" />
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  return (
    <section className="no-results">
      <div className="no-results__text">
        <p>찾고자 하는 검색어 "{searchTerm}" 에 맞는 영화가 없습니다.</p>
      </div>
    </section>
  );
};

export default SearchPage;
