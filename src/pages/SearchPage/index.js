import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchPage.css';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const searchTerm = query.get('q');
  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchSearchMovie(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const fetchSearchMovie = async (term) => {
    try {
      const response = await axios.get(
        `/search/multi?include_adult=false&query=${term}`
      );
      setSearchResults(response.data.results);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ 렌더링 전에 걸러서 map에서 return 누락 문제 제거
  const filteredResults = searchResults.filter(
    (movie) => movie.backdrop_path !== null && movie.media_type !== 'person'
  );

  if (filteredResults.length > 0) {
    return (
      <section className="search-container">
        {filteredResults.map((movie) => {
          const movieImageUrl =
            'https://image.tmdb.org/t/p/w500' + movie.backdrop_path;

          return (
            <div className="movie" key={movie.id}>
              <div
                className="movie__column-poster"
                onClick={() => navigate(`/${movie.id}`)}
              >
                <img
                  src={movieImageUrl}
                  alt="movie"
                  className="movie__poster"
                />
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
