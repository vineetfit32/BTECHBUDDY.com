import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "cyan";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  href?: string;
  target?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  isLoading = false,
  href,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-xl min-h-[36px]",
    md: "px-4 py-2.5 text-xs sm:text-sm rounded-xl min-h-[44px]",
    lg: "px-6 py-3.5 text-sm sm:text-base rounded-2xl min-h-[48px]",
  }[size];

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-primary-violet hover:bg-primary-violet-hover text-white shadow-md shadow-primary-violet/25 font-bold border border-transparent active:scale-[0.98]",
    secondary:
      "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold border border-slate-200/80 dark:border-slate-700 active:scale-[0.98]",
    outline:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 active:scale-[0.98]",
    ghost:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium active:scale-[0.98]",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 active:scale-[0.98]",
    cyan:
      "bg-accent-cyan hover:opacity-90 text-slate-950 font-bold shadow-md active:scale-[0.98]",
  };

  const commonClass = `inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none ${sizeClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={commonClass} {...(props as any)}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
        <span>{children}</span>
        {iconRight}
      </Link>
    );
  }

  return (
    <button className={commonClass} disabled={disabled || isLoading} {...props}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}
