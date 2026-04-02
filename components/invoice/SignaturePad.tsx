"use client";

import { useEffect, useRef } from "react";
import SignaturePadLib from "signature_pad";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgba(255, 255, 255, 0)",
      penColor: "#111827",
    });
    padRef.current = pad;

    if (value) {
      pad.fromDataURL(value);
    }

    pad.addEventListener("endStroke", () => {
      onChange(pad.toDataURL());
    });

    return () => {
      pad.off();
    };
  }, []);

  const handleClear = () => {
    padRef.current?.clear();
    onChange("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={252}
          height={100}
          className="w-full touch-none"
          style={{ cursor: "crosshair" }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Draw your signature above</p>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
