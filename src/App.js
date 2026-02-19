import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Nav from "./components/Nav";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import SearchPage from "./pages/SearchPage";
import Login from "./pages/Login";
import { useEffect } from "react";

const Layout = () => {
  const { pathname } = useLocation();
  const hideNav = pathname === "/login"; 

  return (
    <div className="layout">
      {!hideNav && <Nav />}
      <Outlet />
    </div>
  );
};


function App() {
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
          <Route path="/" element={<LoginPage />} />
          <Route path="main" element={<MainPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="/detail/:type/:movieId" element={<DetailPage />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
