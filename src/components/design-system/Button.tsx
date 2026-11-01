import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/kit";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "cyan";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
  href?: string;
  target?: string;
}

const KIT_VARIANT = {
  primary: "primary",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "danger",
  cyan: "accent",
} as const;

/** Legacy API kept for existing screens; renders the kit button styles. */
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
  target,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant: KIT_VARIANT[variant], size }), className);
  const content = (
    <>
      {isLoading ? <Loader2 className="size-4 shrink-0 animate-spin" /> : icon}
      <span>{children}</span>
      {iconRight}
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {content}
    </button>
  );
}
