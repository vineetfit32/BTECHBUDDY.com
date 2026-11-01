"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Layers,
  FileUp,
  Video,
  Radio,
  HelpCircle,
  Megaphone,
  Home,
  Tag,
  BarChart3,
  MessageSquare,
  Settings,
  CreditCard,
  LogOut,
  Shield,
  FileText,
  Briefcase,
  ArrowLeft,
  Terminal,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { label: "Central Command", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "PYQs & Question Bank", href: "/admin/pyq", icon: FileText },
    { label: "Placement & GATE Hub", href: "/admin/placement", icon: Briefcase },
    { label: "Manage Students", href: "/admin/students", icon: Users },
    { label: "Admins & Instructors", href: "/admin/staff", icon: UserCheck },
    { label: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Branches & Subjects", href: "/admin/academic", icon: Layers },
    { label: "Notes & PDFs", href: "/admin/notes", icon: FileUp },
    { label: "Video Lectures", href: "/admin/videos", icon: Video },
    { label: "Live Classes", href: "/admin/live-classes", icon: Radio },
    { label: "Quizzes & Tests", href: "/admin/quizzes", icon: HelpCircle },
    { label: "Doubt Moderation", href: "/admin/doubts", icon: MessageSquare },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Homepage Content", href: "/admin/homepage", icon: Home },
    { label: "Categories & Tags", href: "/admin/categories", icon: Tag },
    { label: "Reports & Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "User Feedback", href: "/admin/feedback", icon: MessageSquare },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
    { label: "Subscription Plans", href: "/admin/subscriptions", icon: CreditCard },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-full lg:w-64 desk-card rounded-2xl p-4 shrink-0 shadow-glow-sm h-fit">
      <div className="flex items-center justify-between px-3 py-2 mb-4 border-b border-desk-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-danger flex items-center justify-center text-white shadow-2xs">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-danger">
            ADMIN_DESK
          </span>
        </div>
        <Link
          href="/"
          className="font-mono text-[11px] text-ink-3 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Home
        </Link>
      </div>

      <nav className="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-danger text-white font-semibold shadow-2xs"
                  : "text-ink-3 hover:bg-surface-2 dark:hover:bg-desk-canvas hover:text-ink"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-ink-3"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-desk-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-mono text-xs text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Console</span>
        </button>
      </div>
    </aside>
  );
}
