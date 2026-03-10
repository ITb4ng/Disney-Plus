# 프로젝트 개선 방향 + 테스트 로드맵 (업데이트)

업데이트 기준일: 2026-03-11

## 1) 목적
- API 의존도가 높은 화면에서 `loading/error/empty/cdn-fail/no-image` 상태를 안정적으로 처리한다.
- 라우트 이동/뒤로가기/새로고침에서 스크롤 복원 규칙을 일관되게 유지한다.
- 상태 판단(컨트롤)과 렌더(View)를 분리해 테스트와 유지보수를 쉽게 만든다.

## 2) 현재 설계 방향
- 상위 컨테이너에서 상태를 결정하고 하위 View는 props 기반 렌더만 담당
- 공통 디버그 파라미터를 통해 상태를 강제해 수동/자동 테스트 효율화
- `DetailPage`는 데이터 상태(`debugState`)와 자원 상태(`detailDebugState`)를 분리해 테스트

## 3) 우선순위
1. 상태 UI 일관성
- Hero / Banner / Row / Top10 / Detail / Search 모두 상태 분기 기준 통일
- 성공 상태 외 배지/장식 요소 노출 규칙 명확화

2. 스크롤 복원 안정화
- `PUSH/REPLACE/POP/reload`별 동작을 정책 문서와 테스트로 고정
- `/main` 주요 액션(검색, 피드백, detail 왕복) 복원 정확도 유지

3. 자동 테스트 강화
- 수동 매트릭스(`debug-url-matrix`)와 Playwright 시나리오를 동기화
- 스와이프 복원(딥 페이지) 케이스를 우선 보강

## 4) 테스트 전략
### A. 컴포넌트/통합 레벨
- 상태 UI 렌더 검증: 텍스트/버튼/fallback/배지 노출 규칙
- 라우팅 state 전달 검증: `from`, `scrollY`, `detailDebugState`

### B. E2E 레벨
- `/main -> detail -> back` 스크롤 복원
- `/search`, `/feedback` 왕복 복원
- `/detail` 새로고침 복원
- Row 스와이프 복원(재진입/새로고침)

## 5) 현재 상태 요약
- 완료
- 상태 분기 UI 구조화(대부분 페이지)
- 스크롤 복원 정책 문서화/수동 검증 체계화
- Detail URL 기반 `detailDebugState` 테스트 지원 추가

- 진행 중
- Row 딥 스와이프 복원 안정화(활성 인덱스 불일치)

## 6) 다음 작업 (3월 12일)
1. 스와이프 복원을 `activeIndex` 중심에서 `translate/progress` 중심으로 보정
2. 스와이프 복원 이슈(깊은 페이지)만 별도 후속 티켓으로 분리
3. Playwright 스와이프 시나리오 assertion 개선(인덱스 + 위치 병행)
4. `docs/0310` 문서와 테스트 코드의 상태/파라미터 표기 완전 동기화
5. debug-url-matrix 기준으로 최종 수동 스모크 1회만 더 확인

