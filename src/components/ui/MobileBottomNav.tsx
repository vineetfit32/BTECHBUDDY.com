"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, LayoutDashboard, NotebookPen, Sparkles, FileText } from "lucide-react";
import { useT } from "@/lib/use-t";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const t = useT();

  if (pathname.includes("/quizzes/") && pathname.endsWith("/attempt")) return null;
  if (pathname === "/tools/resume-builder") return null;

  const tabs = [
    { label: t("home"), href: "/", icon: Home },
    { label: t("notes"), href: "/notes", icon: NotebookPen },
    { label: t("studyBoard"), href: "/student/board", icon: LayoutDashboard },
    { label: t("pyqPapers"), href: "/pyq", icon: FileText },
    { label: t("aiCopilot"), href: "/ai-assistant", icon: Sparkles },
  ];

  return (
    <nav
      data-chrome
      aria-label="Mobile navigation"
      className="glass fixed inset-x-3 bottom-3 z-40 rounded-2xl px-1.5 py-1 print:hidden lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[52px] min-w-[60px] flex-col items-center justify-center rounded-xl px-2 py-1 transition-colors",
                active ? "text-ink" : "text-ink-3"
              )}
            >
              {active && (
                <motion.span
                  layoutId="mobile-tab"
                  className="absolute inset-0 -z-10 rounded-xl bg-brand-soft"
                  transition={{ type: "spring", stiffness: 450, damping: 36 }}
                />
              )}
              <Icon className={cn("size-5", active && "text-brand")} />
              <span className="mt-0.5 max-w-[68px] truncate text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
