# debug-url-matrix

이 문서는 `tests/` 기준의 실행용 URL 매트릭스입니다.
상세 설명은 `docs/0310/debug-url-matrix.md`를 기준으로 유지하고,
여기서는 실제 테스트 입력값만 빠르게 확인합니다.

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
- `cdn-fail`

## `/` LoginPage 예외 처리
- `/?debugState=success`
- `/?debugState=loading`
- `/?debugState=error`
- `/?debugState=empty`
- `/?debugState=no-image`
- `/?debugState=cdn-fail`
- `/?heroDebug=loading&top10Debug=success`
- `/?heroDebug=success&top10Debug=error`

## `/main` MainPage 예외 처리
- `/main?debugState=success`
- `/main?debugState=loading`
- `/main?debugState=error`
- `/main?debugState=empty`
- `/main?debugState=no-image`
- `/main?debugState=cdn-fail`
- `/main?rowDebug=loading&bannerDebug=success`
- `/main?rowDebug=error&bannerDebug=success`
- `/main?rowDebug=no-image&bannerDebug=cdn-fail`
- `/main?bannerDebug=image-error`

## `/search` SearchPage 예외 처리
- `/search?q=disney&searchDebug=success`
- `/search?q=disney&searchDebug=loading`
- `/search?q=disney&searchDebug=error`
- `/search?q=disney&searchDebug=empty`
- `/search?q=disney&searchDebug=no-image`
- `/search?q=disney&searchDebug=cdn-fail`

## `/detail/:type/:movieId` DetailPage 예외 처리
- `/detail/movie/674?debugState=success`
- `/detail/movie/674?debugState=loading`
- `/detail/movie/674?debugState=error`
- `/detail/movie/674?debugState=empty`
- `/detail/movie/674?debugState=invalid`
- `/detail/tv/1399?debugState=success`
- `/detail/movie/674?debugState=loading&debugDelay=1500`
- `/detail/tv/1399?debugState=loading&debugDelay=1500`
- `/detail/tv/1399?debugState=error`

참고:
- `debugState`는 Detail 데이터 훅 상태(`loading|invalid|empty|error|success`)를 강제한다.
- `no-image/cdn-fail`은 Detail 쿼리 파라미터가 아니라, 모달/네비게이션 state(`detailDebugState`) 경로에서 테스트한다.
- `/detail`은 보호 라우트이므로 로그인 상태가 아니면 `/login`으로 이동된다.

### Detail 빠른 점검 세트 (샘플 디테일 보기에서 권장)
- `/detail/movie/674?debugState=loading`
- `/detail/movie/674?debugState=error`
- `/detail/movie/674?debugState=empty`
- `/detail/movie/674?debugState=invalid`

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


## tests-results
- Failed라고 나오지만 의도된 환경입니다 모든 테스트 파일 중 2개는 PX단위로 Nav에 맞게 설정되게 해놓았는데 둘 다 근사값으로 수동 검증 후 의도되게 설정이 되었습니다.

## 실행 예시
```bash
npx playwright test tests/main-route-scroll-policy.spec.js --project=chromium
npx playwright test tests/cross-route-scroll-policy.spec.js --project=chromium
```

