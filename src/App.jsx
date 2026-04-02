import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Nav from "./components/Nav";
import ScrollManager from "./components/ScrollManager";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import PublicOnlyRoute from "./components/Common/PublicOnlyRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";
import FeedbackPage from "./pages/FeedbackPage";
import FeedbackForm from "./pages/FeedbackPage/FeedbackForm";
import Footer from "./pages/LandingPage/components/Footer/FooterSection";
import NotFoundPage from "./pages/NotFound";

const Layout = () => {
  const { pathname } = useLocation();
  const initialRestoreOverlay =
    window.location.pathname === "/main" ||
    window.location.pathname.startsWith("/detail/");
  const [showRestoreOverlay, setShowRestoreOverlay] = useState(initialRestoreOverlay);
  const overlayLockRef = useRef(initialRestoreOverlay);
  const overlayPendingCompleteRef = useRef(false);

  const isLoginRoute = pathname.startsWith("/login");
  const isSearchRoute = pathname.startsWith("/search");
  const isFeedbackRoute = pathname.startsWith("/feedback");

  const hideNav = isLoginRoute;
  const hideFooter =
    isLoginRoute || isSearchRoute || isFeedbackRoute;
  const isMainRoute = pathname === "/main";
  const isDetailRoute = pathname.startsWith("/detail/");
  const usesRestoreOverlay = isMainRoute || isDetailRoute;
  const handleRestoreComplete = useCallback(() => {
    if (overlayLockRef.current) {
      overlayPendingCompleteRef.current = true;
      return;
    }

    setShowRestoreOverlay(false);
  }, []);

  useEffect(() => {
    if (hideFooter || !usesRestoreOverlay) {
      overlayLockRef.current = false;
      overlayPendingCompleteRef.current = false;
      setShowRestoreOverlay(false);
      return undefined;
    }

    if (!overlayLockRef.current) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      overlayLockRef.current = false;
      if (overlayPendingCompleteRef.current) {
        overlayPendingCompleteRef.current = false;
        setShowRestoreOverlay(false);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [hideFooter, usesRestoreOverlay]);

  return (
    <div className="layout">
      {!hideNav && <Nav />}
      <ScrollManager onRestoreComplete={handleRestoreComplete} />
      <Outlet />
      {!hideFooter && (
        <div className="layout-footer">
          <Footer />
        </div>
      )}
      {usesRestoreOverlay && (
        <div
          className={
            showRestoreOverlay
              ? "layout-restore-overlay"
              : "layout-restore-overlay layout-restore-overlay-hidden"
          }
          aria-hidden={showRestoreOverlay ? "true" : undefined}
        >
          <div className="layout-restore-spinner" />
        </div>
      )}
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
        document.documentElement.style.setProperty("--nav-h", "0px");
        return;
      }

      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--nav-h", `${Math.ceil(h)}px`);
    };

    apply();
    if (!nav) return undefined;

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
          backgroundImage: "none",
        }}
      />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="main" element={<MainPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="detail/:type/:movieId" element={<DetailPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="feedback/new" element={<FeedbackForm />} />
            <Route path="feedback/:id/edit" element={<FeedbackForm mode="edit" />} />
          </Route>

          <Route path="/detail" element={<NotFoundPage />} />
          <Route path="/detail/*" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
