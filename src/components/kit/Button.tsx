import * as React from "react";
import Link from "next/link";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "btn-brutal",
        secondary: "btn-ghost-brutal",
        soft: "rounded-xl border border-brand/30 bg-brand-soft text-brand hover:bg-brand/20",
        ghost: "rounded-xl text-ink-2 hover:bg-surface-2 hover:text-ink",
        outline: "rounded-xl border border-line-strong bg-transparent text-ink hover:border-brand hover:text-brand",
        glass: "glass rounded-xl text-ink hover:text-brand",
        danger: "rounded-xl border-2 border-edge bg-danger text-canvas shadow-brutal-sm hover:brightness-110",
        accent: "rounded-xl border-2 border-edge bg-accent text-canvas shadow-brutal-sm hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-11 px-4 text-sm",
        lg: "h-13 px-6 text-base",
        icon: "size-10 p-0",
        "icon-sm": "size-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type Variants = VariantProps<typeof buttonVariants>;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Variants {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, icon, iconRight, children, disabled, ...props },
  ref
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
          {children}
          {iconRight}
        </>
      )}
    </Comp>
  );
});

interface ButtonLinkProps extends React.ComponentProps<typeof Link>, Variants {
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function ButtonLink({ className, variant, size, icon, iconRight, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
