# Disney+ Renewal

디즈니 플러스 UI/UX 리뉴얼을 목표로 한 React 기반 SPA 프로젝트입니다.  
TMDB API를 서버 프록시 구조로 안전하게 연동하여 구현했습니다.

---

## 📦 Stable Release

현재 안정화 버전: **v0.2.4**
- 🌐 Live Demo (current dev deployment): https://b4ng-disney-plus.vercel.app/


### 🔖 Release History
- **v0.2.4  UI State 안정화 및 테스트 환경 개선**
- **v0.2.3  SearchPage | Nav | banner UX 개선**
  - Nav UX 개선
  - DetailPage preload
  - Row 캐시 안정화
  - iframe lazy loading
  - useMemo 렌더링 최적화
- **v0.2.2  Detail | Row UX 개선**
  - Nav UX 개선
  - DetailPage preload
  - Row 캐시 안정화
  - iframe lazy loading
  - useMemo 렌더링 최적화
- **v0.2.1  Detail UX 개선**
  - 영화 정보기반 Detail 동기화와 콘텐츠 별 구조 분리
  - 카드 Hover 시 영화 제목 및 출시년도 표시
  - DetailPage 이동 시 이전 SEO 메타 정보가 잔존하는 문제 수정
- **v0.2.0**
  - 체험계정 UX 개선
  - 피드백 페이지 추가
  - 권한(관리자/작성자/체험용) 분기 정리
  - 정렬/필터/리프레시 UX 반영
- v0.1.1
  - SEO 최적화 작업
- v0.1.0
  - DetailPage 구조 개편 및 Hero 전환 UX 개선

- 👉 GitHub - [v0.2.4 릴리즈 바로가기](https://github.com/ITb4ng/Disney-Plus/releases/tag/v0.2.4)에서 v0.2.4 스냅샷(zip) 다운로드 가능
- 👉 또는 git clone 후 해당 태그로 체크아웃:

```bash
git clone https://github.com/ITb4ng/Disney-Plus.git
cd Disney-Plus
git checkout v0.2.4
```
## 🧪 Local 개발 실행 방법 
```bash
npm install
npm run dev
```
### 실행 환경

- Client: http://localhost:3000
- TMDB Proxy(Server): http://localhost:4000/api/tmdb

# 🚀 주요 기능
🎬 Detail UX
 - Hero 프리로드 기반 이미지 전환
 - 스크롤 기반 비네팅 효과
 - Search → Detail 상태 유지 전환

🔐 체험계정 정책

체험계정은 피드백 작성 가능

수정/삭제는 제한

정책 안내 배너 제공

📝 피드백 페이지

리스트 / 빈 상태 / 로딩 상태 구현

권한 기반 수정 로직 (작성자 / 관리자)

정렬 / 필터 / 리프레시 UX 반영

🎨 인터랙션

Spotlight + 미세 Parallax 카드 효과

LERP 기반 부드러운 마우스 추적

모바일 환경에서 효과 최소화 처리

## 🚀 Tech Stack
- React
- React Router
- Styled-components
- Swiper
- Express (TMDB Proxy Server)
- Vercel Deployment
- TanStack Query (React Query)

## 🌐 Deployment Strategy
- GitHub Releases 기준으로 Stable 버전 관리
- feature/* → Vercel Preview 검증
- dev → 통합 개발 검증 브랜치
- release/x.y.z → 안정화 기준 브랜치
- main → Production 브랜치 (v1.0.0 이후 예정)
 

---

## 🚧 Renewal (dev) 진행 상황
현재 `dev` 브랜치는 Disney+ 리뉴얼 작업의 **메인 브랜치**입니다.  
UI/UX 개선과 구조 정리를 중심으로 지속적으로 업데이트 중입니다.

## 📚 Development Log
- [2026-02-23 Dev 브랜치 기본 브랜치로 승격](docs/2026-02-23-work.md)
- [2026-02-26 LoginPage(root) 반응형 코어 안정화](docs/2026-02-26-login-ui.md)
- [2026-02-27 Login 체험용 계정 생성](docs/2026-02-27-LoginPage-Fix.md)
- [2026-02-28 DetailPage개선](docs/2026-02-28-DetailPage.md)
- [2026-03-01 release v0.1.0 작업](docs/2026-03-01-work.md)
- [2026-03-02 release v0.1.0 수정](docs/2026-03-02-work.md)
- [2026-03-03 release v0.2.0 작업](docs/2026-03-03-work.md)
- [2026-03-04 release v0.2.0 수정](docs/2026-03-04-work.md)
- [2026-03-05 release v0.2.1 개선](docs/2026-03-05-work.md)
- [2026-03-06 release v0.2.2 개선](docs/2026-03-06-work.md)
- [2026-03-07 release v0.2.3 개선](docs/2026-03-07-work.md)
- [2026-03-09 ~ 2026-03-11 release v0.2.4 개선](docs/0310/2026-03-10-work.md)

  
### 🧭 다음 작업 예정
- *-new.disney.vercel.app 도메인 적용 
- 크로스브라우징 테스트 중 현재 크롬에서 MovideModal이 깨지는 문제
- 모바일 / 태블릿 공통 spacing system 재정의
