import Navbar from "../layout/Navbar";

import Hero from "../components/landingpage/Hero";
import Features from "../components/landingpage/Features";
import About from "../components/landingpage/About";
import HowItWorks from "../components/landingpage/HowitWorks/HowItWorks";
import UseCases from "../components/landingpage/UseCases/UseCases";
import Architecture from "../components/landingpage/Architecture/Architecture";
import CTA from "../components/landingpage/CTA";
import Footer from "../components/landingpage/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-600/20 blur-[160px]" />
      </div>

      <Navbar />

      <Hero />
      <Features />
      <About />
      <HowItWorks />
      <UseCases />
      <Architecture />
      <CTA />
      <Footer />
    </div>
  );
}
