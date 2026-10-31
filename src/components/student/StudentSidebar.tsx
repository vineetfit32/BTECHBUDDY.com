"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bookmark,
  TrendingUp,
  History,
  Radio,
  Award,
  Bell,
  User,
  LogOut,
  GraduationCap,
  Briefcase,
  Calculator,
  Calendar,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { label: "Desk Overview", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Placement & DSA", href: "/student/placement", icon: Briefcase, badge: "Hub" },
    { label: "Study Planner", href: "/student/study-planner", icon: Calendar },
    { label: "Attendance Tracker", href: "/student/attendance", icon: Calculator },
    { label: "SGPA / CGPA Calc", href: "/student/grades", icon: TrendingUp },
    { label: "Achievements & XP", href: "/student/achievements", icon: Sparkles },
    { label: "My Courses", href: "/student/courses", icon: BookOpen },
    { label: "My Notes", href: "/student/notes", icon: FileText },
    { label: "Bookmarks", href: "/student/bookmarks", icon: Bookmark },
    { label: "Watch History", href: "/student/history", icon: History },
    { label: "Live Classes", href: "/student/live", icon: Radio, badge: "Live" },
    { label: "Quiz Results", href: "/student/quizzes", icon: Award },
    { label: "Doubt Forum", href: "/doubts", icon: MessageSquare },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Profile & Settings", href: "/student/profile", icon: User },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-full lg:w-64 desk-card rounded-2xl p-4 shrink-0 shadow-xs h-fit">
      <div className="flex items-center gap-2 px-3 py-2 mb-4 border-b border-desk-border">
        <div className="w-7 h-7 rounded-lg bg-primary-violet flex items-center justify-center text-white shadow-glow-sm">
          <GraduationCap className="w-4 h-4" />
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
          STUDENT_DESK
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary-violet text-white shadow-glow-sm font-bold"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-desk-canvas hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span
                  className={`font-mono text-[9px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-desk-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
