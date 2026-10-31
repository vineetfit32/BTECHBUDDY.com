"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Briefcase,
  HelpCircle,
  User,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  // If inside active quiz attempt room or resume builder print, hide bottom nav
  if (pathname.includes("/quizzes/") && pathname.endsWith("/attempt")) return null;
  if (pathname === "/tools/resume-builder") return null;

  const tabs = [
    { label: "Home", href: "/", icon: Home },
    { label: "Notes", href: "/notes", icon: FileText },
    { label: "Placement", href: "/placement-hub", icon: Briefcase },
    { label: "Quizzes", href: "/quizzes", icon: HelpCircle },
    { label: "Portal", href: "/student/dashboard", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E162E]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 py-1 shadow-lg print:hidden"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[48px] rounded-xl transition-all ${
                isActive
                  ? "text-primary-violet font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-violet shadow-glow-sm" />
                )}
              </div>
              <span className="text-[10px] mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
