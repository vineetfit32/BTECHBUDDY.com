"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Cpu, Heart, Layers, Sparkles } from "lucide-react";
import { BrandMark, Wordmark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/kit";
import { GithubIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/icons/brand";

const BRANCHES = ["CSE", "IT", "AIML", "DS", "ECE", "EE", "ME", "CE"];

const YEARS = [
  { href: "/year/1", label: "1st Year · Foundation" },
  { href: "/year/2", label: "2nd Year · Core" },
  { href: "/year/3", label: "3rd Year · Advanced" },
  { href: "/year/4", label: "4th Year · GATE & Jobs" },
];

const DESK = [
  { href: "/pyq", label: "Solved PYQ papers" },
  { href: "/notes", label: "Handwritten notes" },
  { href: "/videos", label: "Video lectures" },
  { href: "/live-classes", label: "Live doubt classes" },
  { href: "/placement-hub", label: "Placement & GATE" },
  { href: "/tools/sgpa-cgpa-calculator", label: "SGPA / CGPA calculator" },
];

const SOCIAL = [
  { label: "YouTube", Icon: YoutubeIcon },
  { label: "LinkedIn", Icon: LinkedinIcon },
  { label: "X", Icon: XIcon },
  { label: "GitHub", Icon: GithubIcon },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.includes("/quizzes/") && pathname?.endsWith("/attempt")) return null;

  return (
    <footer data-chrome className="relative z-10 mt-24 overflow-hidden border-t border-line bg-canvas text-xs text-ink-3">
      <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="brutal relative -mt-px flex flex-col items-start gap-5 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:mt-10">
          <div className="flex items-center gap-4">
            <BrandMark className="size-16 shrink-0 motion-safe:animate-float" />
            <div>
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Exam in 14 days? Buddy has a plan.</h2>
              <p className="mt-1 text-sm text-ink-2">Pomodoro focus, spaced-repetition PYQ flashcards and a daily plan, free forever.</p>
            </div>
          </div>
          <ButtonLink href="/student/board" size="lg" iconRight={<ArrowRight />}>
            Open Study Board
          </ButtonLink>
        </div>

        <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark className="size-9" />
              <div className="flex flex-col leading-none">
                <Wordmark />
                <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">The Engineer&apos;s Study Board</span>
              </div>
            </Link>
            <p className="max-w-sm leading-relaxed text-ink-3">
              An independent, self-hosted learning platform for Indian B.Tech students. Solved PYQs, topper notes, lectures, live
              classes and a private AI buddy, all running on our own servers.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="rounded-lg border border-line bg-surface p-2 text-ink-2 transition-colors hover:border-brand hover:text-ink"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="B.Tech years" icon={<Compass className="size-3.5 text-brand" />}>
            {YEARS.map((y) => (
              <FooterLink key={y.href} href={y.href}>
                {y.label}
              </FooterLink>
            ))}
            <FooterLink href="/universities" className="font-semibold text-accent">
              University mode →
            </FooterLink>
          </FooterColumn>

          <FooterColumn title="Study desk" icon={<Layers className="size-3.5 text-accent" />}>
            {DESK.map((d) => (
              <FooterLink key={d.href} href={d.href}>
                {d.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Branches" icon={<Cpu className="size-3.5 text-warn" />}>
            <div className="grid grid-cols-4 gap-1.5">
              {BRANCHES.map((code) => (
                <Link
                  key={code}
                  href="/branches"
                  className="rounded-lg border border-line bg-surface px-1.5 py-1.5 text-center font-mono text-[11px] font-bold text-brand transition-colors hover:border-brand"
                >
                  {code}
                </Link>
              ))}
            </div>
            <Link href="/ai-assistant" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-accent hover:underline">
              <Sparkles className="size-3.5" /> Ask AI Buddy
            </Link>
          </FooterColumn>
        </div>

        <div className="circuit-line" />

        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="font-mono">© {new Date().getFullYear()} BTECHBUDDY · Self-hosted in India</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <span className="flex items-center gap-1">
              Built with <Heart className="size-3 fill-danger text-danger" /> for students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        {icon} {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`transition-colors hover:text-brand ${className ?? ""}`}>
      {children}
    </Link>
  );
}
