import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center gap-1.5 text-xs text-ink-3 overflow-x-auto py-1 scrollbar-none ${className}`}
    >
      <Link
        href="/"
        className="hover:text-primary-violet transition-colors flex items-center gap-1 shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-ink-3 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-primary-violet transition-colors truncate max-w-[140px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-ink truncate max-w-[160px] sm:max-w-[240px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
