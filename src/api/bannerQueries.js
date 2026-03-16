import tmdbAxios from "./tmdbaxios";
// import requests from "./request";

export async function fetchBannerNowPlaying() {
  const seedId = 194797; //66732, 71446, 93405, 94605 , 110316 , 214582, 194797 ,119769, 982843(movie)

  // 1️⃣ seed 기반 추천 목록
  const res = await tmdbAxios.get("", {
    params: {
      path: `tv/${seedId}/recommendations`,
      language: "ko-KR",
    },
  });

  const results = Array.isArray(res.data?.results) ? res.data.results : [];
  if (!results.length) return null;

  const picked = results[Math.floor(Math.random() * results.length)];
  if (!picked?.id) return null;

  // 2️⃣ 상세 정보
  const { data: detail } = await tmdbAxios.get("", {
    params: {
      path: `${picked.media_type}/${picked.id}`,
      append_to_response: "videos",
      language: "ko-KR",
    },
  });

  return {
    ...detail,
    media_type: picked.media_type,
  };
}