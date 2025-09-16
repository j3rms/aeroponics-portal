"use client";
import React from "react";
import { cn } from "@/lib/utils";
type HeroButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const HeroButton = ({
  children,
  variant = "primary",
  size = "md",
  className,
}: HeroButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-lg font-semibold transition shadow-md",
        {
          "bg-primary text-white hover:bg-primary/90": variant === "primary",
          "bg-secondary text-primary hover:bg-secondary/90": variant === "secondary",
          "border border-primary text-primary hover:bg-primary hover:text-white":
            variant === "outline",
          "px-4 py-2 text-sm": size === "sm",
          "px-6 py-3 text-base": size === "md",
          "px-8 py-4 text-lg": size === "lg",
        },
        className
      )}
    >
      {children}
    </button>
  );
};
