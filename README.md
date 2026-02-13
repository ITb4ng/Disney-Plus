# 🎬 Disney+ Project (작업 중)

  
현재는 로그인 경험, 반응형 UI/UX 품질 개선을 중심으로 **리뉴얼 작업을 진행 중**입니다.  
Originally created three years ago as a Disney+ UI project.


# 🔗 Links

- **Production (Firebase Hosting)**  
  https://react-disney-project-6834d.web.app/

- **Preview (Renewal / WIP)**  
> https://b4ng-disney-plus-j4j5vfq69-itb4ngs-projects.vercel.app/
  

⚠️ Preview 사이트는 작업 중인 버전으로, UI가 미완성이거나 실험적인 기능이 포함될 수 있습니다.

---

## 🚧 Renewal Status

- **Working Branch:** `feature/login-renewal` (PR 예정)
- **최근 작업 내용**
  - Login Page Hero 섹션 리뉴얼
  - Today’s Top10 영역 UX 개선
  - 1024px 구간 반응형 이슈 수정
  - pricing 번들 상품 섹션 개발
  - faq 아코디언 메뉴 개발
  - 프록시 서버 구축 보안 최적화
  - footer 영역 추가

---

## ✨ What’s New / Planned

- [ ] Mobile breakpoint 보완
- [ ] Accessibility 개선 (alt, focus, contrast)
- [ ] Lighthouse 기반 성능 점검
- [ ] Mobile 이미지 최적화
- [ ] UI 마이크로 인터랙션 추가
- [ ] Pricing 섹션 ScrollTrigger로 Sticky 타이틀 적용
- [ ] FAQ / Footer 레이아웃 정리
---

## 🧩 Key Features

- Google Login + profile photo stored in LocalStorage
- 로그인 사용자만 접근 가능한 Main Page
- Search 기능에 debounce hook 적용으로 API 호출 최소화
- Swiper carousel + Lazy loading 적용
- 모바일 터치 기반 가로 스크롤 UI
- 반응형 레이아웃 전반 개선

---

## 🎨 UI/UX Improvements

- **문제:** 태블릿 구간 Hero 텍스트 정렬 깨짐  
  **개선:** 브레이크포인트별 타이포그래피 및 정렬 재설계

- **문제:** 초기 이미지 로딩 부담  
  **개선:** Lazy loading + Swiper Lazy Mode 적용

- **문제:** 검색 시 API 과다 호출  
  **개선:** debounce hook 적용

---

## 🛠 Tech Stack

- React 18
- React Router v6
- Firebase v10
- Styled-components v6
- Swiper JS
- Axios
- Create React App (react-scripts)

---

## 🚀 Getting Started

이 프로젝트는 **Create React App (react-scripts 5)** 기반으로 구성되어 있습니다.

### ✅ Requirements
- Node.js (LTS 권장: 18 또는 20)
- npm

---

### 📦 Install

```bash
npm install
```

### ▶ Run (Development)
```bash
npm start
```

🏗 Build (Production)
```bash
npm run build
```

## 🧯 Troubleshooting

### ❗ 의존성 충돌 발생 시
```bash
rm -rf node_modules package-lock.json
npm install
```
그래도 해결되지 않으면

```bash
npm install --legacy-peer-deps
```

---

## 📦 Legacy Documentation (Archived)
아래 내용은 약 3년 전 작성된 기존 README를 그대로 보존한 기록입니다.
프로젝트의 초기 구조와 기능을 보여주기 위한 용도로 유지합니다.

# 최종 버전 Firebase 배포
- https://react-disney-project-6834d.web.app/
- https://firebase.google.com/docs/cli?hl=ko
## LocalStorage Data 담기
![image](https://github.com/ITb4ng/Disney-Plus/assets/105259684/4c58866a-9b8c-4a2a-89a2-b2c534ab4543) <br>
- PhotoURL 구글계정에 프로필 사진 노출<br>
![image](https://github.com/ITb4ng/Disney-Plus/assets/105259684/8e367150-1620-4cf8-b360-408c2e54135b) <br>
- 로그인 후 Main Page
로그인을 한 사용자에 한해서 메인 페이지로
![image](https://github.com/ITb4ng/Disney-Plus/assets/105259684/8ebe14d1-d19b-42d8-99e6-2d7a7d06a110) <br> 
## Lazy Loading <a href ="https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading">
- 페이지 내에서 바로 필요하지 않은 이미지들의 로딩 시점을 뒤로 미뤄, 로딩 속도를 개선하고 유저의 리소스 비용 감소<br>
Swiper Lazy기법 이용
## UseHooks 
https://usehooks.com/usedebounce
- 불필요한 API 호출의 빈도를 줄이는 기법으로, 짧은 시간 동안 이벤트가 계속 발생하면 그 중 마지막 이벤트만 처리.
- Search Page 해당하는 영화 Api 목록을 hook을 이용해서 검색 할 수 있는 입력 바 생성
## Swiper JS
<a href ="https://swiperjs.com/react#usage">Swiper Api

<hr>

<h2>반응형 레이아웃</h2>
# Main Title
# Poster image
# 모바일 터치스크린 반응 가로 스크롤
