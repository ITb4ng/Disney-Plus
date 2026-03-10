import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeroSection from "./sections/Hero/HeroSection";
import Top10Section from "./sections/Top10/Top10Section";
import PricingSection from "./sections/Pricing/PricingSection";
import FAQSection from "./sections/FAQ/FAQSection";
import { COMMON_DEBUG_STATES, pickDebugStateFromSearchParams } from "../../utils/debugState";
import "./index.css";

export default function LoginPage() {
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
    <>
      <HeroSection debugState={heroDebugState} />
      <Top10Section id="home-content" debugState={top10DebugState} />
      <PricingSection />
      <FAQSection />
    </>
  );
}
