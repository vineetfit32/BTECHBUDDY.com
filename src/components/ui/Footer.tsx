"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Heart,
  Youtube,
  Linkedin,
  Twitter,
  Github,
  Compass,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer in timed exam room
  if (pathname?.includes("/quizzes/") && pathname?.endsWith("/attempt")) {
    return null;
  }

  const branches = [
    { code: "CSE", name: "Computer Science" },
    { code: "IT", name: "Information Tech" },
    { code: "AIML", name: "AI & Machine Learning" },
    { code: "DS", name: "Data Science" },
    { code: "ECE", name: "Electronics & Comm" },
    { code: "EE", name: "Electrical Eng" },
    { code: "ME", name: "Mechanical Eng" },
    { code: "CE", name: "Civil Eng" },
  ];

  return (
    <footer className="border-t border-desk-border bg-desk-canvas/90 relative overflow-hidden text-slate-400 text-xs transition-colors">
      <div className="absolute inset-0 bg-blueprint opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-violet to-accent-cyan flex items-center justify-center shadow-glow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white">
                  BTECH<span className="text-primary-violet">BUDDY</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-cyan">
                  THE ENGINEER&apos;S STUDY DESK
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The high-yield learning operating system for Indian B.Tech engineering students. Solved PYQs, verified topper handwritten notes, recorded masterclasses, live doubt sessions, and placement prep.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="#"
                aria-label="YouTube"
                className="p-2 rounded-lg desk-card hover:border-primary-violet text-slate-300 hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="p-2 rounded-lg desk-card hover:border-primary-violet text-slate-300 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="p-2 rounded-lg desk-card hover:border-primary-violet text-slate-300 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="p-2 rounded-lg desk-card hover:border-primary-violet text-slate-300 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Academic Years */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white mb-4 tracking-wider uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-primary-violet" /> B.Tech Years
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/year/1" className="hover:text-primary-violet transition-colors">
                  1st Year (Common Foundation)
                </Link>
              </li>
              <li>
                <Link href="/year/2" className="hover:text-primary-violet transition-colors">
                  2nd Year (Core Subjects)
                </Link>
              </li>
              <li>
                <Link href="/year/3" className="hover:text-primary-violet transition-colors">
                  3rd Year (Advanced Engineering)
                </Link>
              </li>
              <li>
                <Link href="/year/4" className="hover:text-primary-violet transition-colors">
                  4th Year (GATE & Placements)
                </Link>
              </li>
              <li>
                <Link href="/universities" className="hover:text-primary-violet transition-colors text-accent-cyan font-semibold">
                  University Mode (AKTU, VTU, etc.) →
                </Link>
              </li>
            </ul>
          </div>

          {/* Study Desk Hub */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white mb-4 tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-accent-cyan" /> Study Desk
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/pyq" className="hover:text-primary-violet transition-colors flex items-center gap-1.5">
                  <span>Solved PYQ Papers</span>
                  <span className="font-mono text-[9px] px-1 bg-primary-violet/20 text-primary-violet rounded border border-primary-violet/40">
                    AKTU/VTU
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-primary-violet transition-colors">
                  Handwritten Notes & PDFs
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-primary-violet transition-colors">
                  Video Masterclasses
                </Link>
              </li>
              <li>
                <Link href="/live-classes" className="hover:text-primary-violet transition-colors">
                  Live Doubt Clearing
                </Link>
              </li>
              <li>
                <Link href="/placement-hub" className="hover:text-primary-violet transition-colors">
                  Placement & GATE Hub
                </Link>
              </li>
              <li>
                <Link href="/tools/sgpa-cgpa-calculator" className="hover:text-primary-violet transition-colors">
                  SGPA / CGPA Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Engineering Branches Matrix */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white mb-4 tracking-wider uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent-amber" /> Branches
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {branches.map((b) => (
                <Link
                  key={b.code}
                  href="/branches"
                  className="px-2 py-1.5 rounded-lg desk-card hover:border-primary-violet transition-colors text-[11px] font-mono text-slate-300 hover:text-white"
                >
                  <span className="font-bold text-primary-violet">{b.code}</span>
                </Link>
              ))}
            </div>
            <div className="pt-3">
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-1.5 text-xs text-accent-cyan hover:underline font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask AI Study Assistant
              </Link>
            </div>
          </div>
        </div>

        {/* Circuit Divider */}
        <div className="circuit-line" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="font-mono">
            © {new Date().getFullYear()} BTECHBUDDY. Built for Indian Engineering Excellence.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
