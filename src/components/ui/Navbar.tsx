"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Search,
  Menu,
  X,
  BookOpen,
  Video,
  Radio,
  HelpCircle,
  FileText,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Shield,
  Briefcase,
  Calculator,
  Sparkles,
  MessageSquare,
  Award,
  Compass,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SearchModal from "./SearchModal";
import DataSaverToggle from "./DataSaverToggle";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [yearsDropdownOpen, setYearsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Distraction-free exam room: hide navbar
  const isExamRoom = pathname?.includes("/quizzes/") && pathname?.endsWith("/attempt");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setUserDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isExamRoom) return null;

  const navLinks = [
    { label: "PYQs", href: "/pyq", icon: FileText, badge: "NEW" },
    { label: "Notes", href: "/notes", icon: FileText },
    { label: "Lectures", href: "/videos", icon: Video },
    { label: "Live Classes", href: "/live-classes", icon: Radio },
    { label: "Placement", href: "/placement-hub", icon: Briefcase },
    { label: "Doubts", href: "/doubts", icon: MessageSquare },
    { label: "Tools", href: "/tools/sgpa-cgpa-calculator", icon: Calculator },
    { label: "Quizzes", href: "/quizzes", icon: HelpCircle },
    { label: "AI Copilot", href: "/ai-assistant", icon: Sparkles, badge: "AI" },
  ];

  const yearLinks = [
    { label: "1st Year (Foundation)", href: "/year/1", desc: "Physics, Chem, C, Maths & Mechanics" },
    { label: "2nd Year (Core)", href: "/year/2", desc: "DSA, OOP, OS, COA & Discrete Maths" },
    { label: "3rd Year (Advanced)", href: "/year/3", desc: "DBMS, Networks, DAA, TOC & Web Tech" },
    { label: "4th Year (GATE/Jobs)", href: "/year/4", desc: "AI, Cloud, System Design & Electives" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-desk-border bg-white/90 dark:bg-desk-canvas/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-violet to-accent-cyan flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all">
                <GraduationCap className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-cyan border-2 border-desk-canvas" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    BTECH<span className="text-primary-violet">BUDDY</span>
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[9px] px-1.5 py-0.2 text-accent-cyan bg-accent-cyan/10 rounded border border-accent-cyan/30">
                    DESK
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 -mt-0.5">
                  The Engineer&apos;s Study Desk
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {/* Year Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setYearsDropdownOpen(!yearsDropdownOpen)}
                  onBlur={() => setTimeout(() => setYearsDropdownOpen(false), 200)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-violet dark:hover:text-primary-violet rounded-lg hover:bg-slate-100 dark:hover:bg-desk-card transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-primary-violet" />
                  <span>Years</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {yearsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 desk-card rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      B.Tech Semesters 1 to 8
                    </div>
                    {yearLinks.map((y) => (
                      <Link
                        key={y.href}
                        href={y.href}
                        onClick={() => setYearsDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-desk-canvas transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{y.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{y.desc}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-primary-violet dark:text-primary-violet bg-primary-violet/10 font-bold border border-primary-violet/30"
                        : "text-slate-700 dark:text-slate-300 hover:text-primary-violet dark:hover:text-primary-violet hover:bg-slate-100 dark:hover:bg-desk-card"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-cyan"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Global Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-desk-card rounded-lg hover:bg-slate-200 dark:hover:bg-desk-border transition-colors border border-desk-border"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] rounded bg-white dark:bg-desk-canvas text-slate-400 font-mono border border-desk-border">
                  ⌘K
                </kbd>
              </button>

              <DataSaverToggle />
              <LanguageSelector />
              <ThemeToggle />

              {/* User Session / Auth Links */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-desk-card transition-colors border border-desk-border"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-violet to-accent-cyan text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {currentUser.name?.[0] || "U"}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 desk-card rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-desk-border">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {currentUser.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-primary-violet/10 text-primary-violet border border-primary-violet/30">
                          {currentUser.role === "SUPER_ADMIN" ? "SUPER ADMIN" : currentUser.role}
                        </div>
                      </div>

                      {/* Role Specific Navigation */}
                      {(currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN") && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg mt-1"
                        >
                          <Shield className="w-3.5 h-3.5" /> Admin Desk
                        </Link>
                      )}

                      <Link
                        href="/student/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-desk-canvas rounded-lg mt-1"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary-violet" /> Student Desk
                      </Link>

                      <Link
                        href="/student/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-desk-canvas rounded-lg"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" /> Profile & Stats
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors border-t border-desk-border mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-violet rounded-lg hover:bg-slate-100 dark:hover:bg-desk-card transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-primary-violet hover:bg-primary-violet/90 rounded-lg shadow-glow-sm transition-all hover:scale-[1.02]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-desk-card border border-desk-border"
                aria-label="Open Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-desk-border bg-white dark:bg-desk-canvas px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 px-1">
              B.Tech Academic Years
            </div>
            <div className="grid grid-cols-2 gap-2">
              {yearLinks.map((y) => (
                <Link
                  key={y.href}
                  href={y.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl desk-card hover:border-primary-violet transition-colors"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{y.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{y.desc}</div>
                </Link>
              ))}
            </div>

            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 px-1 pt-1">
              Study Hub & Tools
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl desk-card hover:border-primary-violet transition-colors text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <Icon className="w-4 h-4 text-primary-violet shrink-0" />
                    <span className="truncate">{link.label}</span>
                    {link.badge && (
                      <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 ml-auto">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {currentUser && (
              <div className="pt-2 border-t border-desk-border">
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary-violet text-white text-xs font-bold shadow-glow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" /> Open Student Desk
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
