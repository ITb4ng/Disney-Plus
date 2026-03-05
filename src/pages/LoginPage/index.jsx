import HeroSection from "./sections/Hero/HeroSection";
import Top10Section from "./sections/Top10/Top10Section";
import PricingSection from "./sections/Pricing/PricingSection";
import FAQSection from "./sections/FAQ/FAQSection";
import "./index.css";

export default function LoginPage() {
  return (
    <>
      <HeroSection />
      <Top10Section id="home-content" />
      <PricingSection />
      <FAQSection />
    </>
  );
}
