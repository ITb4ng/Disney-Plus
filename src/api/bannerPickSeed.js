/**
 * 배너 seed 운영 범례
 *
 * weight:
 * 1 = 평시 노출
 * 3 = 자주 노출
 * 5 = 상시/핵심 노출
 *
 * enabled:
 * true = 현재 배너 후보에 포함
 * false = 후보 데이터만 보관, 현재 로테이션 제외
 *
 * key:
 * 영문 slug
 */

export const bannerPickSeeds = [
  {
    id: 126485,
    type: "tv",
    key: "moving",
    title: "무빙",
    enabled: true,
    weight: 3,
    note: "대표 배너 후보",
  },
  {
    id: 66732,
    type: "tv",
    key: "stranger-things",
    title: "기묘한 이야기",
    enabled: true,
    weight: 1,
    note: "대표 시리즈 후보",
  },
  {
    id: 71446,
    type: "tv",
    key: "money-heist",
    title: "종이의 집",
    enabled: true,
    weight: 1,
    note: "대표 시리즈 후보",
  },
  {
    id: 93405,
    type: "tv",
    key: "squid-game",
    title: "오징어 게임",
    enabled: true,
    weight: 3,
    note: "인지도 높은 대표 배너 후보",
  },
  {
    id: 94605,
    type: "tv",
    key: "alice-in-borderland",
    title: "아리스 인 보더랜드",
    enabled: true,
    weight: 1,
    note: "일본 시리즈 후보",
  },
  {
    id: 110316,
    type: "tv",
    key: "all-of-us-are-dead",
    title: "지금 우리 학교는",
    enabled: true,
    weight: 1,
    note: "한국 시리즈 후보",
  },
  {
    id: 214582,
    type: "tv",
    key: "the-devils-plan",
    title: "데블스 플랜",
    enabled: true,
    weight: 1,
    note: "예능/두뇌 서바이벌 계열",
  },
  {
    id: 194797,
    type: "tv",
    key: "doona",
    title: "이두나!",
    enabled: true,
    weight: 5,
    note: "상시 핵심 배너 후보",
  },
  {
    id: 136283,
    type: "tv",
    key: "the-glory",
    title: "더 글로리",
    enabled: true,
    weight: 3,
    note: "한국 시리즈 후보",
  },
  {
    id: 982843,
    type: "movie",
    key: "great-flood",
    title: "대홍수",
    enabled: true,
    weight: 1,
    note: "영화 타입 배너 후보",
  },
  {
    id: 5279,
    type: "tv",
    key: "palace",
    title: "궁",
    enabled: true,
    weight: 1,
    note: "클래식 한국 드라마 후보",
  },
  {
    id: 281016,
    type: "tv",
    key: "monthly-boyfriend",
    title: "월간남친",
    enabled: true,
    weight: 1,
    note: "신규 시리즈 후보",
  },
  {
    id: 1314481,
    type: "movie",
    key: "the-devil-wears-prada-2",
    title: "악마는 프라다를 입는다 2",
    enabled: false,
    weight: 1,
    note: "상세 데이터 확인 전 비활성화",
  },
  {
    id: 1268127,
    type: "movie",
    key: "humint",
    title: "휴민트",
    enabled: false,
    weight: 1,
    note: "상세 데이터 확인 전 비활성화",
  },
];