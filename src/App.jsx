import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Nav from "./components/Nav";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import SearchPage from "./pages/SearchPage";
import Login from "./pages/Login";
import Footer from "./pages/LoginPage/sections/Footer/FooterSection";
import UpdatesPage from "./pages/DemoPage/UpdatePage";
import FeedbackPage from "./pages/DemoPage/FeedbackPage";
import FeedbackForm from "./pages/DemoPage/Form/FeedbackForm";
import ScrollManager from "./components/ScrollManager";
import NotFoundPage from "./pages/NotFoundPage";
import "./styles/badges.css";
import { useEffect } from "react";

const Layout = () => {
  const { pathname } = useLocation();

  const isLoginRoute = pathname.startsWith("/login");
  const isSearchRoute = pathname.startsWith("/search");
  const isFeedbackRoute = pathname.startsWith("/feedback");
  const isUpdatesRoute = pathname.startsWith("/updates");

  const hideNav = isLoginRoute;
  const hideFooter = isLoginRoute || isSearchRoute || isFeedbackRoute || isUpdatesRoute;

  return (
    <div className="layout">
      {!hideNav && <Nav />}
      <ScrollManager />
      <Outlet />
      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  useEffect(() => {
    // ✅ 브라우저 기본 스크롤 복구 끄기 (한 번만)
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // ✅ nav 높이 계산
    const nav = document.querySelector(".app-nav");

    const apply = () => {
      if (!nav) {
        document.documentElement.style.setProperty("--nav-h", `0px`);
        return;
      }
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--nav-h", `${Math.ceil(h)}px`);
    };

    apply();
    if (!nav) return;

    const ro = new ResizeObserver(apply);
    ro.observe(nav);

    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <div className="app">
      <div
        className="app-bg"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/home-background.png)`,
        }}
      />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="main" element={<MainPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="/detail" element={<NotFoundPage />} />
          <Route path="/detail/*" element={<NotFoundPage />} />
          <Route path="detail/:type/:movieId" element={<DetailPage />} />
          <Route path="login" element={<Login />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="feedback/new" element={<FeedbackForm />} />
          <Route path="feedback/:id/edit" element={<FeedbackForm mode="edit" />} />
          {/* 전체 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
