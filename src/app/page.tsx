import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  Building2,
  Code,
  Cog,
  Cpu,
  FileText,
  Layers,
  MoonStar,
  NotebookPen,
  PlayCircle,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/hero/Hero";
import LiveCountdown from "@/components/live/LiveCountdown";
import Buddy from "@/components/mascot/Buddy";
import { Badge, ButtonLink, Eyebrow } from "@/components/kit";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CountUp, Magnetic, Marquee, TiltCard } from "@/components/motion/Interactive";
import ScrollProgress from "@/components/motion/ScrollProgress";

export const revalidate = 60;

const BRANCH_ICONS: Record<string, LucideIcon> = {
  CSE: Code,
  IT: Cpu,
  AIML: Bot,
  DS: BarChart3,
  ECE: Radio,
  EE: Zap,
  ME: Cog,
  CE: Building2,
};

const UNIVERSITIES = ["AKTU", "VTU", "RTU", "SPPU", "GTU", "MAKAUT", "JNTU", "Anna Univ", "IPU", "DTU", "BPUT", "RGPV"];

const YEARS = [
  { year: 1, title: "Common Engineering", sems: "Sem 1 & 2", desc: "Physics, Chemistry, C Programming, Basic Electrical, Calculus." },
  { year: 2, title: "Core Department", sems: "Sem 3 & 4", desc: "DSA, OOP in Java/C++, Operating Systems, COA, Discrete Maths." },
  { year: 3, title: "Advanced Systems", sems: "Sem 5 & 6", desc: "DBMS, Computer Networks, Theory of Computation, DAA." },
  { year: 4, title: "GATE & Placements", sems: "Sem 7 & 8", desc: "AI, Cloud & DevOps, Cyber Security, electives, major project." },
];

const REVIEWS = [
  { name: "Siddharth Maurya", college: "AKTU Lucknow · CSE 3rd year", text: "The handwritten DSA and OS notes have exact exam questions. The flashcards made revision stick. Scored 8.9 SGPA!" },
  { name: "Ananya Iyer", college: "VTU Belagavi · ECE 2nd year", text: "Timed quizzes found my weak spots in Digital Electronics, and Buddy turned every wrong answer into a flashcard." },
  { name: "Karan Patel", college: "RTU Kota · IT 4th year", text: "Night Study mode for late prep, live doubt rooms with a whiteboard, and DBMS cheat sheets. Cracked my first offer!" },
];

async function loadHome() {
  try {
    const [branches, featuredNotes, featuredVideos, upcomingLiveClass, announcement, paperCount, questionCount] = await Promise.all([
      prisma.branch.findMany({ orderBy: { order: "asc" }, take: 8, include: { _count: { select: { subjects: true, notes: true } } } }),
      prisma.note.findMany({
        where: { isPublished: true, isFeatured: true },
        include: { subject: { select: { name: true, code: true } } },
        take: 4,
        orderBy: { downloadCount: "desc" },
      }),
      prisma.videoLecture.findMany({ where: { isPublished: true }, include: { subject: { select: { name: true, code: true } } }, take: 3, orderBy: { order: "asc" } }),
      prisma.liveClass.findFirst({
        where: { status: { in: ["SCHEDULED", "LIVE"] } },
        include: { instructor: { select: { name: true } }, subject: { select: { name: true, code: true } } },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.announcement.findFirst({ where: { isPublished: true }, orderBy: { createdAt: "desc" } }),
      prisma.examPaper.count(),
      prisma.questionBank.count(),
    ]);
    return { branches, featuredNotes, featuredVideos, upcomingLiveClass, announcement, paperCount, questionCount };
  } catch (error) {
    console.error("Home page data unavailable:", error);
    return { branches: [], featuredNotes: [], featuredVideos: [], upcomingLiveClass: null, announcement: null, paperCount: 0, questionCount: 0 };
  }
}

export default async function HomePage() {
  const { branches, featuredNotes, featuredVideos, upcomingLiveClass, announcement, paperCount, questionCount } = await loadHome();

  return (
    <div className="relative pb-10">
      <ScrollProgress />

      {announcement && (
        <div className="relative z-20 border-b border-line bg-surface/80 px-4 py-2 text-center text-xs font-medium text-ink-2">
          <Badge tone="brand" className="mr-2">Notice</Badge>
          <span>{announcement.title}</span>
          <Link href="/notes" className="ml-2 font-bold text-accent hover:underline">
            Learn more →
          </Link>
        </div>
      )}

      <Hero>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2" data-hero-fade>
            <span className="sticker bg-warn text-canvas">Self-hosted · Free forever</span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-2">
              <ShieldCheck className="size-3.5 text-ok" /> No third-party trackers
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] font-bold leading-[1.02] text-ink">
            <span data-split>Your engineering journey,</span>{" "}
            <span data-split-word className="text-gradient-brand inline-block pb-1">
              simplified.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg" data-hero-fade>
            Topper notes, solved PYQs, lectures and live doubt rooms for all four years of B.Tech, plus Buddy, a private AI study
            partner who plans your days, quizzes you with spaced repetition and cheers every streak.
          </p>

          <div className="flex flex-wrap items-center gap-3" data-hero-fade>
            <Magnetic>
              <ButtonLink href="/student/board" size="lg" iconRight={<ArrowRight />}>
                Open Study Board
              </ButtonLink>
            </Magnetic>
            <ButtonLink href="/pyq" variant="secondary" size="lg" icon={<FileText className="text-accent" />}>
              Solved PYQ bank
            </ButtonLink>
          </div>

          <dl className="grid max-w-xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4" data-hero-fade>
            {[
              { label: "Branches", value: Math.max(branches.length, 8), suffix: "" },
              { label: "PYQ papers", value: paperCount, suffix: "+" },
              { label: "Questions", value: questionCount, suffix: "+" },
              { label: "Free", value: 100, suffix: "%" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-3 py-2.5">
                <dd className="font-display text-2xl font-bold text-ink">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dd>
                <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Hero>

      <section aria-label="Universities covered" className="relative z-10 border-y border-line bg-surface/60 py-5">
        <Marquee>
          {UNIVERSITIES.map((u, i) => (
            <span
              key={u}
              className="sticker whitespace-nowrap bg-surface px-3 py-1 text-xs text-ink"
              style={{ transform: `rotate(${i % 2 ? 2 : -2}deg)`, boxShadow: `2px 2px 0 0 var(--${["brand", "accent", "warn", "ok"][i % 4]})` }}
            >
              {u}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <Eyebrow className="text-brand">Everything for exam season</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-5xl">One desk. Every tool you need.</h2>
          <p className="mt-3 text-ink-3">Built and hosted by us: the AI, the video, the live rooms and the search all run on our own servers.</p>
        </Reveal>

        <Stagger className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-6">
          <StaggerItem className="bento group p-6 md:col-span-4 md:row-span-2">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <Badge tone="brand">Study Board</Badge>
                <h3 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">Plan, focus and revise in one dark-mode board.</h3>
                <p className="mt-2 max-w-md text-sm text-ink-3">Pomodoro focus with Buddy&apos;s headphones on, today&apos;s plan from your exam countdown, and a GitHub-style study heatmap.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="clay flex flex-col items-center justify-center p-4">
                  <Timer className="size-6 text-brand" />
                  <span className="mt-2 font-mono text-2xl font-black text-ink">25:00</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Focus</span>
                </div>
                <div className="col-span-2 rounded-2xl border border-line bg-surface-2 p-4">
                  <div className="grid grid-cols-[repeat(14,1fr)] gap-1">
                    {Array.from({ length: 56 }, (_, i) => (
                      <span
                        key={i}
                        className="aspect-square rounded-[3px]"
                        style={{ background: `color-mix(in oklab, var(--ok) ${[8, 30, 55, 85, 15, 0, 65][(i * 7 + i) % 7]}%, var(--surface-3))` }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">12-day streak · 34 focus hours</p>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem className="bento p-6 md:col-span-2 md:row-span-2">
            <div className="flex h-full flex-col">
              <Badge tone="accent">AI Buddy</Badge>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">Answers from your syllabus, not the internet.</h3>
              <div className="glass mt-4 rounded-2xl rounded-bl-md p-3 text-xs text-ink-2">Explain the 4 Coffman conditions with a PYQ.</div>
              <div className="mt-auto flex items-end justify-between pt-4">
                <p className="max-w-[60%] text-xs text-ink-3">Runs on our own GPU with retrieval over BTECHBUDDY notes and PYQs.</p>
                <Buddy mood="thinking" className="h-28 w-28" />
              </div>
            </div>
          </StaggerItem>

          {[
            { color: "text-warn", icon: Layers, title: "Spaced-repetition flashcards", body: "FSRS schedules every PYQ so you revise right before you'd forget.", href: "/student/flashcards" },
            { color: "text-ok", icon: Radio, title: "Live rooms + whiteboard", body: "Self-hosted video classes with a shared whiteboard and recordings.", href: "/live-classes" },
            { color: "text-danger", icon: NotebookPen, title: "Notes reader", body: "Dark reading mode, highlights, page memory and offline saving.", href: "/notes" },
          ].map(({ color, icon: Icon, title, body, href }) => (
            <StaggerItem key={title} className="md:col-span-2">
              <Link href={href} className="bento group flex h-full flex-col p-6">
                <span className={`clay flex size-12 items-center justify-center !rounded-2xl ${color}`}>
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink-3">{body}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-brand">
                  Explore <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {upcomingLiveClass && (
        <section className="relative z-10 mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="brutal relative overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="sticker bg-danger text-canvas">
                    <span className="size-1.5 animate-pulse rounded-full bg-canvas" /> Live class
                  </span>
                  <span className="font-mono text-xs text-ink-3">
                    {upcomingLiveClass.subject.name} ({upcomingLiveClass.subject.code})
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">{upcomingLiveClass.title}</h3>
                {upcomingLiveClass.description && <p className="line-clamp-2 max-w-2xl text-sm text-ink-2">{upcomingLiveClass.description}</p>}
                <p className="font-mono text-xs text-ink-3">
                  With <span className="text-ink">{upcomingLiveClass.instructor?.name ?? "Senior faculty"}</span> · {upcomingLiveClass.durationMinutes} min
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                <LiveCountdown scheduledAt={upcomingLiveClass.scheduledAt} status={upcomingLiveClass.status} />
                <ButtonLink href={`/live-classes/${upcomingLiveClass.id}`} iconRight={<ArrowRight />}>
                  Join class
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow className="text-accent">Curriculum</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Pick your year</h2>
          </div>
          <p className="max-w-md text-sm text-ink-3">Roadmaps, subject notes, PYQs and lectures mapped to your semester.</p>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {YEARS.map((y, i) => (
            <StaggerItem key={y.year}>
              <TiltCard className="h-full rounded-2xl">
                <Link href={`/year/${y.year}`} className="brutal brutal-interactive group flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className="clay flex size-14 items-center justify-center font-display text-2xl font-black text-ink"
                      style={{ boxShadow: undefined, color: `var(--${["brand", "accent", "warn", "ok"][i]})` }}
                    >
                      {y.year}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-ink-3">{y.sems}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{y.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">{y.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-bold text-brand">
                    View roadmap <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {branches.length > 0 && (
        <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow className="text-warn">Departments</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Engineering branches</h2>
            </div>
            <Link href="/branches" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
              All branches <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4" stagger={0.05}>
            {branches.map((b) => {
              const Icon = BRANCH_ICONS[b.code] ?? BrainCircuit;
              return (
                <StaggerItem key={b.id} variant="pop">
                  <Link href={`/branches/${b.id}`} className="bento group flex h-full flex-col p-5">
                    <span className="clay flex size-12 items-center justify-center !rounded-2xl text-brand transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="size-5" />
                    </span>
                    <span className="mt-4 font-mono text-xs font-bold text-accent">{b.code}</span>
                    <h3 className="text-sm font-bold text-ink">{b.name}</h3>
                    <span className="mt-2 font-mono text-[11px] text-ink-3">
                      {b._count.subjects} subjects · {b._count.notes} notes
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>
      )}

      {featuredNotes.length > 0 && (
        <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow className="text-danger">High-yield</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Topper notes & solved PYQs</h2>
            </div>
            <Link href="/notes" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
              Explore all notes <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredNotes.map((note) => (
              <StaggerItem key={note.id}>
                <Link href={`/notes/${note.id}`} className="bento group flex h-full flex-col p-5">
                  <div className="flex items-center justify-between">
                    <Badge tone="danger">{note.fileType}</Badge>
                    <Badge tone={note.isPYQ ? "warn" : "brand"}>{note.isPYQ ? "PYQ solved" : "Topper note"}</Badge>
                  </div>
                  <h3 className="mt-4 line-clamp-2 font-display text-base font-bold text-ink group-hover:text-brand">{note.title}</h3>
                  <p className="mt-1 font-mono text-xs font-semibold text-brand">{note.subject.name}</p>
                  {note.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-3">{note.description}</p>}
                  <div className="mt-auto flex items-center justify-between border-t border-line pt-4 font-mono text-[11px] text-ink-3">
                    <span>
                      {note.fileSize} · {note.downloadCount} downloads
                    </span>
                    <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {featuredVideos.length > 0 && (
        <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow className="text-brand">Lectures</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Watch, even on 2G</h2>
              <p className="mt-2 max-w-lg text-sm text-ink-3">Adaptive streaming from our own servers, with a 240p data-saver track.</p>
            </div>
            <Link href="/videos" className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
              All lectures <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredVideos.map((video) => (
              <StaggerItem key={video.id}>
                <Link href={`/videos/${video.id}`} className="bento group block overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-surface-2">
                    <img
                      src={video.thumbnail || "/placeholders/lecture.svg"}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-canvas/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle className="size-14 text-on-brand drop-shadow-lg" />
                    </div>
                    <span className="absolute bottom-2 right-2 rounded-md bg-canvas/85 px-2 py-0.5 font-mono text-[10px] font-bold text-ink">{video.duration}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-xs font-semibold text-brand">{video.subject.name}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-ink group-hover:text-brand">{video.title}</h3>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <Eyebrow className="text-warn">Made for 2 AM revision</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Four themes. Zero eye strain.</h2>
            <p className="mt-3 max-w-lg text-ink-3">
              Study Board is a calm ink-navy chalkboard. Night Study removes blue light after 10 PM automatically. Paper is for bright
              daylight and High Contrast is for maximum legibility. Change it any time from the palette menu.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="brand" variant="sticker">
                <MoonStar className="size-3" /> Auto night mode
              </Badge>
              <Badge tone="accent" variant="sticker">
                Focus mode
              </Badge>
              <Badge tone="ok" variant="sticker">
                Data saver
              </Badge>
            </div>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4" stagger={0.1}>
            {[
              { name: "Study Board", theme: "study" },
              { name: "Night Study", theme: "night" },
              { name: "Paper", theme: "light" },
              { name: "High Contrast", theme: "contrast" },
            ].map((t) => (
              <StaggerItem key={t.theme}>
                <div data-theme={t.theme} className={`${t.theme === "light" ? "" : "dark"} brutal overflow-hidden bg-canvas p-4 text-ink`}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-danger" />
                    <span className="size-2.5 rounded-full bg-warn" />
                    <span className="size-2.5 rounded-full bg-ok" />
                  </div>
                  <div className="rounded-xl border border-line bg-surface p-3">
                    <div className="h-2 w-2/3 rounded-full bg-ink/80" />
                    <div className="mt-2 h-2 w-full rounded-full bg-ink-3/50" />
                    <div className="mt-1.5 h-2 w-4/5 rounded-full bg-ink-3/50" />
                    <div className="mt-3 inline-flex rounded-lg bg-brand px-2 py-1 text-[10px] font-black text-on-brand">Start</div>
                  </div>
                  <p className="mt-3 font-display text-sm font-bold">{t.name}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <Eyebrow className="text-accent">Students say</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Trusted across India</h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <StaggerItem key={review.name}>
              <figure className="brutal h-full p-6" style={{ transform: `rotate(${[-1, 0.6, -0.4][i]}deg)` }}>
                <div className="flex gap-1 text-warn">
                  {Array.from({ length: 5 }, (_, r) => (
                    <Star key={r} className="size-4 fill-warn" />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-ink-2">&ldquo;{review.text}&rdquo;</blockquote>
                <figcaption className="mt-4 border-t border-line pt-3">
                  <div className="text-sm font-bold text-ink">{review.name}</div>
                  <div className="font-mono text-[11px] text-ink-3">{review.college}</div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="relative z-10 mx-auto mt-24 max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="brutal relative overflow-hidden p-8 text-center sm:p-12">
          <div className="aurora opacity-30" />
          <div className="relative">
            <Buddy mood="celebrate" className="mx-auto h-32 w-32" />
            <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-5xl">Ready to ace this semester?</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-2">Create a free account and Buddy will build your first 14-day exam plan in under a minute.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Magnetic>
                <ButtonLink href="/register" size="lg" icon={<Sparkles />}>
                  Create free account
                </ButtonLink>
              </Magnetic>
              <ButtonLink href="/login" variant="secondary" size="lg">
                I have an account
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
