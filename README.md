# Disney+ Renewal

Disney+ 스타일의 탐색 경험을 목표로 만든 React 기반 SPA 프로젝트입니다.  
TMDB 데이터를 프록시 서버를 통해 연동하고, 상세 페이지 전환 UX, 스크롤 복원 정책, 체험 계정 흐름, 피드백 기능까지 함께 다루고 있습니다.

---

## Stable Release

- 현재 안정 버전: **v0.3.0**
- Live Demo: https://b4ng-disney-plus.vercel.app/

### Release Notes
- [2026-03-16 v0.3.0 Release Notes](docs/release/2026-03-16-v0.3.0.md)
- [2026-03-17 v0.3.0 Release Notes](docs/release/2026-03-17-v0.3.0.md)

### Release History
- **v0.3.0** 라우트별 스크롤 복원 정책 정리 및 구조 안정화
- **v0.2.4** UI 상태 안정화 및 테스트 환경 개선
- **v0.2.3** SearchPage, Nav, Banner UX 개선
- **v0.2.2** Detail, Row UX 개선
- **v0.2.1** Detail UX 개선
- **v0.2.0** 체험 계정 및 피드백 기능 추가
- **v0.1.1** SEO 최적화
- **v0.1.0** DetailPage 구조 개편 및 Hero 전환 UX 개선

### Stable Version Checkout

```bash
git clone https://github.com/ITb4ng/Disney-Plus.git
cd Disney-Plus
git checkout v0.3.0
```

---

## Local Development

### 실행 방법

```bash
npm install
npm run dev
```

### 실행 환경

- Client: `http://localhost:3000`
- TMDB Proxy Server: `http://localhost:4000/api/tmdb`

---

## 주요 기능

### Detail UX
- Hero 프리로드 기반 이미지 전환
- 스크롤 기반 비네팅 효과
- Search -> Detail 전환 시 상태 전달 최적화

### 스크롤 복원 정책
- `/main`, `/`, `/detail` 라우트별 복원 정책 분리
- 새로고침과 뒤로 가기 상황에 맞춘 복원 시점 보정
- 오버레이 기반 새로고침 UX로 플래시 최소화

### 체험 계정 정책
- 체험 계정 로그인 지원
- 피드백 작성 가능
- 수정과 삭제는 제한
- 권한 안내 배너 제공

### 피드백 페이지
- 리스트, 빈 상태, 로딩 상태 제공
- 작성자/관리자 권한 분기
- 정렬, 필터, 새로고침 UX 반영

### 인터랙션
- Banner 및 카드 인터랙션 강화
- Spotlight, 패럴랙스, Hover 상태 처리
- 모바일 환경에서는 과도한 효과를 줄이는 방향으로 보정

---

## Tech Stack

- React
- React Router
- Styled Components
- Swiper
- TanStack Query
- Firebase
- Express (TMDB Proxy Server)
- Vercel
- Playwright

---

## Branch Strategy

- `feature/*`: 기능 단위 작업 브랜치
- `dev`: 통합 개발 브랜치
- `release/x.y.z`: 안정화 및 릴리즈 점검 브랜치
- `main`: Production 브랜치

---

## Documentation

### 문서 분류
- `docs/release`: 릴리즈 기준 브랜치에서 확정된 변경 사항을 정리하는 릴리즈 노트
- `docs/logs`: 작업 중 판단, 느낀 점, 회고를 남기는 로그 문서
- `docs/work`: 개발 로그, 테스트 메모, 다음 액션을 간단하고 실무적으로 정리하는 작업 문서
- `docs/work/archive`: 초기 작업 기록을 보관하는 아카이브 폴더
- `docs/work/test-notes`: 수동 테스트 기준, 스크롤 복원 점검, URL 매트릭스를 모아두는 폴더

### Release
- [2026-03-16 v0.3.0 Release Notes](docs/release/2026-03-16-v0.3.0.md)
- [2026-03-17 v0.3.0 Release Notes](docs/release/2026-03-17-v0.3.0.md)

### Logs
- [2026-03-09 Release Log v0.2.4](docs/logs/2026-03-09-release-log-0.2.4.md)
- [2026-03-10 Retrospective](docs/logs/2026-03-10-retrospective.md)
- [2026-03-16 Release Log v0.3.0](docs/logs/2026-03-16-release-log-0.3.0.md)
- [2026-03-17 Release Log v0.3.0](docs/logs/2026-03-17-release-log-0.3.0.md)

### Work
- [2026-02-23 Work](docs/work/archive/2026-02-23-work.md)
- [2026-02-26 LoginPage](docs/work/archive/2026-02-26-LoginPage.md)
- [2026-02-27 LoginPage Fix](docs/work/archive/2026-02-27-LoginPage-Fix.md)
- [2026-02-28 DetailPage](docs/work/archive/2026-02-28-DetailPage.md)
- [2026-03-01 Work](docs/work/archive/2026-03-01-work.md)
- [2026-03-02 Work](docs/work/archive/2026-03-02-work.md)
- [2026-03-03 Work](docs/work/archive/2026-03-03-work.md)
- [2026-03-04 Work](docs/work/archive/2026-03-04-work.md)
- [2026-03-05 Work](docs/work/archive/2026-03-05-work.md)
- [2026-03-06 Work](docs/work/archive/2026-03-06-work.md)
- [2026-03-07 Work](docs/work/archive/2026-03-07-work.md)
- [2026-03-10 Project Testing Roadmap](docs/work/0310/2026-03-10-project-testing-roadmap.md)
- [2026-03-10 Work](docs/work/0310/2026-03-10-work.md)
- [2026-03-16 Work](docs/work/0315/2026-03-16-work.md)
- [2026-03-17 Work](docs/work/0317/2026-03-17-work.md)

### Test Notes
- [Debug URL Matrix](docs/work/test-notes/debug-url-matrix.md)
- [Scroll Test](docs/work/test-notes/scroll-test.md)

---

## Dev Branch Status

현재 `dev` 브랜치는 Disney+ Renewal 작업의 통합 개발 브랜치입니다.  
UI/UX 개선, 구조 정리, 테스트 정비를 중심으로 지속적으로 업데이트하고 있습니다.

### 현재 점검 중인 항목
- 브라우저별 스크롤 복원 검증
- 모바일/태블릿 공통 spacing 시스템 정리
- 메인 페이지와 랜딩 페이지의 인터랙션 미세 조정
