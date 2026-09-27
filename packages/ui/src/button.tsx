"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "burgundy" | "outline" | "text";
type Size = "l" | "m" | "s";

const variants: Record<Variant, string> = {
  primary:
    "bg-teal-deep text-on-dark hover:bg-teal-hover hover:-translate-y-0.5 disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)]",
  burgundy:
    "bg-burgundy text-on-dark hover:bg-burgundy-hover hover:-translate-y-0.5 disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)]",
  outline:
    "border-[1.5px] border-teal-deep bg-transparent text-teal-deep hover:bg-teal-softer disabled:border-[var(--disabled-bg)] disabled:text-[var(--disabled-fg)]",
  text: "bg-transparent text-teal-deep underline decoration-mustard decoration-2 underline-offset-[6px] hover:text-navy",
};

const sizes: Record<Size, string> = {
  l: "h-16 rounded-[14px] px-8 text-[18px]",
  m: "h-12 rounded-xl px-6 text-[15px]",
  s: "h-10 rounded-[10px] px-4 text-sm",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "m",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition duration-200 ease-out focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mustard disabled:translate-y-0 disabled:shadow-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
      {children}
    </button>
  );
}
