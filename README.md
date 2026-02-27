## 🚧 Renewal (dev) 진행 상황

현재 `dev` 브랜치는 Disney+ 리뉴얼 작업의 **메인 브랜치**입니다.  
UI/UX 개선과 구조 정리를 중심으로 지속적으로 업데이트 중입니다.

---

### ✅ 작업 내용 (2026-02-23)

#### 1) Top10 섹션/Row UI 정리
- Top10Row 높이/잘림 이슈 조정 및 레이아웃 안정화
- 랭킹 뱃지 스타일 통일 (메인 Row / Top10Row 공용화)
- Swiper 관련 레거시 CSS 정리 방향 수립  
  - 공용 Row.css는 “현재 사용 중인 규칙만” 유지  
  - Swiper 전용/레거시 스타일은 별도 파일로 분리 예정

#### 2) Rank Badge 디자인 개선
- 디즈니+ 스타일 느낌의 고급스러운 뱃지 스타일 적용
- 가독성 개선 (스트로크 / 섀도우 / 포지셔닝 미세 조정)
- 상황별 뱃지 타입 분리  
  - 메인 Row: Outline (큰 숫자)  
  - Top10Row: Compact/Pill 또는 Outline 변형

#### 3) Login Hero 슬라이드 동작 개선
- 배너(히어로) 영역에서 hover 시 자동 슬라이드가 멈추던 동작 제거
- 재생/일시정지 UI 유지하면서 자동 롤링 경험 개선

#### 4) Pricing Section 각주 정리
- 각주 클릭 시 하단 상세 설명 하이라이팅 적용
- 기호 중심 안내 방식 → 하이라이팅 중심 안내 방식으로 개선
- 현재 선택된 각주 내용이 명확히 구분되도록 UX 개선

#### 5) 전반적인 아이콘 스타일 재적용
- react-icons 기반으로 통일
- 레거시 텍스트 기호(▲▼ 등) 제거
- hover / active 상태 시각적 일관성 확보

#### 6) 브랜치 / 배포 구조 정의
- `dev` 브랜치를 기본(Default) 브랜치로 승격
- 배포 전략 정의
  - 기존 `feature/*`에서 → Preview 배포
   - `dev` → 통합 검증 브랜치 설정
  - Preview 검증 후 `dev`로 PR
  - 향후 `release/*` 브랜치에서 Production 배포 예정

---

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
- master 브랜치는 “비포 & 애프터 비교용 아카이브 브랜치”로 유지
- 안정화 완료 시 `release/v1` 브랜치 생성 후 Production 기준 전환 예정

---

### ✅ 작업 내용 (2026-02-27)
- 기능 구현 → UX 디테일 고도화 단계 진입
- 로그인 흐름 안정화
- Sticky 이슈 원인 분석 완료 (추후 개선)
- 로그인 화면 완성도 상향
  
#### 1) LoginPage UX 고도화
- 로그인 버튼 로딩 스피너 추가
- 로그인 성공 시 subtle fade-out transition 적용
- Remember(로그인 상태 유지) 기본 체크 정책 적용
- “로그인 상태 유지” 레이블 폰트 크기 및 시각적 hierarchy 조정
- 체크박스 다크 테마 기준 정렬 및 시각 균형 보정
- 체험계정으로 둘러보기 CTA 배치 정리

#### 2) 체험 계정 흐름 개선
- 체험 로그인 진입 구조 정리
- 로그인 → 메인 전환 시 scrollTo(0,0) 적용
- 라우트 전환 후 레이아웃 안정성 보완

#### 3) PricingSection Sticky 이슈 분석
- 로그인 → 로그아웃 → 재진입 시 sticky 기준점 변동 현상 재현
- SPA 환경에서 layout recalculation 타이밍 이슈로 판단
- 강제 새로고침 시 정상 동작 확인
- 구조적 문제 아님으로 개선 항목으로 분리 관리

#### 4) 로그인 화면 시각적 정돈
- 보조 옵션 텍스트 크기 축소 (UI hierarchy 개선)
- 버튼과 보조 옵션 간 간격 조정
- 다크 테마 대비 기준 정리 및 균형 보정

---  

### 🧭 다음 작업 예정

- *-new.disney.vercel.app 도메인 적용 
- Top10Row 랭킹 뱃지 카드 외곽 연출 (z-index / overflow 재정리)
- Swiper 레거시 CSS 완전 분리
- 모바일 / 태블릿 공통 spacing system 재정의
- DetailPage UI 마감 및 데이터 필드 정리
- 로그인 이후 검색input 포커싱 해제가 되는 문제 수정
- 운영용 피드백 페이지 생성 (실서비스 관점)
