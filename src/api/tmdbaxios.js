import axios from "axios";

const tmdbAxios = axios.create({
  baseURL: "/api/tmdb",
  params: {
    language: "ko-KR",
  },
});

export default tmdbAxios;