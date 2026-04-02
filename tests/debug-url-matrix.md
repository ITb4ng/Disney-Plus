# debug-url-matrix

이 문서는 `tests/` 기준의 실행용 URL 매트릭스입니다.  
상세 설명은 `docs/work/0310/debug-url-matrix.md`를 기준으로 유지하고, 여기서는 실제 테스트 입력값만 빠르게 확인합니다.

기준 URL: `http://localhost:3000`

## 디버그 테스트 목록
- 어떤 라우트를 볼 것인지
- 어떤 URL로 진입할 것인지
- 어떤 상태를 강제하는지
- 무엇을 기대해야 하는지
- 수동 점검용인지, Playwright 대상인지

## 빠른 메모
- 보호 라우트(`/main`, `/search`, `/detail/*`)는 로그인 상태 또는 E2E auth bypass가 필요하다.
- 스크롤 정책 수동 점검은 데스크탑 `1440x900` 기준으로 보는 편이 가장 안정적이다.
- 새로고침 복원 확인은 브라우저 `F5` 또는 `Ctrl+R` 기준으로만 본다.

## 공통 상태
- `success`
- `loading`
- `error`
- `empty`
- `no-image`
- `image-error`
- `cdn-fail`

참고:
- `image-error`는 이미지 `onError`를 강제로 발생시켜 fallback UI를 확인하는 상태다.
- 이미지 기반 UI가 아닌 화면에서는 `image-error` 전용 분기가 없을 수 있다.

## `/` LandingPage 예외 처리
파라미터:
- `debugState`: Landing 공통 상태를 hero/top10에 함께 주입
- `heroDebug`: HeroSection 상태 UI를 개별 테스트
- `top10Debug`: Top10Section 상태 UI를 개별 테스트

- `/?debugState=success`
- `/?debugState=loading`
- `/?debugState=error`
- `/?debugState=empty`
- `/?debugState=no-image`
- `/?debugState=cdn-fail`
- `/?heroDebug=loading&top10Debug=success`
- `/?heroDebug=success&top10Debug=error`
- `/?heroDebug=image-error&top10Debug=success`
- `/?heroDebug=success&top10Debug=image-error`
- `/?heroDebug=cdn-fail&top10Debug=no-image`

참고:
- 랜딩의 `image-error`는 공유 `debugState`보다 `heroDebug`, `top10Debug` 개별 주입으로 확인하는 편이 더 정확하다.
- `heroDebug=image-error`는 hero fallback 배경과 안내 문구를 점검할 때 사용한다.
- `top10Debug=image-error`는 Row 카드 이미지 fallback UI를 점검할 때 사용한다.

## `/main` MainPage 예외 처리
파라미터:
- `debugState`: Main 공통 상태를 row/banner에 함께 주입
- `rowDebug`: Row 카드 상태 UI를 개별 테스트
- `bannerDebug`: 배너 상태 UI와 이미지 fallback을 개별 테스트

- `/main?debugState=success`
- `/main?debugState=loading`
- `/main?debugState=error`
- `/main?debugState=empty`
- `/main?debugState=no-image`
- `/main?debugState=cdn-fail`
- `/main?rowDebug=loading&bannerDebug=success`
- `/main?rowDebug=error&bannerDebug=success`
- `/main?rowDebug=no-image&bannerDebug=cdn-fail`
- `/main?rowDebug=image-error&bannerDebug=success`
- `/main?bannerDebug=image-error`

## `/search` SearchPage 예외 처리
파라미터:
- `searchDebug`: 검색 결과 그리드와 상태 UI를 테스트

- `/search?q=disney&searchDebug=success`
- `/search?q=disney&searchDebug=loading`
- `/search?q=disney&searchDebug=error`
- `/search?q=disney&searchDebug=empty`
- `/search?q=disney&searchDebug=no-image`
- `/search?q=disney&searchDebug=image-error`
- `/search?q=disney&searchDebug=cdn-fail`
- `/search?q=disney&searchDebug=image-error`

## `/detail/:type/:movieId` DetailPage 예외 처리
파라미터:
- `debugState`: Detail 데이터 상태 UI를 테스트
- `debugDelay`: loading 상태 체류 시간을 강제
- `detailDebugState`: hero 이미지 fallback UI를 테스트

- `/detail/movie/674?debugState=success`
- `/detail/movie/674?debugState=loading`
- `/detail/movie/674?debugState=error`
- `/detail/movie/674?debugState=empty`
- `/detail/movie/674?debugState=invalid`
- `/detail/tv/1399?debugState=success`
- `/detail/movie/674?debugState=loading&debugDelay=1500`
- `/detail/tv/1399?debugState=loading&debugDelay=1500`
- `/detail/tv/1399?debugState=error`
- `/detail/movie/674?debugState=success&detailDebugState=no-image`
- `/detail/movie/674?debugState=success&detailDebugState=image-error`
- `/detail/movie/674?debugState=success&detailDebugState=cdn-fail`
- `/detail/tv/1399?debugState=success&detailDebugState=no-image`
- `/detail/tv/1399?debugState=success&detailDebugState=image-error`
- `/detail/tv/1399?debugState=success&detailDebugState=cdn-fail`

참고:
- `debugState`는 Detail 데이터 훅 상태(`loading|invalid|empty|error|success`)를 강제한다.
- `detailDebugState`는 hero 이미지 fallback 상태(`no-image|image-error|cdn-fail`)를 강제한다.
- `/detail`은 보호 라우트이므로 로그인 상태가 아니면 `/login`으로 이동된다.

### Detail 빠른 점검 세트
- `/detail/movie/674?debugState=loading`
- `/detail/movie/674?debugState=error`
- `/detail/movie/674?debugState=empty`
- `/detail/movie/674?debugState=invalid`
- `/detail/movie/674?debugState=success&detailDebugState=image-error`

## `/feedback` FeedbackPage 예외 처리
파라미터:
- `debug`: Feedback 목록 상태 UI와 안내 박스 디버그 상태를 테스트

- `/feedback?debug=loading`
- `/feedback?debug=empty`
- `/feedback?debug=error`
- `/feedback?debug=guest`
- `/feedback?debug=refreshing`
- `/feedback?debug=create-toast`
- `/feedback?debug=delete-toast`
- `/feedback/new`

## 스크롤 정책 빠른 점검
- `/`
  기대: hero 구간 새로고침은 top 유지, top10/pricing/faq/footer는 뷰포트 절반 기준으로 해당 섹션 최상단을 nav 아래에 정렬
- `/main`
  기대: 최상단 새로고침은 top 유지, 스크롤 후 새로고침은 오버레이 후 top 기준 시작, detail에서 뒤로 오면 이전 스크롤 복원
- `/detail/movie/674?debugState=success`
  기대: 기본은 top 0, trailer나 row가 절반 이상 보인 상태에서 새로고침하면 해당 래퍼 최상단을 nav 아래에 정렬
- `/detail/tv/1399?debugState=success`
  기대: movie detail과 동일한 규칙으로 확인

## Playwright 대상 파일
- `tests/main-route-scroll-policy.spec.js`
- `tests/cross-route-scroll-policy.spec.js`

## test-results
- Failed라고 보이는 항목이 있어도 의도된 환경일 수 있다. 일부 스크롤 정책 테스트는 `nav` 기준 px 근사값 검증이라 최종 판단은 수동 검증 결과와 함께 본다.

## 실행 예시
```bash
npx playwright test tests/main-route-scroll-policy.spec.js --project=chromium
npx playwright test tests/cross-route-scroll-policy.spec.js --project=chromium
```
