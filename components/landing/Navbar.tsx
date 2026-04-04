"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 sm:px-20 pointer-events-none">
      <div
        className={`
          flex items-center justify-between py-2.5 px-6 rounded-full border transition-all duration-500 pointer-events-auto
          ${scrolled
            ? "bg-white/80 backdrop-blur-lg border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            : "bg-white/30 backdrop-blur-md border-white/20 shadow-none"
          }
        `}
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
