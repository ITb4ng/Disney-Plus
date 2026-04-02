# Debug URL Matrix

기준 URL: `http://localhost:3000`

## 공통 상태 가이드
- `success`
- `loading`
- `error`
- `empty`
- `no-image`
- `image-error`
- `cdn-fail`

상태 의미:
- `loading`: 비동기 로딩 상태 강제
- `error`: 에러 UI 강제
- `empty`: 빈 결과 UI 강제
- `no-image`: 이미지 경로 자체가 없는 상태 강제
- `image-error`: 잘못된 이미지 경로로 `onError`를 강제로 발생시켜 fallback UI를 확인
- `cdn-fail`: 이미지를 숨기고 안전한 fallback 배경만 표시

---

## 1) `/` LandingPage

### 상태 UI 테스트 파라미터
- `debugState`: Landing 공통 상태를 hero/top10에 함께 주입
- `heroDebug`: HeroSection 상태 UI를 개별 테스트
- `top10Debug`: Top10Section 상태 UI를 개별 테스트

### 공통 주입 (`debugState`)
- `/?debugState=success`
- `/?debugState=loading`
- `/?debugState=error`
- `/?debugState=empty`
- `/?debugState=no-image`
- `/?debugState=cdn-fail`

### 개별 주입 (`heroDebug`, `top10Debug`)
- `/?heroDebug=loading&top10Debug=success`
- `/?heroDebug=success&top10Debug=error`
- `/?heroDebug=image-error&top10Debug=success`
- `/?heroDebug=success&top10Debug=image-error`
- `/?heroDebug=cdn-fail&top10Debug=no-image`

참고:
- 랜딩의 `image-error`는 공유 `debugState`보다 `heroDebug`, `top10Debug` 개별 주입으로 보는 것을 권장한다.
- `heroDebug=image-error`는 hero 이미지 강제 실패 후 fallback 배경과 안내 문구를 확인하는 용도다.
- `top10Debug=image-error`는 `Row` 기반 카드 이미지 fallback UI를 확인하는 용도다.

---

## 2) `/main` MainPage

### 상태 UI 테스트 파라미터
- `debugState`: Main 공통 상태를 row/banner에 함께 주입
- `rowDebug`: Row 카드 상태 UI를 개별 테스트
- `bannerDebug`: 배너 상태 UI와 이미지 fallback을 개별 테스트

### 공통 주입 (`debugState`)
- `/main?debugState=success`
- `/main?debugState=loading`
- `/main?debugState=error`
- `/main?debugState=empty`
- `/main?debugState=no-image`
- `/main?debugState=cdn-fail`

### 개별 주입 (`rowDebug`, `bannerDebug`)
- `/main?rowDebug=loading&bannerDebug=success`
- `/main?rowDebug=error&bannerDebug=success`
- `/main?rowDebug=no-image&bannerDebug=cdn-fail`
- `/main?rowDebug=image-error&bannerDebug=success`
- `/main?rowDebug=success&bannerDebug=loading`
- `/main?bannerDebug=image-error`

참고:
- `bannerDebug=no-image|cdn-fail`은 내부에서 `image-error`와 유사한 fallback 경로를 확인할 수 있다.
- `bannerDebug=image-error`는 URL로 직접 테스트 가능하도록 반영되어 있다.

---

## 3) `/search` SearchPage

### 상태 UI 테스트 파라미터
- `searchDebug`: 검색 결과 그리드와 상태 UI를 테스트

### 상태 주입 (`searchDebug`)
- `/search?q=disney&searchDebug=success`
- `/search?q=disney&searchDebug=loading`
- `/search?q=disney&searchDebug=error`
- `/search?q=disney&searchDebug=empty`
- `/search?q=disney&searchDebug=no-image`
- `/search?q=disney&searchDebug=image-error`
- `/search?q=disney&searchDebug=cdn-fail`

---

## 4) `/detail/:type/:movieId` DetailPage

### 상태 UI 테스트 파라미터
- `debugState`: Detail 데이터 상태 UI를 테스트
- `debugDelay`: loading 상태 체류 시간을 강제
- `detailDebugState`: hero 이미지 fallback UI를 테스트

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
- `/detail/movie/674?debugState=success&detailDebugState=image-error`
- `/detail/movie/674?debugState=success&detailDebugState=cdn-fail`
- `/detail/tv/1399?debugState=success&detailDebugState=no-image`
- `/detail/tv/1399?debugState=success&detailDebugState=image-error`
- `/detail/tv/1399?debugState=success&detailDebugState=cdn-fail`

참고:
- Detail은 데이터 상태와 hero 이미지 상태를 분리해서 테스트하는 편이 가장 정확하다.

---

## 빠른 스모크 세트
1. `/?heroDebug=loading&top10Debug=success`
2. `/?heroDebug=image-error&top10Debug=success`
3. `/?heroDebug=success&top10Debug=image-error`
4. `/main?rowDebug=no-image&bannerDebug=image-error`
5. `/search?q=disney&searchDebug=image-error`
6. `/detail/movie/674?debugState=error`
7. `/detail/movie/674?debugState=success&detailDebugState=image-error`
