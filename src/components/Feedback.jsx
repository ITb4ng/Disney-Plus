// components/Feedback.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * props
 * - variant: "teaser" | "page" (기본 teaser)
 * - isGuest: boolean (게스트면 읽기만 or 버튼만)
 * - onSubmit: async (payload) => void  // Firebase 붙일 때 연결
 */
const Feedback = ({ variant = "teaser", isGuest = false, onSubmit }) => {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isPage = variant === "page" || pathname === "/feedback";

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const disabled = useMemo(() => {
    if (isGuest) return true; // 게스트는 작성 막는 정책
    return title.trim().length < 2 || message.trim().length < 5 || sending;
  }, [title, message, sending, isGuest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    setSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        createdAt: Date.now(),
      };

      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      } else {
        // 아직 Firebase 안 붙였으니까 콘솔로만
        console.log("[feedback submit]", payload);
      }

      setTitle("");
      setMessage("");
      alert("접수 완료. 이제 내가 일해야겠지. (하...)");
    } catch (err) {
      console.error(err);
      alert("전송 실패. 인간의 세계는 늘 그렇듯 불안정합니다.");
    } finally {
      setSending(false);
    }
  };

  // teaser 모드: 메인에 꽂는 CTA
  if (!isPage) {
    return (
      <section style={{ padding: "0", margin: "16px 0 18px" }}>
        <div
          style={{
            borderRadius: 16,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              불편한 점 / 개선 아이디어
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
              한 줄만 남겨도 다음 업데이트에 반영할 명분이 생깁니다.
            </div>
          </div>
          <button
            onClick={() => nav("/feedback")}
            style={{
              cursor: "pointer",
              borderRadius: 999,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            피드백 남기기
          </button>
        </div>
      </section>
    );
  }

  // page 모드: /feedback
  return (
    <section style={{ padding: "24px", maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: 0 }}>피드백</h1>
      <p style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.6 }}>
        좋은 소리만 쓰면 재미없으니, 불편했던 것도 환영. 단, 욕은 너 혼자만
        시원하고 아무 도움도 안 됩니다.
      </p>

      {isGuest ? (
        <div
          style={{
            marginTop: 18,
            borderRadius: 14,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.20)",
          }}
        >
          <div style={{ fontWeight: 700 }}>체험 계정은 작성이 제한돼요</div>
          <div style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.6 }}>
            피드백 작성은 로그인 사용자만 가능하게 해두는 게 보통 더 깔끔합니다.
          </div>
          <button
            onClick={() => nav("/login")}
            style={{
              marginTop: 12,
              cursor: "pointer",
              borderRadius: 999,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              fontSize: 13,
            }}
          >
            로그인 하러 가기
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 18,
            borderRadius: 14,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.20)",
          }}
        >
          <label style={{ display: "block", fontSize: 13, opacity: 0.8 }}>
            제목
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 검색이 좀… 이상해요"
            style={{
              width: "100%",
              marginTop: 8,
              padding: "12px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              outline: "none",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: 13,
              opacity: 0.8,
              marginTop: 14,
            }}
          >
            내용
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="어느 화면에서, 뭐가 불편했고, 기대한 동작은 뭔지"
            rows={6}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "12px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "inherit",
              outline: "none",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              type="submit"
              disabled={disabled}
              style={{
                cursor: disabled ? "not-allowed" : "pointer",
                borderRadius: 999,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "inherit",
                fontSize: 13,
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {sending ? "전송 중..." : "전송"}
            </button>

            <button
              type="button"
              onClick={() => nav(-1)}
              style={{
                cursor: "pointer",
                borderRadius: 999,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "inherit",
                fontSize: 13,
                opacity: 0.85,
              }}
            >
              뒤로
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default Feedback;