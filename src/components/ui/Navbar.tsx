"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Briefcase,
  Calculator,
  ChevronDown,
  Compass,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MessageSquare,
  NotebookPen,
  Radio,
  Search,
  Shield,
  Sparkles,
  User,
  Video,
  HelpCircle,
  CalendarCheck,
  CalendarRange,
  FileUser,
  Grid2x2,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { BrandMark, Wordmark } from "@/components/brand/BrandMark";
import {
  ButtonLink,
  Dialog,
  DialogTrigger,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  SheetContent,
} from "@/components/kit";
import PreferencesMenu from "./PreferencesMenu";
import SearchModal from "./SearchModal";
import { useCurrentUser, useLogout } from "@/lib/hooks/use-current-user";
import { useT } from "@/lib/use-t";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NavLink {
  key: TranslationKey;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const NAV_LINKS: NavLink[] = [
  { key: "pyqPapers", href: "/pyq", icon: FileText },
  { key: "notes", href: "/notes", icon: NotebookPen },
  { key: "videos", href: "/videos", icon: Video },
  { key: "liveClasses", href: "/live-classes", icon: Radio },
  { key: "placementHub", href: "/placement-hub", icon: Briefcase },
  { key: "aiCopilot", href: "/ai-assistant", icon: Sparkles, badge: "AI" },
];

const MORE_LINKS: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Doubt forum", href: "/doubts", icon: MessageSquare },
  { label: "Practice quizzes", href: "/quizzes", icon: HelpCircle },
  { label: "SGPA / CGPA calculator", href: "/tools/sgpa-cgpa-calculator", icon: Calculator },
  { label: "Attendance tracker", href: "/tools/attendance-tracker", icon: CalendarCheck },
  { label: "Resume builder", href: "/tools/resume-builder", icon: FileUser },
  { label: "GATE prep", href: "/gate-prep", icon: Target },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Exam planner", href: "/study-planner", icon: CalendarRange },
];

const YEAR_LINKS = [
  { label: "1st Year · Foundation", href: "/year/1", desc: "Physics, Chemistry, C, Maths & Mechanics" },
  { label: "2nd Year · Core", href: "/year/2", desc: "DSA, OOP, OS, COA & Discrete Maths" },
  { label: "3rd Year · Advanced", href: "/year/3", desc: "DBMS, Networks, DAA, TOC & Web Tech" },
  { label: "4th Year · GATE & Jobs", href: "/year/4", desc: "AI, Cloud, System Design & Electives" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const { data: user, refetch } = useCurrentUser();
  const logout = useLogout();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    void refetch();
  }, [pathname, refetch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isExamRoom = pathname?.includes("/quizzes/") && pathname?.endsWith("/attempt");
  if (isExamRoom) return null;

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href));
  const isAdmin = user && (user.role === "SUPER_ADMIN" || user.role === "ADMIN");
  const isTutor = user?.role === "INSTRUCTOR";

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        data-chrome
        style={{ viewTransitionName: "site-header" }}
        className="glass sticky top-0 z-40 w-full rounded-none border-x-0 border-t-0"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="BTECHBUDDY home">
            <BrandMark className="size-10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
            <div className="hidden flex-col leading-none sm:flex">
              <Wordmark />
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">The Engineer&apos;s Study Board</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main">
            <Menu>
              <MenuTrigger className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-2 outline-none transition-colors hover:text-ink data-[state=open]:text-brand">
                <Compass className="size-3.5 text-brand" />
                {t("years")}
                <ChevronDown className="size-3 text-ink-3" />
              </MenuTrigger>
              <MenuContent align="start" className="w-80">
                <MenuLabel>B.Tech semesters 1–8</MenuLabel>
                {YEAR_LINKS.map((y) => (
                  <MenuItem key={y.href} asChild>
                    <Link href={y.href} className="flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-ink">{y.label}</span>
                      <span className="text-[11px] text-ink-3">{y.desc}</span>
                    </Link>
                  </MenuItem>
                ))}
                <MenuSeparator />
                <MenuItem asChild>
                  <Link href="/universities">
                    <Layers className="text-accent" /> University mode (AKTU, VTU…)
                  </Link>
                </MenuItem>
              </MenuContent>
            </Menu>

            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    active ? "text-ink" : "text-ink-2 hover:text-ink"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg border border-brand/40 bg-brand-soft"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className={cn("size-3.5", active && "text-brand")} />
                  <span className="whitespace-nowrap">{t(link.key)}</span>
                  {link.badge && <span className="rounded bg-accent-soft px-1 font-mono text-[8px] font-black text-accent">{link.badge}</span>}
                </Link>
              );
            })}

            <Menu>
              <MenuTrigger className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-2 outline-none transition-colors hover:text-ink data-[state=open]:text-brand">
                <Grid2x2 className="size-3.5" />
                More
                <ChevronDown className="size-3 text-ink-3" />
              </MenuTrigger>
              <MenuContent align="end" className="w-64">
                {MORE_LINKS.map((link) => (
                  <MenuItem key={link.href} asChild>
                    <Link href={link.href}>
                      <link.icon className="text-brand" /> {link.label}
                    </Link>
                  </MenuItem>
                ))}
              </MenuContent>
            </Menu>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("search")}
              className="flex h-9 items-center gap-2 rounded-xl border border-line bg-surface-2 px-2.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-ink"
            >
              <Search className="size-4" />
              <span className="hidden lg:inline">{t("search")}…</span>
              <Kbd className="hidden lg:inline-flex">Ctrl K</Kbd>
            </button>

            <PreferencesMenu />

            {user ? (
              <Menu>
                <MenuTrigger className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 p-1 pr-2 outline-none transition-colors hover:border-line-strong">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-accent text-xs font-black uppercase text-on-brand">
                    {user.name?.[0] ?? "U"}
                  </span>
                  <span className="hidden max-w-[90px] truncate text-xs font-semibold text-ink md:inline">{user.name}</span>
                  <ChevronDown className="size-3 text-ink-3" />
                </MenuTrigger>
                <MenuContent align="end" className="w-60">
                  <div className="px-3 py-2">
                    <div className="truncate text-sm font-bold text-ink">{user.name}</div>
                    <div className="truncate font-mono text-[10px] text-ink-3">{user.email}</div>
                  </div>
                  <MenuSeparator />
                  <MenuItem asChild>
                    <Link href="/student/board">
                      <LayoutDashboard className="text-brand" /> {t("studyBoard")}
                    </Link>
                  </MenuItem>
                  <MenuItem asChild>
                    <Link href="/student/flashcards">
                      <Layers className="text-accent" /> {t("flashcards")}
                    </Link>
                  </MenuItem>
                  <MenuItem asChild>
                    <Link href="/student/profile">
                      <User /> {t("profile")}
                    </Link>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem asChild>
                      <Link href="/admin/dashboard" className="text-danger">
                        <Shield /> {t("admin")}
                      </Link>
                    </MenuItem>
                  )}
                  {isTutor && (
                    <MenuItem asChild>
                      <Link href="/teach">
                        <Radio /> Tutor desk
                      </Link>
                    </MenuItem>
                  )}
                  <MenuSeparator />
                  <MenuItem onSelect={handleLogout} className="text-danger">
                    <LogOut /> {t("logout")}
                  </MenuItem>
                </MenuContent>
              </Menu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login" className="whitespace-nowrap px-2 text-xs font-bold text-ink-2 hover:text-ink">
                  {t("signIn")}
                </Link>
                <ButtonLink href="/register" size="sm">
                  {t("register")}
                </ButtonLink>
              </div>
            )}

            <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DialogTrigger
                className="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink-2 xl:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="size-4" />
              </DialogTrigger>
              <SheetContent title="Menu" side="right">
                <div className="mb-5 flex items-center gap-2">
                  <BrandMark className="size-9" />
                  <Wordmark />
                </div>
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">{t("years")}</p>
                <div className="mb-5 grid grid-cols-2 gap-2">
                  {YEAR_LINKS.map((y) => (
                    <Link
                      key={y.href}
                      href={y.href}
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-xl border border-line bg-surface-2 p-2.5 text-xs font-bold text-ink hover:border-brand"
                    >
                      {y.label}
                    </Link>
                  ))}
                </div>
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-3">Study hub</p>
                <div className="grid grid-cols-2 gap-2">
                  {[...NAV_LINKS.map((l) => ({ ...l, label: t(l.key) })), ...MORE_LINKS.map((l) => ({ ...l, key: l.label, label: l.label }))].map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold",
                          isActive(link.href) ? "border-brand bg-brand-soft text-ink" : "border-line bg-surface-2 text-ink-2"
                        )}
                      >
                        <Icon className="size-4 shrink-0 text-brand" />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-auto pt-6">
                  {user ? (
                    <ButtonLink href="/student/board" className="w-full" onClick={() => setDrawerOpen(false)} icon={<LayoutDashboard />}>
                      {t("studyBoard")}
                    </ButtonLink>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <ButtonLink href="/login" variant="secondary" onClick={() => setDrawerOpen(false)}>
                        {t("signIn")}
                      </ButtonLink>
                      <ButtonLink href="/register" onClick={() => setDrawerOpen(false)}>
                        {t("register")}
                      </ButtonLink>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Dialog>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
