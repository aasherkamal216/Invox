import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";

export default function Home() {
  return (
    <main className="flex flex-col min-h-full">
      <Navbar />
      <HeroSection />
    </main>
  );
}
