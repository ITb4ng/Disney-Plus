import "./FAQSection.css";
import { faqList } from "./FAQdata";
import FAQitem from "./FAQitem";

export default function FAQSection() {
  return (
    <section className="faq-section">
      <h2 className="faq-title">자주 묻는 질문</h2>
      <div className="faq-list">
        {faqList.map((item) => (
          <FAQitem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
