import { Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import Nav from './components/Nav';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import DetailPage from './pages/DetailPage';
import SearchPage from './pages/SearchPage';
import { useEffect } from "react";



const Layout =() => {
  return(
    <div>
      <Nav />
      <Outlet />
    </div>
  )
}


function App() {
  useEffect(() => {
    const nav = document.querySelector(".app-nav");
    if (!nav) return;

    const apply = () => {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--nav-h", `${Math.ceil(h)}px`);
    };

    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(nav);

    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
   <div className='app'>
     <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="main" element={<MainPage />} />
        <Route path=":movieId" element={<DetailPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>
    </Routes>

   </div>
  )
}

export default App;

