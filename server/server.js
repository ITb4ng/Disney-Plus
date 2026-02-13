import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = process.env.TMDB_BASE || "https://api.themoviedb.org/3";
const PORT = Number(process.env.PORT || 4000);

if (!TMDB_KEY) {
  console.error("❌ TMDB_API_KEY가 없습니다. server/.env 확인하세요.");
  process.exit(1);
}

app.get("/api/tmdb", async (req, res) => {
  try {
    const { path, ...rest } = req.query;

    if (!path || typeof path !== "string") {
      return res.status(400).json({ message: "Missing `path` query param" });
    }

    const cleanPath = path.replace(/^\//, "");
    const url = new URL(`${TMDB_BASE}/${cleanPath}`);

    url.searchParams.set("api_key", TMDB_KEY);

    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined || v === null) continue;
      const val = Array.isArray(v) ? v[v.length - 1] : v;
      url.searchParams.set(k, String(val));
    }

    const tmdbRes = await fetch(url, { method: "GET" });
    const text = await tmdbRes.text();

    res.status(tmdbRes.status);
    res.setHeader("Content-Type", tmdbRes.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ message: "Proxy error", error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`TMDB proxy running: http://localhost:${PORT}/api/tmdb`);
});
