import HeroSection from "./sections/Hero/HeroSection";
import Top10Section from "./sections/Top10/Top10Section";
import PricingSection from "./sections/Pricing/PricingSection";
import "./index.css";

export default function LoginPage() {
  return (
    <main>
      <HeroSection />
      <Top10Section />
      <PricingSection />
    </main>
  );
}
