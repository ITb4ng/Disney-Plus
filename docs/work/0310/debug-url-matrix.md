# Debug URL Matrix (최신)

기준 URL: `http://localhost:3000`

## 공통 상태 값
- `success`
- `loading`
- `error`
- `empty`
- `no-image`
- `cdn-fail`

---

## 1) `/` (LoginPage: Hero + Top10)

### 공통 주입 (`debugState`)
- `/`
- `/?debugState=loading`
- `/?debugState=error`
- `/?debugState=empty`
- `/?debugState=no-image`
- `/?debugState=cdn-fail`

### 개별 주입 (`heroDebug`, `top10Debug`)
- `/?heroDebug=loading&top10Debug=success`
- `/?heroDebug=success&top10Debug=error`
- `/?heroDebug=cdn-fail&top10Debug=no-image`

---

## 2) `/main` (Banner + Row)

### 공통 주입 (`debugState`)
- `/main`
- `/main?debugState=loading`
- `/main?debugState=error`
- `/main?debugState=empty`
- `/main?debugState=no-image`
- `/main?debugState=cdn-fail`

### 개별 주입 (`rowDebug`, `bannerDebug`)
- `/main?rowDebug=loading&bannerDebug=success`
- `/main?rowDebug=error&bannerDebug=success`
- `/main?rowDebug=no-image&bannerDebug=cdn-fail`
- `/main?rowDebug=success&bannerDebug=loading`
- `/main?bannerDebug=image-error`

참고:
- `bannerDebug=no-image|cdn-fail`은 내부에서 `image-error`로 매핑됩니다.
- `bannerDebug=image-error`도 URL로 직접 테스트 가능하도록 반영됨.

---

## 3) `/search` (SearchPage)

### 상태 주입 (`searchDebug`)
- `/search?q=disney&searchDebug=success`
- `/search?q=disney&searchDebug=loading`
- `/search?q=disney&searchDebug=error`
- `/search?q=disney&searchDebug=empty`
- `/search?q=disney&searchDebug=no-image`
- `/search?q=disney&searchDebug=cdn-fail`

---

## 4) `/detail/:type/:movieId` (DetailPage)

### 데이터 상태 (`debugState`)
- `/detail/movie/674?debugState=success`
- `/detail/movie/674?debugState=loading`
- `/detail/movie/674?debugState=error`
- `/detail/movie/674?debugState=empty`
- `/detail/movie/674?debugState=invalid`
- `/detail/movie/674?debugState=loading&debugDelay=1500`
- `/detail/tv/1399?debugState=success`
- `/detail/tv/1399?debugState=loading&debugDelay=1500`
- `/detail/tv/1399?debugState=error`

### 이미지 자원 상태 (`detailDebugState`)
- `/detail/movie/674?debugState=success&detailDebugState=no-image`
- `/detail/movie/674?debugState=success&detailDebugState=cdn-fail`
- `/detail/tv/1399?debugState=success&detailDebugState=no-image`
- `/detail/tv/1399?debugState=success&detailDebugState=cdn-fail`

참고:
- Detail은 데이터 상태와 이미지 상태를 분리해 테스트해야 정확합니다.

---

## 빠른 스모크 세트
1. `/?heroDebug=loading&top10Debug=success`
2. `/main?rowDebug=no-image&bannerDebug=image-error`
3. `/search?q=disney&searchDebug=loading`
4. `/detail/movie/674?debugState=error`
5. `/detail/movie/674?debugState=success&detailDebugState=cdn-fail`
