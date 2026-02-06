import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = process.env.TMDB_BASE || "https://api.themoviedb.org/3";
const PORT = Number(process.env.PORT || 4000);

if (!TMDB_KEY) {
  console.error("❌ TMDB_API_KEY가 없습니다. server/.env 확인하세요.");
  process.exit(1);
}

// 공통 프록시: /api/tmdb?path=discover/movie&region=KR&...
app.get("/api/tmdb", async (req, res) => {
  try {
    const { path, ...rest } = req.query;

    if (!path || typeof path !== "string") {
      return res.status(400).json({ message: "Missing `path` query param" });
    }

    const cleanPath = path.replace(/^\//, "");
    const url = new URL(`${TMDB_BASE}/${cleanPath}`);

    // 키는 서버에서만
    url.searchParams.set("api_key", TMDB_KEY);

    // 나머지 params 전달
    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }

    const tmdbRes = await fetch(url, { method: "GET" });
    const text = await tmdbRes.text();

    res.status(tmdbRes.status);

    // TMDB 응답을 그대로 전달 (json일 수도, 아닐 수도)
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (e) {
    res.status(500).json({ message: "Proxy error", error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ TMDB proxy running: http://localhost:${PORT}/api/tmdb`);
});
