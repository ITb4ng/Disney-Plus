const requests = {
  fetchTop10KR: {
    path: "discover/movie",
    region: "KR",
    sort_by: "popularity.desc",
    include_adult: false,
    include_video: false,
    language: "ko-KR",
    page: 1,
  },
  fetchNowplaying: {
    path: "movie/now_playing",
  },

  fetchTrending: {
    path: "trending/all/week",
  },

  fetchTopRated: {
    path: "movie/top_rated",
  },

  fetchActionMovies: {
    path: "discover/movie",
    with_genres: 28,
  },

  fetchComedyMovies: {
    path: "discover/movie",
    with_genres: 35,
  },

  fetchHorrorMovies: {
    path: "discover/movie",
    with_genres: 27,
  },

  fetchRomanceMovies: {
    path: "discover/movie",
    with_genres: 10749,
  },

  fetchDocumentaries: {
    path: "discover/movie",
    with_genres: 99,
  },
};

export default requests;
