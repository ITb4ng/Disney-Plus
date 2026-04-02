import "./FAQSection.css";
import { faqList } from "./FAQData";
import FAQItem from "./FAQItem";

export default function FAQSection() {
  return (
    <section className="faq-section" data-restore-anchor="landing-faq">
      <h2 className="faq-title">자주 묻는 질문</h2>
      <div className="faq-list">
        {faqList.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
