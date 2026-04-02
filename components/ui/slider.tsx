"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({
  className,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderProps): React.ReactElement {
  const currentValue = Array.isArray(value) ? value[0] : value ?? min;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onValueChange?.(Array.isArray(value) ? [val] : val);
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full h-8 flex items-center group", className)}>
      {/* Custom Track Background */}
      <div className="absolute w-full h-1 bg-muted rounded-full" />
      
      {/* Custom Indicator (Filled part) */}
      <div 
        className="absolute h-1 bg-primary rounded-full"
        style={{ width: `${percentage}%` }}
      />
      
      {/* Native Range Input (Transparent, centered on Track) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className={cn(
          "absolute w-full h-1 appearance-none bg-transparent cursor-pointer z-10",
          // Webkit Thumb Styling
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:size-5 sm:[&::-webkit-slider-thumb]:size-4",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-white",
          "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-input",
          "[&::-webkit-slider-thumb]:shadow-xs/5",
          "[&::-webkit-slider-thumb]:transition-[scale,box-shadow]",
          "[&::-webkit-slider-thumb]:active:scale-110",
          "hover:[&::-webkit-slider-thumb]:border-primary/50",
          "focus-visible:[&::-webkit-slider-thumb]:ring-[3px] focus-visible:[&::-webkit-slider-thumb]:ring-ring/24",
          // Moz Thumb Styling
          "[&::-moz-range-thumb]:size-5 sm:[&::-moz-range-thumb]:size-4",
          "[&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-white",
          "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-input",
          "[&::-moz-range-thumb]:shadow-xs/5",
          "[&::-moz-range-thumb]:transition-[scale,box-shadow]",
          "[&::-moz-range-thumb]:active:scale-110",
          "hover:[&::-moz-range-thumb]:border-primary/50",
          "focus-visible:[&::-moz-range-thumb]:ring-[3px] focus-visible:[&::-moz-range-thumb]:ring-ring/24",
          "border-none outline-none"
        )}
        {...props}
      />
    </div>
  );
}

export function SliderValue({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn("flex justify-end text-sm text-muted-foreground font-medium", className)}
      {...props}
    >
      {children}
    </div>
  );
}
