import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 12s3.5-7 10-7c2.2 0 4.1.7 5.7 1.7M22 12s-3.5 7-10 7c-2.2 0-4.1-.7-5.7-1.7" stroke="currentColor" strokeWidth="2"/>
      <path d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 2.1-.9" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const provider = useMemo(() => new GoogleAuthProvider(), []);
  const [fadeOut, setFadeOut] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);


  
  const onEmailLogin = async (e) => {
    e.preventDefault();
    setError("");

    const eMail = email.trim();
    if (!eMail || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setPending(true);
      localStorage.removeItem("isGuest");
      sessionStorage.removeItem("demo_banner");

      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, eMail, password);

      setFadeOut(true);
      setTimeout(() => {
        navigate("/main", { replace: true });
      }, 250);
    } 
    catch (err) {
      console.log(err);
      setError("로그인에 실패했습니다. 계정 정보를 확인해주세요.");
    } 
    finally {
      setPending(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    try {
      setPending(true);
      localStorage.removeItem("isGuest");
      sessionStorage.removeItem("demo_banner");
      await signInWithPopup(auth, provider);
      navigate("/main", { replace: true });
    } 
    catch (err) {
      console.log(err);
      setError("구글 로그인에 실패했습니다.");
    } 
    finally {
      setPending(false);
    }
  };

  const onDemoLogin = async () => {
    setError("");
    try {
      setPending(true);
      localStorage.setItem("isGuest", "1");
      sessionStorage.setItem("demo_banner", "1");
      
      await setPersistence(
      auth,
      remember ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, "demo@disney.dev", "12345678");
      setFadeOut(true);
      setTimeout(() => {
        navigate("/main", { replace: true });
      }, 250);
    } 
      catch (err) {
      console.log(err);
      // 실패하면 플래그 롤백
      localStorage.removeItem("isGuest");
      sessionStorage.removeItem("demo_banner");
      setError("체험 계정 로그인에 실패했습니다.");
    } 
    finally {
      setPending(false);
    }
  };

  return (
    <Wrap $fade={fadeOut}>
      <Card>
        <BrandLink to="/">
          <Brand>
            <img src="/images/logo.svg" alt="Disney+ Logo" />
          </Brand>
        </BrandLink>
      
      <Divider />


        <Title>로그인</Title>

        <Form onSubmit={onEmailLogin}>
          <Field>
            <Label htmlFor="email">아이디</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </Field>

          <Field>
            <Label htmlFor="password">비밀번호</Label>

            <InputWrap>
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
              />

              <IconBtn
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                disabled={pending}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </IconBtn>
            </InputWrap>
          </Field>

          {error && <ErrorText role="alert">{error}</ErrorText>}
          <SubActions>
            <Remember>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={pending}
              />
              <label htmlFor="remember">로그인 상태 유지</label>
            </Remember>
            <TextLink to="/reset-password">비밀번호 찾기</TextLink>
          </SubActions>

          <PrimaryBtn type="submit" disabled={pending}>
            {pending ? (
              <>
                <Spinner />
                로그인 중...
              </>
            ) : (
              "로그인"
            )}
          </PrimaryBtn>

          <DemoBtn type="button" onClick={onDemoLogin} disabled={pending}>
            체험계정으로 둘러보기 →
          </DemoBtn>

          <Divider>
            <span>또는</span>
          </Divider>

          <GoogleBtn type="button" onClick={onGoogleLogin} disabled={pending}>
            <SocialInner>
              <IconWrap>
                <FcGoogle size={18} />
              </IconWrap>
              Continue with Google
            </SocialInner>
          </GoogleBtn>
          <AppleBtn type="button">
            <SocialInner>
              <IconWrap>
                <FaApple size={18} />
              </IconWrap>
              Continue with Apple
            </SocialInner>
          </AppleBtn>
        </Form>
      </Card>
    </Wrap>
  );
}

/* ===== styled-components ===== */

const Wrap = styled.div`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  align-content: center;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  position: relative;
  overflow-x: clip;

  input, textarea, select {
    font-size: 16px;
  }

  background:
    radial-gradient(1100px 520px at 50% 12%, rgba(2,214,232,0.12), transparent 60%),
    radial-gradient(900px 520px at 20% 88%, rgba(120,72,255,0.10), transparent 62%),
    #040714;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.08;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E");
  }

  transition: opacity 200ms ease, transform 200ms ease;
  opacity: ${props => props.$fade ? 0 : 1};
  transform: ${props => props.$fade ? "translateY(8px)" : "translateY(0)"};
`;

const Card = styled.div`
  width: min(420px, 100%);
  padding: 30px 22px;
  position: relative;
  background: rgba(12, 14, 22, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.62),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  &::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    top: 0px;
    height: 105px;
    border-radius: 16px;
    pointer-events: none;
    background: radial-gradient(
      circle at 50% 0%,
      rgba(2, 214, 232, 0.18),
      transparent 65%
    );
    opacity: 0.9;
  }
`;

const BrandLink = styled(Link)`
  display: flex;
  justify-content: center;
  text-decoration: none;
`;

const Brand = styled.div`
  margin-bottom: 14px;
  position: relative;
  display: grid;
  place-items: center;

  &::after {
    content: "";
    position: absolute;
    width: 170px;
    height: 70px;
    border-radius: 999px;
    background: radial-gradient(circle at 50% 50%, rgba(2,214,232,0.18), transparent 62%);
    filter: blur(7px);
    opacity: 0.9;
    pointer-events: none;
  }

  img {
    width: 92px;
    height: auto;
    opacity: 0.95;
    position: relative;
    z-index: 1;

    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    filter: none !important;
  }
`;

const Title = styled.h1`
  margin: 18px 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: rgba(255, 255, 255, 0.95);
  text-align:center;
`;

const Form = styled.form`
  display: grid;
  gap: 12px;
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
`;

const InputWrap = styled.div`
  position: relative;
  display: grid;
`;

const IconBtn = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);

  width: 34px;
  height: 34px;
  border-radius: 10px;

  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.60);
  cursor: pointer;

  display: grid;
  place-items: center;

  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.90);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

/* Input 오른쪽 패딩 확보(아이콘 공간) */
const Input = styled.input`
  height: 46px;
  border-radius: 12px;
  padding: 0 44px 0 12px; /* ✅ 오른쪽 44px로 변경 */

  font-size: 16px;
  line-height: 1.2;

  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.95);

  outline: none;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
  }

  &:focus {
    border-color: rgba(2, 231, 245, 0.55);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 4px rgba(2, 214, 232, 0.16);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
const PrimaryBtn = styled.button`
  height: 46px;
  border-radius: 12px;
  border: 0;
  background: rgba(2, 214, 232, 0.95);
  color: rgba(2, 23, 42, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 900;
  cursor: pointer;

  box-shadow: 0 14px 34px rgba(2, 214, 232, 0.18);
  transition: transform 120ms ease, filter 160ms ease;

  &:hover {
    filter: brightness(0.85);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const GoogleBtn = styled.button`
  height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.92);

  font-weight: 600;
  cursor: pointer;

  transition: background 160ms ease, border-color 160ms ease;

  &:hover {
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.25);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const AppleBtn = styled(GoogleBtn)`
  background: rgba(0,0,0,0.35);
`;

const Divider = styled.div`
  margin: 10px 0 2px;
  position: relative;
  text-align: center;

  span {
    position: relative;
    z-index: 1;
    padding: 0 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(12, 14, 22, 0.72);
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transform: translateY(-50%);
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 120, 120, 0.95);
`;


const SubActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
`;

const Remember = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;

  input {
    width: 14px;
    height: 14px;
    cursor: pointer;
    /* 기본 브라우저 체크 유지 */
    accent-color: #02d6e8;

    /* 체크 전 배경을 어둡게 */
    background-color: #0b0f1a;
    border-radius: 4px;
  }
  label {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.65);
    cursor: pointer;
  }
  /* 체크 안 된 상태에서만 검정 배경 유지 */
  input:not(:checked) {
    background-color: #0b0f1a;
  }

  span {
    font-size: 11px;          
    font-weight: 400;       
    color: rgba(255,255,255,0.55); 
  }
`;

const TextLink = styled(Link)`
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  text-decoration: none;

  &:hover {
    color: rgba(2,214,232,0.90);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const DemoBtn = styled.button`
  margin-top: 10px;
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  justify-self: center;

  &:hover {
    color: rgba(2,214,232,0.90);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SocialInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const IconWrap = styled.div`
  display: grid;
  place-items: center;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(2, 23, 42, 0.3);
  border-top-color: rgba(2, 23, 42, 0.9);
  animation: spin 0.6s linear infinite;
  margin-right: 6px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;