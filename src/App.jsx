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
import ProtectedRoute from "./components/Common/ProtectedRoute";
import PublicOnlyRoute from "./components/Common/PublicOnlyRoute";
import "./styles/badges.css";
import { useCallback, useEffect, useState } from "react";

const Layout = () => {
  const { pathname, search } = useLocation();
  const [footerReady, setFooterReady] = useState(false);

  const isLoginRoute = pathname.startsWith("/login");
  const isSearchRoute = pathname.startsWith("/search");
  const isFeedbackRoute = pathname.startsWith("/feedback");
  const isUpdatesRoute = pathname.startsWith("/updates");

  const hideNav = isLoginRoute;
  const hideFooter =
    isLoginRoute || isSearchRoute || isFeedbackRoute || isUpdatesRoute;

  useEffect(() => {
    setFooterReady(false);

    // 안전장치: 복원 콜백이 늦어져도 footer가 영구 미표시되지 않도록 보장
    const t = setTimeout(() => setFooterReady(true), 900);
    return () => clearTimeout(t);
  }, [pathname, search]);

  const handleRestoreComplete = useCallback(() => {
    setFooterReady(true);
  }, []);

  return (
    <div className="layout">
      {!hideNav && <Nav />}
      <ScrollManager onRestoreComplete={handleRestoreComplete} />
      <Outlet />
      {!hideFooter && footerReady && <Footer />}
    </div>
  );
};

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  useEffect(() => {
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
          {/* 공개 라우트 */}
          <Route path="/" element={<LoginPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="login" element={<Login />} />
          </Route>

          {/* 보호 라우트 */}
          <Route element={<ProtectedRoute />}>
            <Route path="main" element={<MainPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="detail/:type/:movieId" element={<DetailPage />} />
            <Route path="updates" element={<UpdatesPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="feedback/new" element={<FeedbackForm />} />
            <Route path="feedback/:id/edit" element={<FeedbackForm mode="edit" />} />
          </Route>

          {/* 잘못된 detail 접근 */}
          <Route path="/detail" element={<NotFoundPage />} />
          <Route path="/detail/*" element={<NotFoundPage />} />

          {/* 전체 fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
