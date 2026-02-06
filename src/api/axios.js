import axios from "axios";

const isLocal = window.location.hostname === "localhost";

const baseURL = isLocal ? "http://localhost:4000/api/tmdb" : "/api/tmdb";

export default axios.create({ baseURL });
