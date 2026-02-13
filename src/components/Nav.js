import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import "../components/Nav.css";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const Nav = () => {
  const [show, setShow] = useState(false);
  const { pathname } = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 767);
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  // ✅ 이전 방식: localStorage 기반 userData
  const [userData, setUserData] = useState(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ 이전 방식: auth 상태 변화를 감지해서 localStorage에 저장/삭제 + 라우팅
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

        // 로그인 후 메인으로 보내기 (원클릭 UX)
        if (pathname === "/") navigate("/main", { replace: true });
      } else {
        localStorage.removeItem("userData");
        setUserData(null);
      }
    });

    return () => unsub();
    // pathname/navigate 포함하면 라우팅 타이밍이 흔들릴 수 있어서 최소화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setSearchValue(v);
    navigate(`/search?q=${encodeURIComponent(v)}`);
  };

  // ✅ 이전 방식: 구글 팝업 로그인 단일 버튼
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged에서 /main 이동 처리
    } catch (error) {
      console.log(error);
      alert(error?.message ?? "로그인 실패");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate(`/`);
    } catch (error) {
      console.log(error);
    }
  };

  const isLoginPage = pathname === "/";

  return (
    <NavWrapper className="app-nav" $show={show}>
      <Logo>
        <img
          alt="Disney Plus Logo"
          src="/images/logo.svg"
          onClick={() => (window.location.href = "/")}
        />
      </Logo>

      {isLoginPage ? (
        // ✅ 로그인 페이지: 로그인 버튼만
        <Login as="button" type="button" onClick={handleLogin}>
          로그인
        </Login>
      ) : (
        <>
          <input className="nav__input" 
            id="nav-search"
            name="search"
            value={searchValue}
            onChange={handleChange}
            type="search"
            aria-label="영화 검색"
            placeholder={isMobile ? "검색" : "영화를 검색해주세요"}
            />
          <SignOut>
            <UserImg
              src={userData?.photoURL || "/images/default-user.png"}
              alt={userData?.displayName || "user"}
            />
            <DropDown>
              <span onClick={handleSignOut}>로그아웃</span>
            </DropDown>
          </SignOut>
        </>
      )}
    </NavWrapper>
  );
};

export default Nav;

/* ====== styled-components ====== */

const DropDown = styled.div`
  position: absolute;
  top: 42px;
  left: -20px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 10px 16px;

  background: rgba(19, 19, 19, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  border: 1px solid rgba(151, 151, 151, 0.34);
  border-radius: 8px;

  white-space: nowrap;     
  width: auto;         
  min-width: 90px;

  font-size: 13px;
  letter-spacing: 0.5px;

  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;

  pointer-events: none;
`;

const SignOut = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  &:hover ${DropDown} {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const UserImg = styled.img`
  border-radius: 50%;
  width: 100%;
  height: 100%;
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


const NavWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background-color: ${(props) => (props.$show ? "#090b13" : "transparent")};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 36px;
  letter-spacing: 16px;
  z-index: 10;
`;

const Logo = styled.a`
  padding: 0;
  width: 80px;
  margin-top: 4px;
  max-height: 70px;
  font-size: 0;
  diplay: inline-block;
  cursor: pointer;

  img {
    display: block;
    width: 100%;
  }
`;
