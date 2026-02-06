import { useEffect, useId, useRef } from "react";

function renderAnswer(answer) {
  // "\n- " 패턴이 있으면: 첫 문장 + bullet 리스트로 렌더링
  if (answer.includes("\n- ")) {
    const [first, ...bullets] = answer.split("\n- ");
    return (
      <>
        {first?.trim() && <p className="faq-p">{first.trim()}</p>}
        <ul className="faq-ul">
          {bullets.map((b, i) => (
            <li className="faq-li" key={i}>
              {b.trim()}
            </li>
          ))}
        </ul>
      </>
    );
  }

  return <p className="faq-p">{answer}</p>;
}

export default function FAQItem({ item }) {
  const { question, answer } = item;

  const uid = useId();
  const contentRef = useRef(null);
  const detailsRef = useRef(null);

  const contentId = `accordion-content-${uid}`;
  const buttonId = `accordion-button-${uid}`;

  const setHeightVar = () => {
    const contentEl = contentRef.current;
    const detailsEl = detailsRef.current;
    if (!contentEl || !detailsEl) return;

    const next = detailsEl.open ? contentEl.scrollHeight : 0;
    contentEl.style.setProperty("--accordion-max-height", `${next}px`);
  };

  useEffect(() => {
    // 초기값 세팅 (SSR/첫 렌더 흔들림 방지)
    setHeightVar();

    // 폰트 로딩/리사이즈로 높이가 바뀌면 열린 항목은 다시 계산
    const onResize = () => setHeightVar();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <details
      ref={detailsRef}
      className="faq-details"
      onToggle={setHeightVar}
    >
      <summary
        id={buttonId}
        className="faq-summary"
        aria-controls={contentId}
      >
        <span className="faq-q">{question}</span>

        {/* 공홈 느낌: +가 열리면 -처럼 보이게 회전 */}
        <span className="faq-icon" aria-hidden="true">
          +
        </span>
      </summary>

      <div
        ref={contentRef}
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-content"
        style={{ "--accordion-max-height": "0px" }}
      >
        <div className="faq-content-inner">{renderAnswer(answer)}</div>
      </div>
    </details>
  );
}
