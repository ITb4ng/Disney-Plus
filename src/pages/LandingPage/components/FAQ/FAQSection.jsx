import "./FAQSection.css";
import { faqList } from "./FAQData";
import FAQItem from "./FAQItem";

export default function FAQSection() {
  return (
    <section className="faq-section" data-restore-anchor="landing-faq">
      <h2 className="faq-title">{"\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38"}</h2>
      <div className="faq-list">
        {faqList.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}