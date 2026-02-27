// src/api/bannerQueries.js
import tmdbAxios from "./tmdbaxios";
import requests from "./request";

export async function fetchBannerNowPlaying() {
  const spec = requests.fetchNowplaying;
  if (!spec || typeof spec !== "object" || !spec.path) return null;

  const { path, ...params } = spec;

  // 1️⃣ 리스트 먼저 가져오기
  const res = await tmdbAxios.get("", {
    params: {
      path,
      ...params,
      language: "ko-KR",   // ✅ 여기 추가
    },
  });

  const results = Array.isArray(res.data?.results) ? res.data.results : [];
  if (!results.length) return null;

  const picked = results[Math.floor(Math.random() * results.length)];
  if (!picked?.id) return null;

  // 2️⃣ 상세 정보 + videos 다시 요청
  const { data: detail } = await tmdbAxios.get("", {
    params: {
      path: `movie/${picked.id}`,
      append_to_response: "videos",
      language: "ko-KR",   // ✅ 여기 필수
    },
  });

  return {
    ...detail,
    media_type: picked?.media_type ?? "movie",
  };
}