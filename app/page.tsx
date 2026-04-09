import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";
import BeforeAfterSection from "@/components/landing/BeforeAfterSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DemoSection from "@/components/landing/DemoSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-full">
      <Navbar />
      <HeroSection />
      <BeforeAfterSection />
      <FeaturesSection />
      <DemoSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
