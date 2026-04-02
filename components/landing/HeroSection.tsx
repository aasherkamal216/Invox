"use client";

import { useEffect, useRef } from "react";
import { ArrowRight02Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/Button";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const bg = section.querySelector("[data-parallax-bg]") as HTMLElement | null;
      if (bg) {
        bg.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-screen flex flex-col items-center overflow-hidden">
      {/* ── Background Layer ── */}
      <div className="absolute inset-0 z-0 bg-white">
        <div
          data-parallax-bg
          className="absolute inset-0 will-change-transform"
          style={{ top: "0" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
            style={{ backgroundImage: "url('/background-scene.png')" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-40 flex flex-col items-center">
        {/* Heading Group */}
        <div className="text-center">
          <h1 className="animate-fade-in-up flex flex-col items-center tracking-tighter">
            <span className="text-4xl md:text-5xl font-semibold text-foreground">
              Create Beautiful
            </span>
            <span className="text-5xl md:text-6xl font-serif italic text-accent font-medium -mt-1 leading-tight tracking-tighter">
              Invoices
            </span>
          </h1>

          <p className="animate-fade-in-up mt-4 max-w-sm mx-auto text-base text-black/60 leading-relaxed font-medium" style={{ animationDelay: "0.1s" }}>
            The AI-powered invoicing tool for modern teams.
            Fast, professional, and effortless.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up flex items-center justify-center gap-4 mt-8" style={{ animationDelay: "0.2s" }}>
            <Button
              className="min-w-[190px]"
              icon={ArrowRight02Icon}
              iconPosition="right"
            >
              Start Creating
            </Button>
            <Button
              variant="glass-outline"
              className="min-w-[190px]"
              icon={PlayIcon}
              iconPosition="left"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
