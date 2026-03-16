# 2026-03-17 Dev Log

## 0. 작업 정보
- 날짜: 2026-03-17
- 브랜치: `relaease/0.3.0`
- 문서 목적: 오늘 진행한 작업을 기능/구조/검증 기준으로 다시 정리한 데브로그

## 1. 오늘 작업 목표
오늘은 아래 4가지를 중심으로 작업했다.
- 모바일 UX와 스크롤/모달 동작 안정화
- 랜딩 페이지(`/`) 타이포, 간격, 반응형 기준 정리
- 피드백 흐름과 메인/404 이동 UX 정리
- 프로젝트 구조와 깨진 문자열 정리

---

## 2. 작업 배경
최근 작업 기준으로 다음 문제가 계속 섞여 있었다.
- 모바일에서 hover 기반 인터랙션이 과하게 개입함
- `Row`, `Category`, `DemoAction`, `Banner`의 디바이스별 동작 기준이 일관되지 않음
- `MovieModal`, 404, 피드백 흐름에서 스크롤 복원/초기화 정책이 불안정함
- 랜딩 페이지의 섹션별 타이포와 spacing 기준이 제각각임
- `src/components`와 `src/pages`의 역할이 섞여 있음
- 일부 사용자 노출 문자열과 주석이 깨져 있었고, `Row.jsx`는 빌드까지 깨지는 상태였음

---

## 3. 오늘 한 일

### 3-1. 모바일 인터랙션 정리
#### Row / Swiper
- 모바일에서 `Row` 스와이프가 안 되던 문제 수정
- 데스크톱과 모바일의 hover 정책 분리
  - 데스크톱: hover / focus 유지
  - 모바일: hover 제거
- 모바일에서는 `Row` 오버레이를 기본 노출로 조정
  - 영화 정보가 항상 보이도록 변경

#### CategorySection
- 모바일에서 hover 대신 `click / active` 기준으로 변경
- 바깥 영역 탭 시 active 해제되도록 추가
- active 카드만 영상 재생
- 나머지 카드는 pause/reset 처리
- 같은 카드 재탭 시 active 해제되는 토글 동작 추가

#### DemoAction / Banner
- `DemoActionSection`
  - 모바일에서는 hover/spotlight 제거
  - 데스크톱만 hover/spotlight 유지
- `Banner`
  - 모바일에서는 Y 패럴랙스 제거
  - 비네팅만 유지
  - 데스크톱은 기존 패럴랙스 유지

### 3-2. 랜딩 페이지(`/`) 버그와 흐름 보정
#### Top10 로그인 플로우
- 비로그인 상태에서 Top10 클릭
- 로그인 후 원래 보려던 디테일 페이지로 자연스럽게 이어지도록 수정

#### Hero 스크롤 인디케이터
- Hero 화살표 클릭 시 `#home-content` 이동 위치를 `--nav-h` 기준으로 다시 계산
- `Top10` 시작 위치에 더 정확히 붙도록 보정

#### Pricing 각주 포커스 이동
- 각주 클릭 시 하단 footnote 상세 위치로 스크롤 이동 보정
- `1번` 각주는 별도 오프셋을 추가해 답답하지 않게 수정

### 3-3. MovieModal / 404 / 스크롤 정책 정리
#### MovieModal
- `createPortal(..., document.body)` 구조로 이동
- `position: fixed`, 높은 `z-index`, 배경 스크롤 잠금 정리
- 내부 스크롤 / safe area / 모바일 반응형 간격 조정
- `/` 모바일에서 모달 뒤로 다른 섹션 타이틀이 보이던 문제 해결

#### 404 정책
- 어느 화면에서 404로 들어가도 항상 최상단부터 보이도록 수정
- 뒤로가기는 이전 화면 스크롤 복원 유지

### 3-4. Feedback 흐름 및 UI 정리
#### 피드백 스크롤 복원
- 메인 → 피드백 → 등록 → 목록 → 뒤로가기 시 메인 스크롤 위치 복원 유지

#### FeedbackForm
- 인라인 스타일 제거
- `styled-components` 구조로 정리
- 사용자 노출 문구 복구

#### FeedbackPage / FeedbackTeaser / DemoBanner
- `FeedbackPage` 목록/폼의 깨진 문자열 복구
- 모바일 타이포, 버튼 간격 조정
- `FeedbackTeaser`는 아이콘 없는 텍스트 중심 CTA로 변경
- `DemoBanner`는 수직 정렬, 높이, 닫기 버튼 영역, 모바일 여백 정리

### 3-5. 랜딩 페이지 타이포 / spacing 정리
#### Footer
- 모바일 아코디언 구조/애니메이션 정리
- 마지막 `컬렉션` 아코디언만 하단 border 적용
- legal/sns/list spacing 정리
- 로고 선명도와 크기 보정

#### FAQ
- 열림 상태에서 질문/답변이 붙어 보이지 않도록 내부 문단 여백 조정
- 이후 `desktop / laptop / tablet / mobile` 기준으로 구조 정리
- 토큰 과다 사용은 다시 줄이고, 공통 토큰 + 직접값 중심 구조로 축소

#### Pricing
- `PricingSection.css` 안의 로컬 `:root` 제거
- 컴포넌트 안에 있던 전역 reset 제거
- 로컬 토큰을 줄이고 직접값 중심으로 정리
- 현재는 전역 공통값만 남기고 나머지는 직접값으로 처리하는 방향으로 정리됨

#### Top10 / Pricing / FAQ 타이틀
- `Pricing` 타이틀의 `clamp()` 스케일이 적절하다고 판단
- `Top10`, `FAQ` 타이틀도 같은 방식으로 맞춤
- 세 섹션 타이틀이 같은 반응형 스케일 방식으로 동작하도록 정리

### 3-6. 프로젝트 구조 리팩토링
#### 페이지 구조 정리
- `DemoPage` → `FeedbackPage`
- `LoginPage` → `LandingPage`
- `NotFoundPage` → `src/pages/NotFound`

#### MainPage 전용 UI 분리
- `src/components`에 있던 메인 전용 UI를 `src/pages/MainPage/components`로 이동
  - `Banner`
  - `CategorySection`
  - `DemoActionSection`
  - `FeedbackTeaser`

#### DetailPage 분리
- `DetailPage` 전용 파일을 `components/`, `hooks/` 기준으로 분리

#### 네이밍 정리
- `FAQitem.jsx` → `FAQItem.jsx`
- `FAQdata.js` → `FAQData.js`
- `Bundle.js` → `BundlePromo.jsx`
- 빈 파일 `src/components/newFile.js` 제거

### 3-7. 글로벌 CSS / 페이지 CSS 기준 정리
- `src/index.css`
  - reset / base / global token 중심으로 정리
- `src/App.css`
  - app shell / layout 책임으로 정리
- `LandingPage/index.css`
  - 페이지 공통 토큰만 유지
- 전역 리스트/문단 spacing은 reset 중심으로 남기고
- 실제 spacing은 각 컴포넌트가 책임지도록 정리

### 3-8. 문자열 / 인코딩 / 주석 복구
- 사용자 노출 문자열과 깨진 한글을 다수 복구
  - `MainPage`
  - `FeedbackPage`
  - `FeedbackForm`
  - `LandingPage`의 Hero / Top10 / Pricing / FAQ / Footer
  - `SearchPage`
  - `NotFound`
  - `Row`
  - `Nav`
  - `MovieModal`
- 특히 `Row.jsx`는 깨진 문자열 때문에 빌드가 깨지던 상태를 복구함

---

## 4. 작업 중 중요하게 판단한 기준
### 4-1. 컴포넌트 / 페이지 역할 분리
- `src/components`
  - 여러 페이지에서 재사용되는 공용 컴포넌트만 둠
- `src/pages/<Page>/components`
  - 해당 페이지 전용 UI만 둠

### 4-2. 토큰 사용 기준
- 전역/페이지에서 반복되는 값만 토큰으로 유지
- 한 컴포넌트 안에서 한두 번 쓰는 값은 직접값으로 처리
- `FAQ`, `Pricing`은 토큰 과다 사용을 다시 줄이는 방향으로 정리

### 4-3. 모바일 UX 우선 기준
- 모바일에서는 hover보다 `click`, `active`, `focus` 기준을 우선
- 데스크톱과 모바일 경험을 동일하게 강제하지 않음

---

## 5. 검증 결과
### 빌드
- `npm run build`: 반복 실행 기준 통과 상태 유지

### 테스트
- `Row` 테스트: 통과
- 이전 전체 테스트에서 `App.test.js`는 Firebase 환경변수 부재로 실패
  - `apiKey`
  - `authDomain`
  - `projectId`
  - `storageBucket`
  - `messagingSenderId`
  - `appId`

### 현재 판단
- 빌드는 안정적임
- 전체 테스트 통과를 위해서는 Firebase mock 또는 test env 주입이 별도로 필요함

---

## 6. 남은 작업 후보
- `/` 랜딩 기준으로 `Top10 / Pricing / FAQ`의 반응형 미디어 쿼리 순서를 더 엄격히 통일
- `Top10Section.jsx`, `PricingSection.jsx`의 사용자 노출 깨진 문자열 추가 정리
- `App.test.js`를 Firebase mock 기준으로 통과시키기
- Footer / Pricing / FAQ의 데스크톱/랩탑/태블릿/모바일 규칙을 동일한 기준으로 더 다듬기

---

## 7. 한 줄 요약
오늘은 모바일 UX, 랜딩 페이지 타이포/간격, 피드백 흐름, 페이지 구조, 깨진 문자열 복구를 한꺼번에 정리하면서, 빌드가 안정적으로 통과하는 상태까지 맞췄다.