export const TABS = [
  { key: "disney", label: "디즈니+" },
  { key: "bundle", label: "번들 할인" },
];

export const DISNEY_PLANS = [
  {
    key: "premium",
    badge: "추천",
    logoText: "Disney+",
    name: "디즈니+ 프리미엄",
    monthlyLabel: "월 ₩13,900",
    annualLabel: "연 ₩139,000",
    annualSub: "최대 16% 할인된 가격^",
    isReco: true, 
  },
  {
    key: "standard",
    badge: null,
    logoText: "Disney+",
    name: "디즈니+ 스탠다드",
    monthlyLabel: "월 ₩9,900",
    annualLabel: "연 ₩99,000",
    annualSub: "최대 16% 할인된 가격^",
    isReco: false,
    isFlat: true, 
  },
];

// 디즈니+ 탭 데이터(좌측 항목 + 각 플랜의 값)
export const DISNEY_ROWS = [
  {
    feature: "연간 멤버십 구독료 (부가세 포함)",
    premium: { type: "annualBtn" },
    standard: { type: "annualBtn" },
  },
  {
    feature: "영상 화질***",
    premium: { text: "최대 4K UHD & HDR" },
    standard: { text: "최대 1080p Full HD" },
  },
  {
    feature: "오디오***",
    premium: { text: "최대 Dolby Atmos" },
    standard: { text: "최대 5.1 사운드" },
  },
  {
    feature: "동시 스트리밍",
    premium: { text: "4" },
    standard: { text: "2" },
  },
  {
    feature: "광고",
    premium: { text: "광고 없는 스트리밍†" },
    standard: { text: "광고 없는 스트리밍†" },
  },
  {
    feature: "콘텐츠 저장",
    premium: { type: "check" },
    standard: { type: "check" },
  },
];

// 번들 탭은 너가 나중에 채울 수 있게 틀만 남김

export const BUNDLE_PLANS = [
  {
    key: "trio",
    badge: "추천",
    logoText: "Disney+ · TVING · Wavve",
    name: "디즈니+ 티빙 웨이브 번들",
    monthlyLabel: "월 ₩21,500",
    isReco: true,
  },
  {
    key: "duo",
    badge: null,
    logoText: "Disney+ · TVING",
    name: "디즈니+ 티빙 번들",
    monthlyLabel: "월 ₩18,000",
    isReco: false,
    isFlat: true,
  },
];

export const BUNDLE_ROWS = [
  {
    feature: "포함된 서비스^",
    trio: { text: "디즈니+, 티빙, 웨이브 스탠다드 멤버십 번들" },
    duo: { text: "디즈니+, 티빙 스탠다드 멤버십 번들" },
  },
  {
    feature: "월별 번들 할인^^",
    trio: { text: "개별 구독 대비 최대 37%^^ 절약" },
    duo: { text: "개별 구독 대비 최대 23%^^ 절약" },
  },
  {
    feature: "영상 화질***",
    trio: { text: "디즈니+, 웨이브: 최대 1080p Full HD 화질, 티빙: 고화질" },
    duo: { text: "디즈니+: 최대 1080p Full HD 화질, 티빙: 고화질" },
  },
  {
    feature: "동시 스트리밍",
    trio: { text: "2대 기기 동시 스트리밍" },
    duo: { text: "2대 기기 동시 스트리밍" },
  },
  {
    feature: "광고",
    trio: { text: "광고 없는 스트리밍†" },
    duo: { text: "광고 없는 스트리밍†" },
  },
  {
    feature: "지원 기기***",
    trio: { text: "웹 브라우저, 모바일 기기, 태블릿, 스마트 TV 등" },
    duo: { text: "웹 브라우저, 모바일 기기, 태블릿, 스마트 TV 등" },
  },
];

