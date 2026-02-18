import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";

export default function Login() {
  const navigate = useNavigate();
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

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
      await signInWithEmailAndPassword(auth, eMail, password);
      navigate("/main", { replace: true });
    } catch (err) {
      console.log(err);
      setError("로그인에 실패했습니다. 계정 정보를 확인해주세요.");
    } finally {
      setPending(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    try {
      setPending(true);
      await signInWithPopup(auth, provider);
      navigate("/main", { replace: true });
    } catch (err) {
      console.log(err);
      setError("구글 로그인에 실패했습니다.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Wrap>
      <Card>
        <Brand>
          <img src="/images/logo.svg" alt="Disney+ Logo" />
        </Brand>

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
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
          </Field>

          {error && <ErrorText role="alert">{error}</ErrorText>}

          <PrimaryBtn type="submit" disabled={pending}>
            로그인
          </PrimaryBtn>

          <Divider>
            <span>또는</span>
          </Divider>

          <GoogleBtn type="button" onClick={onGoogleLogin} disabled={pending}>
            구글로 로그인
          </GoogleBtn>
        </Form>
      </Card>
    </Wrap>
  );
}

/* ===== styled-components ===== */

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: calc(var(--nav-h, 0px) + 24px) 16px 24px;
`;

const Card = styled.div`
  width: min(420px, 100%);
  padding: 28px 22px;

  background: rgba(12, 14, 22, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px;

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.6);
`;

const Brand = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 14px;

  img {
    width: 92px;
    height: auto;
    opacity: 0.95;
  }
`;

const Title = styled.h1`
  margin: 0 0 18px;
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

const Input = styled.input`
  height: 44px;
  border-radius: 12px;
  padding: 0 12px;

  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.95);

  outline: none;
  transition: border-color 160ms ease, background 160ms ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }

  &:focus {
    border-color: rgba(2, 231, 245, 0.35);
    background: rgba(255, 255, 255, 0.08);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PrimaryBtn = styled.button`
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.95);

  font-weight: 800;
  cursor: pointer;

  transition: transform 120ms ease, background 160ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
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
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.95);

  font-weight: 800;
  cursor: pointer;

  transition: transform 120ms ease, background 160ms ease;

  &:hover {
    background: rgba(0, 0, 0, 0.45);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  margin: 8px 0 2px;
  position: relative;
  text-align: center;

  span {
    position: relative;
    z-index: 1;
    padding: 0 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(12, 14, 22, 0.82);
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: rgba(255, 255, 255, 0.10);
    transform: translateY(-50%);
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 120, 120, 0.95);
`;
