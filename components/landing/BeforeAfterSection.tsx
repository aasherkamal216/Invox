import Image from "next/image";

export default function BeforeAfterSection() {
  return (
    <section className="relative w-full bg-white py-24 md:py-32 overflow-hidden">

      {/* Corner gradient */}
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom right, rgba(244,63,94,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6">

        {/* ── Heading ── */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight leading-[1.2]">
            40 minutes per invoice.
            <br />
            <span className="font-serif italic font-medium text-accent">Not anymore.</span>
          </h2>
        </div>

        {/* ── Comparison row ── */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">

          {/* Before */}
          <div className="flex-1 flex flex-col items-center w-full max-w-[380px] mx-auto md:mx-0">
            <p className="text-2xl font-bold text-black/40 mb-4 tracking-tight">Before</p>
            <div className="relative aspect-square w-full">
              <Image
                src="/before-invoice.png"
                alt="Invoice I created manually in Adobe Illustrator"
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, 380px"
              />
            </div>
            <p className="mt-4 text-sm text-black/40 text-center leading-relaxed max-w-[280px]">
              Manual formatting, hand-calculated totals, basic look — every single time.
            </p>
          </div>

          {/* Arrow — desktop */}
          <div className="hidden md:flex items-center justify-center w-40 flex-shrink-0">
            <SwooshArrow />
          </div>

          {/* Arrow — mobile */}
          <div className="flex md:hidden justify-center py-1">
            <SwooshArrowDown />
          </div>

          {/* After */}
          <div className="flex-1 flex flex-col items-center w-full max-w-[380px] mx-auto md:mx-0">
            <p className="text-2xl font-bold opacity-80 text-accent mb-4 tracking-tight">After</p>
            <div className="relative aspect-square w-full">
              <Image
                src="/after-invoice.png"
                alt="Professional invoice I now create with Invox AI in seconds"
                fill
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 100vw, 380px"
              />
            </div>
            <p className="mt-4 text-sm text-black/40 text-center leading-relaxed max-w-[280px]">
              Upload your contract, describe your work. Done. Every invoice looks premium.
            </p>
          </div>

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

/** Desktop: horizontal dashed swoosh with marker-end arrowhead */
function SwooshArrow() {
  const c = "rgba(244,63,94,0.55)";
  return (
    <svg width="160" height="100" viewBox="0 0 160 100" fill="none" aria-hidden="true">
      <defs>
        <marker
          id="swoosh-h"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 0,0.5 L 9,5 L 0,9.5"
            fill="none"
            stroke={c}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <path
        d="M 15,72 C 35,10 120,90 145,35"
        stroke={c}
        strokeWidth="2.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
        markerEnd="url(#swoosh-h)"
      />
    </svg>
  );
}

/** Mobile: vertical dashed swoosh with marker-end arrowhead */
function SwooshArrowDown() {
  const c = "rgba(244,63,94,0.55)";
  return (
    <svg width="70" height="90" viewBox="0 0 70 90" fill="none" aria-hidden="true">
      <defs>
        <marker
          id="swoosh-v"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path
            d="M 0,0.5 L 9,5 L 0,9.5"
            fill="none"
            stroke={c}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <path
        d="M 17,10 C 65,27 7,62 52,80"
        stroke={c}
        strokeWidth="2.5"
        strokeDasharray="6 5"
        strokeLinecap="round"
        markerEnd="url(#swoosh-v)"
      />
    </svg>
  );
}
