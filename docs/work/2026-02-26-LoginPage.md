### ✅ 작업 내용 (2026-02-26)

#### 1) LoginPage(root) 반응형 코어 안정화
- HeroSection 레이아웃 수직 정렬 재계산 및 마진 / 패딩 보정
- 모바일 Safari 스크롤 시 상단 URL 영역 밀림 현상 보정
- 390px 이하 / 이상 기준으로 반응형 대응 범위 정리
- iOS Input 포커스 시 자동 확대(zoom) 문제 해결  
- font-size 16px 기준 적용

#### 2) Scroll Indicator (메인 Hero 하단 화살표) 구현
- 히어로 하단 “다음 섹션 이동” 스크롤 인디케이터 추가
- 부드러운 scrollIntoView 동작 적용
- 모바일 / 데스크탑 위치 보정 및 좌측 배치 정리

#### 3) Top10 모바일 UX 개선
- 모바일에서 ArrowZone 제거 (터치 UX 중심 구조로 변경)
- slidesPerView / breakpoints 재정의
- 카드 비율 기반 높이 계산(--top10-card-w, aspect-ratio)로 레이아웃 고정
- overflow 및 fade mask 정리

#### 4) Pricing 추천 뱃지 구조 개선
- 추천 뱃지를 카드와 하나의 wrapper로 묶어 독립 이동 문제 해결
- absolute → relative 구조 재설계
- 반응형 시 카드와 배지가 분리되지 않도록 DOM 구조 개선

#### 5) Footer UI 디테일 개선
- Language 셀렉트 수직 정렬 보정
- caret 아이콘 rotate 애니메이션 정리
- 텍스트 기호 대신 react-icons 기반으로 교체
- 모바일 아코디언 summary 화살표 UI 개선

#### 6) 브랜치 전략 고도화
- feature → dev PR → Vercel Preview 검증 프로세스 확립
- dev → Production 환경에서
- master 브랜치는 초기 버전 아카이브 용도로 유지
- 안정화 완료 시 `release/v1` 브랜치 생성 후 Production 기준 전환 예정