export const footerColumns = [
  {
    title: "더 알아보기",
    links: [
      { label: "디즈니+ 이용 약관", type: "disabled" },
      { label: "개인정보 처리방침", type: "disabled" },
      { label: "개인정보 처리방침 부속서", type: "disabled" },
      { label: "관심 기반 광고", type: "disabled" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "고객센터", to: "/support/customer-center" },
      { label: "지원되는 기기", to: "/support/devices" },
      { label: "디즈니+ 소개", to: "/support/about-disney-plus" },
      { label: "통신판매 사업자정보확인", to: "/support/business-info" },
    ],
  },
  {
    title: "브랜드",
    links: [
      { label: "디즈니", to: "/brand/disney" },
      { label: "픽사", to: "/brand/pixar" },
      { label: "마블", to: "/brand/marvel" },
      { label: "스타워즈", to: "/brand/star-wars" },
      { label: "내셔널지오그래픽", to: "/brand/national-geographic" },
      { label: "훌루", to: "/brand/hulu" },
    ],
  },
  {
    title: "컬렉션",
    links: [
      { label: "모든 컬렉션", to: "/collections/all" },
      { label: "Made in Korea", to: "/collections/made-in-korea" },
      { label: "액션 & 어드벤처", to: "/collections/action-adventure" },
      { label: "코미디", to: "/collections/comedy" },
      { label: "드라마", to: "/collections/drama" },
      { label: "주목할 만한 아시아 콘텐츠", to: "/collections/asian-content" },
      { label: "호러", to: "/collections/horror" },
      { label: "Shorts", to: "/collections/shorts" },
    ],
  },
];

export const footerSns = [
  { label: "Twitter/X", href: "sns/twitter", external: true },
  { label: "Facebook", href: "sns/facebook", external: true },
  { label: "Instagram", href: "https://www.instagram.com/b4ngs__hwa2", external: true },
  { label: "TikTok", href: "sns/tiktok", external: true },
  { label: "YouTube", href: "sns/youtube", external: true },
];

export const footerLegal = [
  {
    type: "text",
    value: "본 웹사이트는 개인 포트폴리오 목적의 Disney+ UI/UX 리뉴얼 프로젝트입니다. (비상업적)",
  },
  {
    type: "text",
    value:
      "Disney+ 및 관련 로고, 상표, 콘텐츠에 대한 모든 권리는 해당 권리자에게 있으며 본 사이트는 공식 서비스가 아닙니다.",
  },
  {
    type: "links",
    value: [
      { label: "GitHub", href: "https://github.com/itb4ng", external: true },
      { label: "Email", href: "mailto:bsh801099@gmail.com" },
      { label: "Portfolio", type: "disabled" },
    ],
  },
  {
    type: "text",
    value: "© {{year}} 방Siri. All Rights Reserved.",
  },
];

export const languages = [
  { label: "한국어", value: "ko-kr" },
  { label: "English", value: "en-kr" },
];
