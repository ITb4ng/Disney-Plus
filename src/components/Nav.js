import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import "../components/Nav.css";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

import { FiSearch } from "react-icons/fi";

const Nav = () => {
  /* 1) Router / UI 기본 상태 */
  const [show, setShow] = useState(false);           // 스크롤 시 Nav 배경 처리(show)
  const {pathname, search } = useLocation();                // 현재 라우트 경로
  const navigate = useNavigate();                    // 라우팅 이동
  const isAuthPage = pathname === "/" || pathname === "/login";
  /* 2) 검색 관련 상태 (Desktop + Mobile 공용) */
  const [searchValue, setSearchValue] = useState(""); // 검색어 입력 값
  const [isSearchOpen, setIsSearchOpen] = useState(false); // 모바일 검색 Pill 열림/닫힘
  const searchWrapRef = useRef(null);                 // 모바일 검색 영역(아이콘+input) 바깥 클릭 감지용 ref

  // 모바일 검색 닫기(공통으로 재사용)
  const closeSearch = () => setIsSearchOpen(false);

  /* 3) 반응형 상태 (Mobile 여부) */
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth <= 767
  );

  useEffect(() => {
  const nav = document.querySelector(".app-nav");
  if (!nav) return;

  const set = () => {
    const h = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--nav-h", `${h}px`);
  };

  set();

  const ro = new ResizeObserver(set);
  ro.observe(nav);

  window.addEventListener("resize", set);

  return () => {
    ro.disconnect();
    window.removeEventListener("resize", set);
  };
}, []);

  // 화면 리사이즈 감지: Mobile 여부 업데이트
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const q = new URLSearchParams(search).get("q") ?? "";

  // ✅ /search에서는 URL q를 input에 반영
  if (pathname.startsWith("/search")) {
    setSearchValue(q);
    return;
  }

  // ✅ /search가 아닌 곳으로 나가면 검색값 초기화
  setSearchValue("");
  setIsSearchOpen(false);
}, [pathname, search]);

  /* =========================================================
   * 4) 프로필 메뉴(드롭다운) 토글 상태
   * ======================================================= */
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 프로필 메뉴 열림/닫힘
  const profileRef = useRef(null);                            // 프로필 버튼 + 메뉴 래퍼 (바깥 클릭 감지용)

  const closeProfile = () => setIsProfileOpen(false);

  /* =========================================================
   * 5) 로그인 사용자 데이터 (localStorage + Firebase auth sync)
   * ======================================================= */
  const [userData, setUserData] = useState(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });


  // Firebase auth 상태 변화 감지 → localStorage 저장/삭제 + 라우팅 처리
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

        // 로그인 페이지에서 로그인되면 메인으로 이동
        if (pathname === "/login") navigate("/main", { replace: true });
      } else {
        localStorage.removeItem("userData");
        setUserData(null);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
   * 6) 스크롤 UI: Nav 배경 show 처리
   * ======================================================= */
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =========================================================
   * 7) Mobile 검색 UX 정책
   *    - 모바일에서 /search 라우트거나 검색어가 있으면 열어둠
   *    - 그 외에는 닫음
   * ======================================================= */
  useEffect(() => {
    if (!isMobile) return;

    const isSearchRoute = pathname.startsWith("/search");
    const hasQuery = searchValue.trim().length > 0;

    if (isSearchRoute || hasQuery) {
      setIsSearchOpen(true);
      return;
    }

    setIsSearchOpen(false);
  }, [pathname, isMobile, searchValue]);

  /* =========================================================
   * 8) Mobile 검색 닫힘 트리거(열려 있을 때만)
   *    - ESC / 바깥 클릭(터치 포함) / 스크롤
   * ======================================================= */

  // ESC → 모바일 검색 닫기
  useEffect(() => {
    if (!isMobile || !isSearchOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeSearch();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile, isSearchOpen]);

  // 바깥 클릭/터치 → 모바일 검색 닫기
  useEffect(() => {
    if (!isMobile || !isSearchOpen) return;

    const onDown = (e) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target)) closeSearch();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [isMobile, isSearchOpen]);

  // 스크롤 → 모바일 검색 닫기
  useEffect(() => {
    if (!isMobile || !isSearchOpen) return;

    const onScroll = () => closeSearch();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, isSearchOpen]);

  /* =========================================================
   * 9) 프로필 메뉴 닫힘 트리거
   *    - ESC / 바깥 클릭
   * ======================================================= */

  // ESC → 프로필 메뉴 닫기
  useEffect(() => {
    if (!isProfileOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeProfile();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isProfileOpen]);

  // 바깥 클릭 → 프로필 메뉴 닫기
  useEffect(() => {
    if (!isProfileOpen) return;

    const onDown = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) closeProfile();
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isProfileOpen]);

  /* =========================================================
   * 10) 이벤트 핸들러(검색/로그인/로그아웃/토글)
   * ======================================================= */

  // Enter → 검색 페이지 이동(데스크탑/모바일 공용)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = searchValue.trim();
      if (!q) return;
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  // 검색 input 변경 → 검색 페이지 이동(입력값 반영)
  const handleChange = (e) => {
    const v = e.target.value;
    setSearchValue(v);
    const trimmed = v.trim();

    if (isMobile) setIsSearchOpen(true);

    // ✅ [FIX] backspace로 빈 값이 되어도 /main으로 보내지 말기
    if (!trimmed) {
      // ✅ [FIX] search 라우트에 있을 때만 q 제거해서 /search로 정리
      if (pathname.startsWith("/search")) {
        navigate("/search", { replace: true });
      }
      // ✅ [FIX] main에서는 그냥 입력값만 비우고 끝 (리다이렉트 X)
      return;
    }
    // ✅ [FIX] 입력 중에는 history 쌓지 말고 replace
    navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
  };

  // Google 로그인
  // const handleLogin = async () => {
  //   try {
  //     await signInWithPopup(auth, provider);
  //   } catch (error) {
  //     console.log(error);
  //     alert(error?.message ?? "로그인 실패");
  //   }
  // };
//   const handleLogin = () => {
//   navigate("/login");
// };

  // 로그아웃 → 로그인 페이지로 리다이렉트
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      closeProfile();
      navigate(`/`, { replace: true });
    } catch (error) {
      console.log(error);
    }
  };


  /* =========================================================
   * 11) 파생 값(렌더링 조건/아바타 텍스트 등)
   * ======================================================= */
  // const isLoginPage = pathname === "/login";

  // 아바타 이니셜(이미지 없을 때)
  const avatarText = (() => {
    const name = userData?.displayName?.trim();
    const email = userData?.email?.trim();
    const src = name || email || "?";
    return src[0]?.toUpperCase() ?? "?";
  })();


return (
  <NavWrapper className="app-nav" $show={show}>
    <NavInner>
      <Left>
        <Logo
          to={userData ? "/main" : "/"}
          onClick={() => {
            setSearchValue("");
            setIsSearchOpen(false); // (남아있어도 무방)
          }}
        >
          <img alt="Disney Plus Logo" src="/images/logo.svg" />
        </Logo>
      </Left>

      <Center>
        {/* ✅ 데스크탑에서만 중앙 인풋 */}
        {pathname === "/" ? null : (
          !isMobile ? (
            <div className="nav-search">
              <input
                className="nav__input"
                id="nav-search"
                name="search"
                value={searchValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                type="search"
                aria-label="영화 검색"
                placeholder="영화를 검색해주세요"
                style={{ fontSize: 16 }} // ✅ iOS zoom 방지
              />

              {/* ✅ 커스텀 X (기본 캔슬 버튼 숨겨도 OK) */}
              {searchValue && (
                <button
                  type="button"
                  className="nav-search__clear"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchValue("");

                    // ✅ search 라우트면 q만 제거 (메인 강제 이동 X)
                    if (pathname.startsWith("/search")) {
                      navigate("/search", { replace: true });
                    }
                  }}
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>
          ) : null
        )}
      </Center>

      <Right>
        {/* ✅ 모바일에서만: 프로필 왼쪽에 검색 아이콘 */}
        {pathname !== "/" && isMobile && (
          <button
            type="button"
            className="nav-mobile-search"
            aria-label="검색 열기"
            onClick={() => {
              // ✅ 모바일은 아이콘 누르면 SearchPage로 진입(모달처럼)
              navigate("/search", { replace: false });
            }}
          >
            <FiSearch size={18} aria-hidden="true" />
          </button>
        )}

        {/* ---- 기존 Right 영역 (로그인/프로필) 그대로 ---- */}
        {isAuthPage ? (
          <Login as="button" type="button" onClick={() => navigate("/login")}>
            로그인
          </Login>
        ) : (
          <SignOut ref={profileRef}>
            <UserButton
              type="button"
              onClick={() => setIsProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              aria-label="사용자 메뉴 열기"
            >
              {userData?.photoURL ? (
                <UserImg
                  src={userData.photoURL}
                  alt={userData?.displayName || "user"}
                />
              ) : (
                <UserInitial aria-hidden="true">{avatarText}</UserInitial>
              )}
            </UserButton>

            <DropDown
              role="menu"
              $open={isProfileOpen}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem type="button" role="menuitem" onClick={closeProfile}>
                찜
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
        )}
      </Right>
    </NavInner>
  </NavWrapper>
);
}


export default Nav;

/* ====== styled-components ====== */

const NavWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  height: 70px;
  background-color: ${(props) =>
    props.$show ? "rgba(9, 11, 19, 1)" : "rgba(9, 11, 19, 0)"};
      transition: background-color 280ms ease;
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

  display: grid;
  grid-template-columns: 1fr auto 1fr; /* ✅ 핵심: 좌/우 동일 폭 */
  align-items: center;
  column-gap: 12px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
`;

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
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
    rgba(2, 231, 245, 0.35),
    rgba(16, 18, 27, 0.9)
  );

  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const DropDown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;

  padding: 10px;          /* 패널 여백 */
  width: 190px;

  background: rgba(12, 14, 22, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;

  box-shadow: 0 18px 40px rgba(0,0,0,0.55);

  display: flex;
  flex-direction: column;
  gap: 6px;               /* ✅ 아이템 간격 작게: 메뉴 느낌 */

  transform-origin: top right;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: ${(p) =>
    p.$open ? "translateY(0) scale(1)" : "translateY(6px) scale(0.98)"};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};

  transition: opacity 160ms ease, transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1);

  /* ✅ 위쪽 모양이 부자연스러우면 caret 제거 or 더 미니멀하게 */

`;



const MenuItem = styled.button`
  width: 100%;
  border: 0;
  cursor: pointer;

  padding: 12px 12px;     /* 터치 영역 확보 */
  border-radius: 12px;

  text-align: left;
  font-size: 15px;
  font-weight: 700;

  color: ${(p) => (p.$danger ? "rgba(255, 120, 120, 0.95)" : "rgba(255,255,255,0.92)")};
  background: rgba(255, 255, 255, 0.03); /* ✅ 너무 ‘카드’ 느낌 안 나게 살짝만 */

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
  background: rgba(255, 255, 255, 0.08); /* ✅ 더 은은하게 */
`;

