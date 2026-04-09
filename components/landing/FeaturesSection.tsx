"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Upload01Icon,
  AiBeautifyIcon,
  CellsIcon,
  Edit01Icon,
  AiVoiceIcon,
  Download06Icon,
  SignatureIcon,
  Blockchain01Icon,
} from "@hugeicons/core-free-icons";

const features: {
  icon: IconSvgElement;
  title: string;
  description: string;
  className: string;
}[] = [
  {
    icon: AiBeautifyIcon,
    title: "Natural Language Editing",
    description:
      "Describe changes in plain English across multiple turns. The AI reads context, applies updates, and streams changes back in real time.",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: CellsIcon,
    title: "12 Professional Templates",
    description:
      "From standard to retro, every template supports full color, font, and layout customization.",
    className: "col-span-1",
  },
  {
    icon: Upload01Icon,
    title: "Upload Any Document",
    description:
      "Drop in a document or photo. The AI builds your invoice with no manual entry required.",
    className: "col-span-1",
  },
  {
    icon: Edit01Icon,
    title: "Inline Editing",
    description:
      "Click any field directly on the invoice to edit it. No forms, no sidebars required.",
    className: "col-span-1",
  },
  {
    icon: AiVoiceIcon,
    title: "Voice Dictation",
    description:
      "Tap the mic to describe your invoice. It's transcribed and sent straight to the AI.",
    className: "col-span-1",
  },
  {
    icon: Download06Icon,
    title: "One-Click PDF Export",
    description:
      "Export at print-ready resolution. Fonts, colors, and layout are preserved exactly as they appear on screen.",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: SignatureIcon,
    title: "Signature Support",
    description:
      "Type a signature or draw one freehand on a pressure-sensitive canvas. Both export cleanly to PDF.",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Blockchain01Icon,
    title: "Local-First & Private",
    description:
      "Everything lives in your browser. No account, no server storage, no data leaving your machine.",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative w-full bg-white py-24 overflow-hidden">
      {/* Top-left gradient — mirrors BeforeAfterSection's bottom-left for smooth transition */}
      <div
        className="absolute top-0 left-0 w-[450px] h-[450px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(244,63,94,0.15) 0%, transparent 70%)",
        }}
      />
      {/* Bottom-right Corner gradient */}
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(244,63,94,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-6 md:px-10">

        {/* ── Heading ── */}
        <div className="text-center mb-14 md:mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight leading-[1.2]">
            Everything I kept wishing
            <br />
            <span className="font-serif italic font-medium text-accent">other tools had.</span>
          </h2>
        </div>

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t-[1.5px] border-l-[1.5px] border-dashed border-black/15">
          {features.map((f) => (
            <div
              key={f.title}
              className={`${f.className} flex flex-col gap-4 p-7 border-b-[1.5px] border-r-[1.5px] border-dashed border-black/15`}
            >
              {/* Rose emboss icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244,63,94,0.88) 0%, rgba(225,29,72,0.95) 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.15) inset, 0 1px 3px rgba(244,63,94,0.15), 0 4px 12px rgba(244,63,94,0.18)",
                }}
              >
                <HugeiconsIcon icon={f.icon} size={18} color="white" strokeWidth={1.8} />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-foreground leading-snug">{f.title}</p>
                <p className="text-xs text-black/45 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section separator */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div className="absolute left-0 w-[35%] h-full" style={{
          background: "linear-gradient(to right, rgba(244,63,94,0.5) 60%, transparent 100%)",
          filter: "blur(1px)",
        }} />
        <div className="absolute right-0 w-[35%] h-full" style={{
          background: "linear-gradient(to left, rgba(244,63,94,0.5) 60%, transparent 100%)",
          filter: "blur(1px)",
        }} />
      </div>
    </section>
  );
}
