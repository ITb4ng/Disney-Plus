# Disney+ Renewal

Disney+ UI/UX를 React 기반으로 재해석한 SPA 프로젝트입니다.  
TMDB 데이터를 프록시 서버를 통해 조회하고, 상세 페이지 전환 UX, 스크롤 복원 정책, 피드백 페이지, 상태 UI 및 fallback UI까지 함께 다루고 있습니다.

## Release Status

- 현재 기준선 문서: **v1.0.0**
- 릴리즈 문서: [docs/release/2026-04-02-v1.0.0.md](docs/release/2026-04-02-v1.0.0.md)
- 이번 릴리즈는 `v0.3.0`의 수정 사항과 이슈를 보완하고 개선한 뒤, 프로덕션 메인 브랜치 기준선으로 확정하는 버전입니다.

## Core Features

- 랜딩, 메인, 검색, 상세 페이지 전반의 Disney+ 스타일 UI/UX
- `loading / error / empty` 상태 UI 분리
- `no-image / image-error / cdn-fail` fallback UI 일관 적용
- `main -> modal -> detail` 이동 시 debug 상태 전달
- 라우트별 스크롤 복원 정책 분리
- 피드백 목록/등록/수정 흐름과 공용 안내 박스 UI
- 체험 계정, 일반 계정, 관리자 계정 기준 권한 분기

## Pages

- `LandingPage`
- `MainPage`
- `SearchPage`
- `DetailPage`
- `FeedbackPage`
- `Login`
- `NotFound`

## Tech Stack

- React 18
- React Router
- Styled Components
- Swiper
- TanStack Query
- Firebase
- Express
- Playwright

## Local Development

### 1. Install

```bash
npm install
npm --prefix server install
```

### 2. Environment

루트 `.env.local`은 아래 키를 기준으로 맞춥니다.

```bash
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
TMDB_API_KEY=
```

예시는 [.env.example](.env.example)에 있습니다.

### 3. Run

클라이언트:

```bash
npm run client
```

TMDB 프록시 서버:

```bash
npm --prefix server run dev
```

빌드:

```bash
npm run build
```

## Test

Jest:

```bash
npm test
```

피드백 반응형/시각 테스트:

```bash
npm run test:feedback
npm run test:feedback:responsive
npm run test:feedback:visual
npm run test:feedback:visual:update
```

Playwright는 [playwright.config.js](playwright.config.js) 기준으로 `http://localhost:3000`을 사용합니다.

## Debug / QA

상태 UI와 fallback UI를 확인하기 위한 디버그 URL 매트릭스는 아래 문서를 참고합니다.

- [docs/work/test-notes/debug-url-matrix.md](docs/work/test-notes/debug-url-matrix.md)
- [docs/work/0310/debug-url-matrix.md](docs/work/0310/debug-url-matrix.md)

## Documentation

### Release

- [2026-03-16 v0.3.0](docs/release/2026-03-16-v0.3.0.md)
- [2026-03-17 v0.3.0](docs/release/2026-03-17-v0.3.0.md)
- [2026-04-02 v1.0.0](docs/release/2026-04-02-v1.0.0.md)

### Logs

- [2026-03-09 release log v0.2.4](docs/logs/2026-03-09-release-log-0.2.4.md)
- [2026-03-10 retrospective](docs/logs/2026-03-10-retrospective.md)
- [2026-03-16 release log v0.3.0](docs/logs/2026-03-16-release-log-0.3.0.md)
- [2026-03-17 release log v0.3.0](docs/logs/2026-03-17-release-log-0.3.0.md)
- [2026-04-02 release diff review](docs/logs/2026-04-02-release-0.3.0-diff-review.md)

### Work

- [2026-04-01 work](docs/work/2026-04-01-work.md)
- [2026-04-02 work](docs/work/2026-04-02-work.md)
- [2026-03-10 project testing roadmap](docs/work/0310/2026-03-10-project-testing-roadmap.md)
- [2026-03-10 work](docs/work/0310/2026-03-10-work.md)
- [2026-03-16 work](docs/work/0315/2026-03-16-work.md)
- [2026-03-17 work](docs/work/0317/2026-03-17-work.md)

### Test Notes

- [debug URL matrix](docs/work/test-notes/debug-url-matrix.md)
- [scroll test](docs/work/test-notes/scroll-test.md)

## Branch Strategy

- `main`: 프로덕션 메인 브랜치
- `dev`: 통합 개발 브랜치
- `release/x.y.z`: 릴리즈 정리 및 검증 브랜치
- `hotfix/x.y.z`: 배포 이후 긴급 수정 브랜치

## Notes

- 프로덕션 배포 이후 이슈 대응은 `hotfix` 브랜치를 생성해 진행합니다.
- 빌드 시 `Browserslist: caniuse-lite is outdated` 경고가 보일 수 있으며, 이는 배포 차단 이슈는 아닙니다.
