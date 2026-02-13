import axios from "axios";

const tmdbAxios = axios.create({
  baseURL: "/api/tmdb",
});

export default tmdbAxios;