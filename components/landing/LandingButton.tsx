"use client";

import { forwardRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface LandingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glass" | "glass-outline";
  size?: "sm" | "md" | "lg";
  icon?: IconSvgElement;
  iconPosition?: "left" | "right";
  iconProps?: { size?: number; color?: string; strokeWidth?: number };
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-3.5 text-base",
};

const LandingButton = forwardRef<HTMLButtonElement, LandingButtonProps>(
  (
    { variant = "glass", size = "md", icon, iconPosition = "right", iconProps, children, className, ...props },
    ref,
  ) => {
    const iconEl = icon ? (
      <HugeiconsIcon
        icon={icon}
        size={iconProps?.size ?? 18}
        strokeWidth={iconProps?.strokeWidth ?? 2}
        color={iconProps?.color}
      />
    ) : null;

    return (
      <button
        ref={ref}
        className={cn(variant === "glass" ? "btn-glass" : "btn-glass-outline", sizeClasses[size], className)}
        {...props}
      >
        {iconPosition === "left" && iconEl}
        {children}
        {iconPosition === "right" && iconEl}
      </button>
    );
  },
);

LandingButton.displayName = "LandingButton";
export { LandingButton as Button };
export default LandingButton;
