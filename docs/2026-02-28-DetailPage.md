## ✅ 작업 내용 (2026-02-28)
- DetailPage의 시각적 완성도와 전환 UX를 중심으로 구조를 재정비
- Hero 이미지 전환 안정화, 반응형 보정, 비네팅 개선  
- 프로덕션 수준의 UI 완성도를 목표로 정리함

### 1) DetailPage Hero 구조 개선
- Row 클릭 시 모달 대신 Detail Hero 교체 구조로 변경
- `navigate(/detail/:type/:id)` 기반 전환 구조 확정
- replace 옵션 적용으로 자연스러운 내부 전환 처리

### 2) Hero 이미지 전환 UX 개선
- `Image()` 객체 기반 프리로드 로직 추가
- Hero 교체 전 스켈레톤 오버레이 적용
- 배경 이미지 전환 시 깜빡임 현상 완화
- tmdbImg + pickHeroSize 적용으로 해상도 최적화

### 3) 스크롤 기반 비네팅 고도화
- CSS 변수 `--vig` 기반 스크롤 강도 제어 유지
- 초기 비네팅 밝기 조정 (모바일 과암전 완화)
- 좌우 가독성 중심 그라디언트 재정비
- 불필요한 opacity transition 제거 → background transition 구조로 정리

### 4) 반응형 레이아웃 안정화
- `100svh / 100dvh` 기반 Hero 높이 유지
- heroInner 상단 여백을 `clamp + safe-area` 기반 토큰화
- 모바일/초소형 기기에서 상단 여백 자연스럽게 조정
- Detail 하단 Row 영역 스코프 분리

### 5) Search → Detail UX 흐름 개선
- SearchPage에서 상세 이동 시 검색 상태 유지
- 뒤로가기 버튼 추가 및 이전 검색 상태 복원