import { useId } from "react";
import { HiOutlinePlus } from "react-icons/hi2";

function renderAnswer(answer) {
  // 줄바꿈 뒤에 "-"가 오면 첫 문단과 불릿 리스트로 분리합니다.
  if (answer.includes("\n- ")) {
    const [first, ...bullets] = answer.split("\n- ");
    return (
      <>
        {first?.trim() && <p className="faq-p">{first.trim()}</p>}
        <ul className="faq-ul">
          {bullets.map((bullet, index) => (
            <li className="faq-li" key={index}>
              {bullet.trim()}
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

  const contentId = `accordion-content-${uid}`;
  const buttonId = `accordion-button-${uid}`;

  return (
    <details className="faq-details">
      <summary id={buttonId} className="faq-summary" aria-controls={contentId}>
        <span className="faq-q">{question}</span>
        <span className="faq-icon" aria-hidden="true">
          <HiOutlinePlus />
        </span>
      </summary>

      <div id={contentId} role="region" aria-labelledby={buttonId} className="faq-content">
        <div className="faq-content-inner">{renderAnswer(answer)}</div>
      </div>
    </details>
  );
}
