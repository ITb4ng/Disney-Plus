export default async function handler(req, res) {
  try {
    const TMDB_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_KEY) return res.status(500).json({ error: "TMDB_API_KEY missing" });

    const { path, ...rest } = req.query;
    if (!path) return res.status(400).json({ error: "path is required" });

    const base = `https://api.themoviedb.org/3/${String(path).replace(/^\//, "")}`;
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      ...Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, Array.isArray(v) ? v[v.length - 1] : v])
      ),
    });

    const url = `${base}?${params.toString()}`;
    const r = await fetch(url);

    const text = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: e?.message || "unknown error" });
  }
}
