export default async function handler(req, res) {
  try {
    const { path = "" } = req.query;

    if (!path) {
      return res.status(400).json({ message: "Missing 'path' query param" });
    }

    const base = `https://api.themoviedb.org/3/${path}`;

    const params = new URLSearchParams(req.query);
    params.delete("path");
    params.set("api_key", process.env.TMDB_API_KEY);
    params.set("language", params.get("language") || "ko-KR");

    const r = await fetch(`${base}?${params.toString()}`);
    const data = await r.json();

    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ message: "TMDB proxy error" });
  }
}
