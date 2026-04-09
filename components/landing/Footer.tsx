"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  NewTwitterRectangleIcon,
  Github01Icon,
  Linkedin01Icon,
  Facebook01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

const socials = [
  { icon: NewTwitterRectangleIcon, href: "https://x.com/Aasher_Kamal", label: "X" },
  { icon: Github01Icon, href: "https://github.com/aasherkamal216/Invox", label: "GitHub" },
  { icon: Linkedin01Icon, href: "https://www.linkedin.com/in/aasher-kamal", label: "LinkedIn" },
  { icon: Facebook01Icon, href: "https://www.facebook.com/aasher.kamal", label: "Facebook" },
  { icon: Mail01Icon, href: "mailto:aasherkamal786@gmail.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white px-3 md:px-4 pt-6 pb-4">

      {/* ── CTA + Socials container ── */}
      <div
        className="relative w-full max-w-7xl mx-auto rounded-3xl overflow-hidden flex flex-col items-center justify-center px-6 md:px-12 py-12 md:py-28 gap-8 md:gap-12 min-h-0 md:min-h-[460px]"
        style={{
          background: "linear-gradient(140deg, #f43f5e 0%, #e11d48 100%)",
        }}
      >
        {/* Subtle inner highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)",
          }}
        />

        {/* Noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />

        {/* CTA heading */}
        <div className="relative flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
            Your next invoice is
            <br />
            a{" "}
            <span className="font-serif italic font-medium" style={{ opacity: 0.78 }}>
              conversation
            </span>{" "}
            away.
          </h2>
        </div>

        {/* Socials */}
        <div className="relative flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            {socials.map(({ icon, href, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/60 transition-colors duration-200 hover:text-white"
              >
                <HugeiconsIcon icon={icon} size={26} strokeWidth={1.5} color="currentColor" />
              </Link>
            ))}
          </div>

          {/* Copyright inside container */}
          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} Invox. Built by Aasher Kamal.
          </p>
        </div>

      </div>

    </footer>
  );
}
