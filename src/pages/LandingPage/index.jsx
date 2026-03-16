import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeroSection from "./components/Hero/HeroSection";
import Top10Section from "./components/Top10/Top10Section";
import PricingSection from "./components/Pricing/PricingSection";
import FAQSection from "./components/FAQ/FAQSection";
import { COMMON_DEBUG_STATES, pickDebugStateFromSearchParams } from "../../utils/debugState";
import "./index.css";

export default function LandingPage() {
  const [searchParams] = useSearchParams();
  const heroDebugState = pickDebugStateFromSearchParams(searchParams, "heroDebug", {
    fallback: "success",
    allowed: COMMON_DEBUG_STATES,
  });
  const top10DebugState = pickDebugStateFromSearchParams(searchParams, "top10Debug", {
    fallback: "success",
    allowed: COMMON_DEBUG_STATES,
  });

  useEffect(() => {
    document.title = "Disney+ Renewal";
  }, []);

  return (
    <div className="landing-page">
      <HeroSection debugState={heroDebugState} />
      <Top10Section id="home-content" debugState={top10DebugState} />
      <PricingSection />
      <FAQSection />
    </div>
  );
}
