"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 sm:px-20 pointer-events-none transition-transform duration-300 ${isVisible ? 'translate-y-4 sm:translate-y-8' : '-translate-y-full'}`}>
      <div
        className="
          flex items-center justify-between py-2.5 px-6 rounded-full border bg-white/30 backdrop-blur-md border-white/20 shadow-none transition-all duration-500 pointer-events-auto
        "
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/3d.png" alt="Invox Logo" width={24} height={24} className="rounded-lg" />
          <span className="font-bold text-base tracking-tight text-foreground">Invox</span>
        </Link>

        {/* Action using our custom red glass button, but scaled down for navbar */}
        <Link href="/editor" className="btn-glass !py-2 !px-4 sm:!px-6 !text-xs">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
