const DISNEY_LOGO =
  "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/3600EEA25BEB4CAC2E8F0F82F03245FA7A8558F67A7EC9F49AEEFF2542EF3CD7/compose?format=webp&width=290";

const BUNDLE_LEFT_LOGO =
  "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/00328ED2854929F667624303D1CD48BA99B8FFA2F49999E2E3417A2C3BFE0F45/compose?format=webp&width=300";

const BUNDLE_RIGHT_LOGO =
  "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/B306005276BE4926367313F887E61BCFE08292636A605A62EB3189586A1BD8BD/compose?format=webp&width=180";

export const TABS = [
  { key: "disney", label: "Disney+" },
  { key: "bundle", label: "번들 할인" },
];

export const DISNEY_PLANS = [
  {
    key: "premium",
    badge: "추천",
    logoImg: DISNEY_LOGO,
    logoAlt: "Disney+",
    name: "Disney+ 프리미엄",
    monthlyLabel: "월 13,900원",
    annualLabel: "연 139,000원",
    annualSub: "최대 16% 할인된 가격",
    annualFootnotes: [3],
    isReco: true,
  },
  {
    key: "standard",
    badge: null,
    logoImg: DISNEY_LOGO,
    logoAlt: "Disney+",
    name: "Disney+ 스탠다드",
    monthlyLabel: "월 9,900원",
    annualLabel: "연 99,000원",
    annualSub: "최대 16% 할인된 가격",
    annualFootnotes: [3],
    isReco: false,
    isFlat: true,
  },
];

export const DISNEY_ROWS = [
  {
    feature: "연간 멤버십 구독료(부가세 포함)",
    featureFootnotes: [3],
    premium: { type: "annualBtn" },
    standard: { type: "annualBtn" },
  },
  {
    feature: "영상 화질",
    premium: { text: "최대 4K UHD 및 HDR", footnotes: [5] },
    standard: { text: "최대 1080p Full HD", footnotes: [5] },
  },
  {
    feature: "오디오",
    premium: { text: "최대 Dolby Atmos", footnotes: [5] },
    standard: { text: "최대 5.1 사운드", footnotes: [5] },
  },
  {
    feature: "동시 스트리밍",
    premium: { text: "4대 기기" },
    standard: { text: "2대 기기" },
  },
  {
    feature: "광고",
    featureFootnotes: [6],
    premium: { text: "광고 없는 스트리밍" },
    standard: { text: "광고 없는 스트리밍" },
  },
  {
    feature: "콘텐츠 다운로드",
    premium: { type: "check" },
    standard: { type: "check" },
  },
];

export const BUNDLE_PLANS = [
  {
    key: "trio",
    badge: "추천",
    logoImg: BUNDLE_LEFT_LOGO,
    logoAlt: "Disney+ 티빙 웨이브 번들",
    name: "Disney+ 티빙 웨이브 번들",
    monthlyLabel: "월 21,500원",
    isReco: true,
    logoVariant: "bundleLeft",
  },
  {
    key: "duo",
    badge: null,
    logoImg: BUNDLE_RIGHT_LOGO,
    logoAlt: "Disney+ 티빙 번들",
    name: "Disney+ 티빙 번들",
    monthlyLabel: "월 18,000원",
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
      text: "Disney+, 티빙, 웨이브 스탠다드 멤버십 번들",
      footnotes: [1],
    },
    duo: {
      text: "Disney+, 티빙 스탠다드 멤버십 번들",
      footnotes: [1],
    },
  },
  {
    feature: "개별 구독 대비 할인",
    trio: { text: "개별 구독 대비 최대 37% 절약", footnotes: [2] },
    duo: { text: "개별 구독 대비 최대 23% 절약", footnotes: [2] },
  },
  {
    feature: "영상 화질",
    trio: {
      text: "Disney+와 웨이브는 최대 Full HD, 티빙은 콘텐츠별 상이",
      footnotes: [5],
    },
    duo: {
      text: "Disney+는 최대 Full HD, 티빙은 콘텐츠별 상이",
      footnotes: [5],
    },
  },
  {
    feature: "지원 기기",
    featureFootnotes: [5],
    trio: { text: "웹 브라우저, 모바일, 태블릿, 스마트 TV 등" },
    duo: { text: "웹 브라우저, 모바일, 태블릿, 스마트 TV 등" },
  },
  {
    feature: "광고",
    featureFootnotes: [6],
    trio: { text: "광고 없는 스트리밍" },
    duo: { text: "광고 없는 스트리밍" },
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
    summary:
      "번들 상품은 구성된 각 서비스의 이용 조건에 따라 제공되며, 서비스별 콘텐츠와 지원 기기는 달라질 수 있습니다.",
    linkTo: "/legal/bundle-composition",
  },
  2: {
    title: "할인 기준",
    summary:
      "할인율은 각 서비스를 개별 구독했을 때의 월간 가격 대비 비교 기준으로 계산한 값입니다.",
    linkTo: "/legal/discount-calculation",
  },
  3: {
    title: "멤버십 변경",
    summary: "멤버십 유형에 따라 변경 시점과 다음 결제일 적용 방식이 달라질 수 있습니다.",
  },
  4: {
    title: "취소 및 환불",
    summary: "결제 주기 종료 전까지 자동 갱신을 해지할 수 있으며 환불 정책은 결제 수단에 따라 다릅니다.",
    linkTo: "/legal/cancellation",
  },
  5: {
    title: "화질, 기기, 사양 안내",
    summary: "화질과 오디오는 기기 사양, 네트워크 환경, 콘텐츠 지원 여부에 따라 달라질 수 있습니다.",
    linkTo: "/legal/specifications",
  },
  6: {
    title: "광고 안내",
    summary: "일부 라이브 콘텐츠나 제휴 프로그램은 별도 고지에 따라 광고 또는 노출 요소가 포함될 수 있습니다.",
    linkTo: "/legal/ads",
  },
};
