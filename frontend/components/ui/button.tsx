import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-lime-300 text-slate-950 shadow-[0_18px_40px_rgba(193,255,114,0.22)] hover:bg-lime-200 disabled:bg-lime-300/60",
  secondary:
    "border border-white/14 bg-white/6 text-white hover:border-white/25 hover:bg-white/10 disabled:bg-white/5",
  ghost: "bg-transparent text-slate-200 hover:bg-white/8 disabled:text-slate-500",
  danger: "bg-rose-500/90 text-white hover:bg-rose-400 disabled:bg-rose-500/60",
};

export function Button({ className, type = "button", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
