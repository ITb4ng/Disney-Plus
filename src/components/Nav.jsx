import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import "../components/Nav.css";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { FiSearch } from "react-icons/fi";
import { useSearchTransition } from "../contexts/SearchTransitionContext";

const Nav = () => {
  const [navOpacity, setNavOpacity] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropIn, setIsDropIn] = useState(false);

  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  /* 2) 검색 관련 상태 (Desktop + Mobile 공용) */
  const profileRef = useRef(null);
  const { transitionToken, transitionSource, triggerSearchTransition } =
    useSearchTransition();

  const [userData, setUserData] = useState(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const closeProfile = () => setIsProfileOpen(false);

  useEffect(() => {
    const nav = document.querySelector(".app-nav");
    if (!nav) return;

    const setNavHeight = () => {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };

    setNavHeight();

    const ro = new ResizeObserver(setNavHeight);
    ro.observe(nav);
    window.addEventListener("resize", setNavHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setNavHeight);
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const next = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        localStorage.setItem("userData", JSON.stringify(next));
        setUserData(next);

        if (pathname === "/login") navigate("/main", { replace: true });
      } else {
        localStorage.removeItem("userData");
        setUserData(null);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
const handleScroll = () => {
  const y = window.scrollY || 0;

  // 0 ~ 300px 구간에서 opacity 증가
  const next = Math.min(1, y / 300);

  setNavOpacity(next);
};

handleScroll();

window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isSearchRoute = pathname.startsWith("/search");
    const shouldDropIn =
      isSearchRoute &&
      (transitionSource === "nav" || transitionSource === "demo-action");

    if (!shouldDropIn) return;

    setIsDropIn(true);
    const timer = window.setTimeout(() => setIsDropIn(false), 520);
    return () => window.clearTimeout(timer);
  }, [pathname, transitionSource, transitionToken]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeProfile();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen) return;

    const onDown = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) closeProfile();
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isProfileOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      closeProfile();
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  const avatarText = (() => {
    const name = userData?.displayName?.trim();
    const email = userData?.email?.trim();
    const src = name || email || "?";
    return src[0]?.toUpperCase() ?? "?";
  })();

  return (
    <NavWrapper
      className={`app-nav ${isDropIn ? "app-nav--drop-in" : ""}`}
      $opacity={navOpacity}
    >
      <NavInner>
        <Left>
          <Logo to={userData ? "/main" : "/"}>
            <img alt="Disney Plus Logo" src="/images/logo.svg" />
          </Logo>
        </Left>

        <Right>
          {pathname !== "/" && (
            <button
              type="button"
              className="nav-mobile-search"
              aria-label="검색 페이지로 이동"
              onClick={() => {
                triggerSearchTransition("nav");
                navigate("/search", {
                  state: {
                    from: location.pathname + location.search,
                  },
                });
              }}
            >
              <FiSearch size={20} />
            </button>
          )}

          {!userData && (
            <Login as="button" type="button" onClick={() => navigate("/login")}>
              로그인
            </Login>
          )}

          {userData && (
            <>
              {pathname === "/" && (
                <Login
                  as="button"
                  type="button"
                  onClick={() => navigate("/main")}
                  style={{ marginRight: "12px" }}
                >
                  App으로 가기
                </Login>
              )}

              <SignOut ref={profileRef}>
                <UserButton
                  type="button"
                  onClick={() => setIsProfileOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                >
                  {userData?.photoURL ? (
                    <UserImg
                      src={userData.photoURL}
                      alt={userData?.displayName || "user"}
                    />
                  ) : (
                    <UserInitial>{avatarText}</UserInitial>
                  )}
                </UserButton>

                <DropDown
                  role="menu"
                  $open={isProfileOpen}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem type="button" role="menuitem" onClick={closeProfile}>
                    프로필
                  </MenuItem>

                  <MenuItem type="button" role="menuitem" onClick={closeProfile}>
                    마이페이지
                  </MenuItem>

                  <Divider />

                  <MenuItem
                    type="button"
                    role="menuitem"
                    $danger
                    onClick={handleSignOut}
                  >
                    로그아웃
                  </MenuItem>
                </DropDown>
              </SignOut>
            </>
          )}
        </Right>
      </NavInner>
    </NavWrapper>
  );
};

export default Nav;

const NavWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: rgba(9, 11, 19, ${(p) => p.$opacity});
  z-index: 10;

  @media (max-width: 1024px) {
    height: 64px;
  }

  @media (max-width: 767px) {
    height: 56px;
  }
`;

const NavInner = styled.div`
  position: relative;
  height: 100%;
  margin: 0 auto;
  padding: 0 calc(3.5vw + 5px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  column-gap: 12px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  gap: 10px;
`;

const Logo = styled(Link)`
  padding: 0;
  width: 80px;
  margin-top: 4px;
  max-height: 70px;
  font-size: 0;
  display: inline-block;
  cursor: pointer;
  flex: 0 0 auto;

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  @media (max-width: 1024px) {
    width: 72px;
    margin-top: 2px;
  }

  @media (max-width: 767px) {
    width: 64px;
    margin-top: 0;
  }
`;

const Login = styled.a`
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 1px solid #f9f9f9;
  transition: all 0.2s ease 0s;
  color: #f9f9f9;

  &:hover {
    background-color: #f9f9f9;
    color: #444;
    border-color: transparent;
  }
`;

const SignOut = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  @media (max-width: 1024px) {
    height: 42px;
    width: 42px;
  }

  @media (max-width: 767px) {
    height: 36px;
    width: 36px;
  }
`;

const UserButton = styled.button`
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  border-radius: 999px;
  cursor: pointer;
  background: transparent;
  display: grid;
  place-items: center;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.22),
      0 0 0 4px rgba(2, 231, 245, 0.22);
  }
`;

const UserImg = styled.img`
  border-radius: 999px;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

const UserInitial = styled.span`
  width: 100%;
  height: 100%;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: rgba(255, 255, 255, 0.92);
  background: radial-gradient(
    circle at 30% 30%,
    rgb(0 240 255 / 90%),
    rgb(16 18 27 / 75%)
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const DropDown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  padding: 10px;
  width: 190px;
  background: rgba(12, 14, 22, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 6px;
  transform-origin: top right;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: ${(p) =>
    p.$open ? "translateY(0) scale(1)" : "translateY(6px) scale(0.98)"};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition: opacity 160ms ease, transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1);
`;

const MenuItem = styled.button`
  width: 100%;
  border: 0;
  cursor: pointer;
  padding: 12px 12px;
  border-radius: 12px;
  text-align: left;
  font-size: 15px;
  font-weight: 700;
  color: ${(p) =>
    p.$danger ? "rgba(255, 120, 120, 0.95)" : "rgba(255,255,255,0.92)"};
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.15s ease, transform 0.12s ease;

  &:hover {
    background: ${(p) =>
      p.$danger ? "rgba(255, 90, 90, 0.12)" : "rgba(255, 255, 255, 0.07)"};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Divider = styled.div`
  height: 1px;
  margin: 4px 2px;
  background: rgba(255, 255, 255, 0.08);
`;
