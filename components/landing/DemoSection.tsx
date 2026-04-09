"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";

export default function DemoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    
    if (!video || !section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch((error) => {
              console.log("Autoplay prevented:", error);
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.5, // Play when 50% of the section is visible
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="demo" ref={sectionRef} className="relative w-full bg-white py-24 overflow-hidden">
      {/* Top-left gradient — mirrors BeforeAfterSection's bottom-left for smooth transition */}
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(244,63,94,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-6 md:px-10">

        {/* ── Heading ── */}
        <div className="text-center mb-12 md:mb-14">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight leading-[1.2]">
            From contract to invoice —
            <br />
            <span className="font-serif italic font-medium text-accent">watch it happen.</span>
          </h2>
        </div>

        {/* ── Video ── */}
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            border: "5px solid rgba(244,63,94,0.2)",
            boxShadow: "0 8px 32px rgba(244,63,94,0.15)",
          }}
        >
          {videoError ? (
            // Fallback placeholder with play icon
            <div className="relative w-full aspect-video">
              <Image
                src="/background-scene.png"
                alt="Demo video placeholder"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(244,63,94,0.88) 0%, rgba(225,29,72,0.95) 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.15) inset, 0 1px 3px rgba(244,63,94,0.15), 0 4px 12px rgba(244,63,94,0.18)",
                  }}
                >
                  <HugeiconsIcon icon={PlayIcon} size={28} color="white" strokeWidth={1.8} />
                </div>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src="/videos/invox-demo-video.mp4"
              loop
              muted
              playsInline
              className="w-full h-auto block"
              onError={() => setVideoError(true)}
            />
          )}
        </div>

      </div>
    </section>
  );
}
