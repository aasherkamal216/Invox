"use client";

import { useEffect, useRef, useState } from "react";
import SignaturePadLib from "signature_pad";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
}

interface PadOptions {
  weight: number;     // 1–5: base thickness
  smoothness: number; // 1–5: stroke smoothing
}

function padParams({ weight, smoothness }: PadOptions) {
  const wt = (weight - 1) / 4;          // 0..1
  const st = (smoothness - 1) / 4;      // 0..1

  const maxWidth = 0.8 + wt * 3.2;      // 0.8 → 4.0
  const minWidth = 0.2 + wt * 1.2;      // 0.2 → 1.4

  const velocityFilterWeight = 0.1 + st * 0.85; // 0.1 → 0.95

  return { minWidth, maxWidth, velocityFilterWeight };
}

function sizeCanvas(canvas: HTMLCanvasElement) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d")?.scale(ratio, ratio);
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const onChangeRef = useRef(onChange);
  const [opts, setOpts] = useState<PadOptions>({ weight: 2, smoothness: 3 });

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  function buildPad(canvas: HTMLCanvasElement, options: PadOptions, dataUrl?: string) {
    padRef.current?.off();
    sizeCanvas(canvas);

    const { minWidth, maxWidth, velocityFilterWeight } = padParams(options);
    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgba(255,255,255,0)",
      penColor: "#111827",
      minWidth,
      maxWidth,
      velocityFilterWeight,
    });

    if (dataUrl) pad.fromDataURL(dataUrl);

    pad.addEventListener("endStroke", () => {
      onChangeRef.current(pad.toDataURL());
    });

    padRef.current = pad;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    buildPad(canvas, opts, value || undefined);
    return () => { padRef.current?.off(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(key: keyof PadOptions, v: number | number[]) {
    const val = Array.isArray(v) ? v[0] : v;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = padRef.current?.isEmpty() ? undefined : padRef.current?.toDataURL();
    const next = { ...opts, [key]: val };
    setOpts(next);
    buildPad(canvas, next, dataUrl);
  }

  const handleClear = () => {
    padRef.current?.clear();
    onChangeRef.current("");
  };

  const sliders: { key: keyof PadOptions; label: string }[] = [
    { key: "weight",     label: "Stroke"     },
    { key: "smoothness", label: "Smoothness" },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="border border-border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none block"
          style={{ height: "100px", cursor: "crosshair" }}
        />
      </div>

      {sliders.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground shrink-0 w-16">{label}</span>
          <Slider
            min={1}
            max={5}
            step={1}
            value={opts[key]}
            onValueChange={(v) => handleChange(key, v)}
          />
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Draw your signature above</p>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
