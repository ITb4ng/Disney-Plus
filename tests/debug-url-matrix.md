# debug-url-matrix

이 문서는 `tests/` 기준의 실행용 URL 매트릭스입니다.
상세 설명은 `docs/0310/debug-url-matrix.md`를 기준으로 유지하고,
여기서는 실제 테스트 입력값만 빠르게 확인합니다.

기준 URL: `http://localhost:3000`

## 공통 상태
- `success`
- `loading`
- `error`
- `empty`
- `no-image`
- `cdn-fail`

## `/` LoginPage
- `/?debugState=success`
- `/?debugState=loading`
- `/?debugState=error`
- `/?debugState=empty`
- `/?debugState=no-image`
- `/?debugState=cdn-fail`
- `/?heroDebug=loading&top10Debug=success`
- `/?heroDebug=success&top10Debug=error`

## `/main` MainPage
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

## `/search` SearchPage
- `/search?q=disney&searchDebug=success`
- `/search?q=disney&searchDebug=loading`
- `/search?q=disney&searchDebug=error`
- `/search?q=disney&searchDebug=empty`
- `/search?q=disney&searchDebug=no-image`
- `/search?q=disney&searchDebug=cdn-fail`

## `/detail/:type/:movieId` DetailPage
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

### Detail 빠른 점검 세트
- `/detail/movie/674?debugState=loading`
- `/detail/movie/674?debugState=error`
- `/detail/movie/674?debugState=empty`
- `/detail/movie/674?debugState=invalid`

## 실행 예시
```bash
npx playwright test tests/scroll-restoration.spec.js --project=chromium
```

