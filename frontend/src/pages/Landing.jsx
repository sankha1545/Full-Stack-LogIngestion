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
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/16 blur-[180px]" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/12 blur-[160px]" />
        <div className="absolute left-[-8rem] top-[32rem] h-[24rem] w-[24rem] rounded-full bg-blue-700/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0)_0%,rgba(7,17,31,0.34)_40%,rgba(7,17,31,0.92)_100%)]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <Features />
        <About />
        <HowItWorks />
        <UseCases />
        <Architecture />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
