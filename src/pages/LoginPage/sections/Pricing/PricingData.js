const DISNEY_LOGO =
  "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/3600EEA25BEB4CAC2E8F0F82F03245FA7A8558F67A7EC9F49AEEFF2542EF3CD7/compose?format=webp&width=290";

const BUNDLE_LEFT_LOGO =
  "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/00328ED2854929F667624303D1CD48BA99B8FFA2F49999E2E3417A2C3BFE0F45/compose?format=webp&width=300";

const BUNDLE_RIGHT_LOGO =
  "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/B306005276BE4926367313F887E61BCFE08292636A605A62EB3189586A1BD8BD/compose?format=webp&width=180";

export const TABS = [
  { key: "disney", label: "디즈니+" },
  { key: "bundle", label: "번들 할인" },
];

export const DISNEY_PLANS = [
  {
    key: "premium",
    badge: "추천",
    logoImg: DISNEY_LOGO,
    logoAlt: "Disney+",
    name: "디즈니+ 프리미엄",
    monthlyLabel: "월 ₩13,900",
    annualLabel: "연 ₩139,000",
    annualSub: "최대 16% 할인된 가격",
    isReco: true,
  },
  {
    key: "standard",
    badge: null,
    logoImg: DISNEY_LOGO,
    logoAlt: "Disney+",
    name: "디즈니+ 스탠다드",
    monthlyLabel: "월 ₩9,900",
    annualLabel: "연 ₩99,000",
    annualSub: "최대 16% 할인된 가격",
    isReco: false,
    isFlat: true,
  },
];


// 디즈니+ 탭 데이터(좌측 항목 + 각 플랜의 값)
export const DISNEY_ROWS = [
  {
    feature: "연간 멤버십 구독료 (부가세 포함)",
    featureFootnotes: [3],
    premium: { type: "annualBtn", footnotes: [3, 4] },
    standard: { type: "annualBtn", footnotes: [3, 4] },
  },
  {
    feature: "영상 화질",
    premium: { text: "최대 4K UHD & HDR", footnotes: [5] },
    standard: { text: "최대 1080p Full HD", footnotes: [5] },
  },
  {
    feature: "오디오",
    premium: { text: "최대 Dolby Atmos", footnotes: [5] },
    standard: { text: "최대 5.1 사운드", footnotes: [5] },
  },
  {
    feature: "동시 스트리밍",
    premium: { text: "4" },
    standard: { text: "2" },
  },
  {
    feature: "광고",
    featureFootnotes: [6],
    premium: { text: "광고 없는 스트리밍"},
    standard: { text: "광고 없는 스트리밍"},
  },
  {
    feature: "콘텐츠 저장",
    premium: { type: "check"},
    standard: { type: "check"},
  },
];

// 번들 탭은 너가 나중에 채울 수 있게 틀만 남김

export const BUNDLE_PLANS = [
  {
    key: "trio",
    badge: "추천",
    logoImg: BUNDLE_LEFT_LOGO,
    logoAlt: "디즈니+ 티빙 웨이브 번들",
    name: "디즈니+ 티빙 웨이브 번들",
    monthlyLabel: "월 ₩21,500",
    isReco: true,
    logoVariant: "bundleLeft",
  },
  {
    key: "duo",
    badge: null,
    logoImg: BUNDLE_RIGHT_LOGO,
    logoAlt: "디즈니+ 티빙 번들",
    name: "디즈니+ 티빙 번들",
    monthlyLabel: "월 ₩18,000",
    isReco: false,
    isFlat: true,
    logoVariant: "bundleRight",
  },
];


export const BUNDLE_ROWS = [
  {
    feature: "포함된 서비스",
    featureFootnotes: [1],
    trio: { 
      text: "디즈니+, 티빙, 웨이브 스탠다드 멤버십 번들",
      footnotes: [1],
    },
    duo: { 
      text: "디즈니+, 티빙 스탠다드 멤버십 번들",
      footnotes: [1],
    },
  },
  {
    feature: "월별 번들 할인",
    trio: { text: "개별 구독 대비 최대 37% 절약", footnotes: [2] },
    duo: { text: "개별 구독 대비 최대 23% 절약", footnotes: [2] },
  },
  {
    feature: "영상 화질",
    trio: { 
      text: "디즈니+, 웨이브: 최대 1080p Full HD 화질, 티빙: 고화질",
      footnotes: [5],
    },
    duo: { 
      text: "디즈니+: 최대 1080p Full HD 화질, 티빙: 고화질",
      footnotes: [5],
    },
  },
  {
    feature: "지원 기기",
    featureFootnotes: [5],
    trio: { 
      text: "웹 브라우저, 모바일 기기, 태블릿, 스마트 TV 등",
    },
    duo: { 
      text: "웹 브라우저, 모바일 기기, 태블릿, 스마트 TV 등",
    },
  },
  {
    feature: "광고",
    featureFootnotes: [6],
    trio: { text: "광고 없는 스트리밍",},
    duo: { text: "광고 없는 스트리밍",},
  },
  {
    feature: "동시 스트리밍",
    trio: { text: "2대 기기 동시 스트리밍" },
    duo: { text: "2대 기기 동시 스트리밍" },
  },
];


export const FOOTNOTES = {
  1: {
    title: "번들 구성 안내",
    summary: "디즈니+ 티빙 번들은 디즈니+ 스탠다드 월간 멤버십과 티빙 스탠다드 월간 멤버십의 제휴 상품이며, 디즈니+ 티빙 웨이브 번들은 디즈니+ 스탠다드 월간 멤버십과 티빙과 웨이브의 더블 스탠다드 월간 멤버십의 제휴 상품입니다. 각 서비스의 콘텐츠는 해당 서비스를 통해 이용 가능하며, 번들별로 이용 가능한 콘텐츠, 상세 사양, 지원 기기 등에 제약이 있을 수 있습니다. 일부 콘텐츠는 저작권자 내지 콘텐츠 제공사의 요청 등의 사정으로 시청이 제한될 수 있으며, 번들 구성 각 멤버십별 구체적 사양은 상이할 수 있습니다. 더 알아보기.",
    linkTo: "/legal/bundle-composition",
  },
  2: {
    title: "할인 산정 기준",
    summary: "각 서비스의 스탠다드 멤버십 개별 구독료(할인 효과 산정을 위한 기준 가격) 합산 대비 할인 효과에 해당합니다. (디즈니+ 티빙 웨이브 번들의 경우 더블 스탠다드 구독료(현재 월 15,000원(부가세 포함)) 고려시 13.65% 할인 효과)",
    linkTo: "/legal/discount-calculation",
  },
  3: {
    title: "멤버십 변경",
    summary: "멤버십 유형에 따라 변경 적용 시점 및 즉시 청구 금액이 다를 수 있습니다.",
  },
  4: {
    title: "취소 및 환불",
    summary: "결제 주기 종료 시 자동 갱신이 취소 처리됩니다.",
    linkTo: "/legal/cancellation",
  },
  5: {
    title: "화질/기기/사양/오디오",
    summary: "영상 화질 및 기능은 기기의 사양/인터넷/콘텐츠에 따라 달라질 수 있습니다.",
    linkTo: "/legal/specifications",
  },
  6: {
    title: "광고 안내",
    summary: "라이브 채널 스트리밍 및 생방송 프로그램에는 광고가 포함될 수 있으며, 모든 멤버십 유형에서 특정 홍보 및 협찬 콘텐츠를 경험하게 될 수 있습니다. 자세한 사항은 고객센터를 확인하세요.",
    linkTo: "/legal/ads",
  },
};
