"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { HugeiconsProps } from "@hugeicons/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glass" | "glass-outline";
  size?: "sm" | "md" | "lg";
  icon?: any; // To avoid type conflicts with HugeIcons internal types
  iconPosition?: "left" | "right";
  iconProps?: Omit<HugeiconsProps, "icon">;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "glass", size = "md", icon: Icon, iconPosition = "right", iconProps, children, ...props }, ref) => {
    const variantClass = variant === "glass" ? "btn-glass" : "btn-glass-outline";
    const sizeIcon = size === "sm" ? 16 : 18;
    
    return (
      <button
        ref={ref}
        className={`${variantClass} ${className || ""}`}
        {...props}
      >
        {Icon && iconPosition === "left" && (
          <HugeiconsIcon 
            icon={Icon} 
            size={sizeIcon} 
            strokeWidth={2} 
            {...iconProps} 
          />
        )}
        <span>{children}</span>
        {Icon && iconPosition === "right" && (
          <HugeiconsIcon 
            icon={Icon} 
            size={sizeIcon} 
            strokeWidth={2} 
            {...iconProps} 
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
