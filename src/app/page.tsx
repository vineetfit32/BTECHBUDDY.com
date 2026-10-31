import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Video,
  Radio,
  HelpCircle,
  ArrowRight,
  Download,
  Star,
  Code,
  Cpu,
  Bot,
  BarChart3,
  Radio as RadioIcon,
  Zap,
  Cog,
  Building2,
  Sparkles,
  Compass,
  Layers,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import LiveCountdown from "@/components/live/LiveCountdown";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  // Fetch real data from database
  const [branches, featuredNotes, featuredVideos, upcomingLiveClass, announcements] =
    await Promise.all([
      prisma.branch.findMany({
        orderBy: { order: "asc" },
        take: 8,
        include: { _count: { select: { subjects: true, notes: true } } },
      }),
      prisma.note.findMany({
        where: { isPublished: true, isFeatured: true },
        include: {
          subject: { select: { name: true, code: true } },
          branch: { select: { name: true, code: true } },
        },
        take: 4,
        orderBy: { downloadCount: "desc" },
      }),
      prisma.videoLecture.findMany({
        where: { isPublished: true },
        include: { subject: { select: { name: true, code: true } } },
        take: 3,
        orderBy: { order: "asc" },
      }),
      prisma.liveClass.findFirst({
        where: { status: { in: ["SCHEDULED", "LIVE"] } },
        include: {
          instructor: { select: { name: true, college: true } },
          subject: { select: { name: true, code: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.announcement.findMany({
        where: { isPublished: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const branchIcons: Record<string, any> = {
    CSE: Code,
    IT: Cpu,
    AIML: Bot,
    DS: BarChart3,
    ECE: RadioIcon,
    EE: Zap,
    ME: Cog,
    CE: Building2,
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-20 relative">
      {/* Top Notification Ticker if announcement exists */}
      {announcements.length > 0 && (
        <div className="bg-desk-card border-b border-desk-border text-slate-200 py-2.5 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
          <span className="font-mono bg-primary-violet/20 text-primary-violet border border-primary-violet/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            NOTICE
          </span>
          <span className="truncate">{announcements[0].title}</span>
          <Link href="/notes" className="font-mono text-accent-cyan underline font-bold hover:text-accent-cyan/80 shrink-0">
            Learn More →
          </Link>
        </div>
      )}

      {/* 1. Hero Section: The Engineer's Study Desk */}
      <section className="relative overflow-hidden pt-8 lg:pt-16">
        {/* Subtle Blueprint grid overlay */}
        <div className="absolute inset-0 bg-blueprint opacity-60 pointer-events-none" />

        {/* Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-primary-violet/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full desk-card text-xs font-mono font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
              <span className="text-accent-cyan font-bold">EDTECH_OS</span>
              <span className="text-slate-500">•</span>
              <span>Dedicated B.Tech Engineering Learning Desk</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Your Engineering Journey,{" "}
              <span className="bg-gradient-to-r from-primary-violet via-indigo-500 to-accent-cyan bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              High-yield topper handwritten notes, solved previous year papers (PYQs), unit-wise video lectures, live doubt clearing classes, and online practice quizzes for all 4 years of B.Tech across India.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/notes"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary-violet hover:bg-primary-violet/90 shadow-glow-sm hover:shadow-glow transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Download Study Notes
              </Link>
              <Link
                href="/pyq"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 desk-card hover:border-primary-violet transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-accent-cyan" />
                Solved PYQ Bank
              </Link>
              <Link
                href="/quizzes"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 desk-card hover:border-primary-violet transition-all shadow-xs"
              >
                <HelpCircle className="w-4 h-4 text-accent-amber" />
                Practice Quizzes
              </Link>
            </div>

            {/* Desk Metric Chips */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto border-t border-desk-border mt-8">
              <div className="p-3 desk-card rounded-xl text-center">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">8+</div>
                <div className="font-mono text-[11px] text-slate-400 font-medium uppercase mt-0.5">B.Tech Branches</div>
              </div>
              <div className="p-3 desk-card rounded-xl text-center">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary-violet">4 Years</div>
                <div className="font-mono text-[11px] text-slate-400 font-medium uppercase mt-0.5">Sem Roadmaps</div>
              </div>
              <div className="p-3 desk-card rounded-xl text-center">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-accent-cyan">100% Free</div>
                <div className="font-mono text-[11px] text-slate-400 font-medium uppercase mt-0.5">Open Materials</div>
              </div>
              <div className="p-3 desk-card rounded-xl text-center">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-accent-amber">4.9 / 5.0</div>
                <div className="font-mono text-[11px] text-slate-400 font-medium uppercase mt-0.5">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upcoming Live Class Alert Bar */}
      {upcomingLiveClass && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl desk-card p-6 sm:p-8 text-white border-primary-violet/40 shadow-glow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-violet/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE CLASS
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    Subject: {upcomingLiveClass.subject.name} ({upcomingLiveClass.subject.code})
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{upcomingLiveClass.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-2">
                  {upcomingLiveClass.description}
                </p>
                <div className="text-xs text-slate-400 font-mono">
                  Instructor: <span className="text-slate-200">{upcomingLiveClass.instructor?.name || "Senior Faculty"}</span> • {upcomingLiveClass.durationMinutes} Mins
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                <LiveCountdown
                  scheduledAt={upcomingLiveClass.scheduledAt}
                  status={upcomingLiveClass.status}
                />
                <Link
                  href={`/live-classes/${upcomingLiveClass.id}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-violet hover:bg-primary-violet/90 text-white shadow-glow-sm transition-all hover:scale-105"
                >
                  Join Class →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Academic Year Grid (1st, 2nd, 3rd, 4th Year) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="font-mono text-xs text-primary-violet uppercase tracking-widest font-bold">
            Curriculum Structure
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Choose Your Academic Year
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Curated roadmaps, subject notes, previous question papers, and video lectures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              year: 1,
              title: "1st Year B.Tech",
              subtitle: "Common Engineering",
              sems: "Semesters 1 & 2",
              desc: "Engineering Physics, Chemistry, C Programming, Basic Electrical, Calculus.",
              code: "YEAR_01",
            },
            {
              year: 2,
              title: "2nd Year B.Tech",
              subtitle: "Core Department",
              sems: "Semesters 3 & 4",
              desc: "Data Structures & Algorithms, Java/C++ OOP, Operating Systems, COA.",
              code: "YEAR_02",
            },
            {
              year: 3,
              title: "3rd Year B.Tech",
              subtitle: "Advanced Systems",
              sems: "Semesters 5 & 6",
              desc: "DBMS, Computer Networks, Theory of Computation, Algorithm Design.",
              code: "YEAR_03",
            },
            {
              year: 4,
              title: "4th Year B.Tech",
              subtitle: "GATE & Placements",
              sems: "Semesters 7 & 8",
              desc: "Artificial Intelligence, Cloud DevOps, Cyber Security, Major Projects.",
              code: "YEAR_04",
            },
          ].map((item) => (
            <Link
              key={item.year}
              href={`/year/${item.year}`}
              className="group relative p-6 rounded-2xl desk-card hover:border-primary-violet transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-violet/10 text-primary-violet flex items-center justify-center font-mono font-black text-lg border border-primary-violet/30 group-hover:scale-105 transition-transform">
                    {item.year}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 border border-desk-border px-2 py-0.5 rounded">
                    [{item.code}]
                  </span>
                </div>

                <span className="font-mono text-[11px] font-bold text-accent-cyan uppercase tracking-wider">
                  {item.subtitle}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-primary-violet transition-colors">
                  {item.title}
                </h3>
                <p className="font-mono text-[11px] font-medium text-slate-400 mt-0.5">{item.sems}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-desk-border flex items-center justify-between text-xs font-mono font-bold text-primary-violet">
                <span>View Roadmaps</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Engineering Branches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-mono text-xs text-accent-cyan uppercase tracking-widest font-bold">
              Specialized Departments
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Engineering Branches
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organized curricula conforming to major Indian technical universities.
            </p>
          </div>
          <Link
            href="/branches"
            className="font-mono text-xs font-bold text-primary-violet hover:underline flex items-center gap-1"
          >
            All Branches <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {branches.map((b) => {
            const Icon = branchIcons[b.code] || BookOpen;
            return (
              <Link
                key={b.id}
                href={`/branches/${b.id}`}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-violet/10 text-primary-violet flex items-center justify-center mb-3 group-hover:bg-primary-violet group-hover:text-white transition-colors border border-primary-violet/20">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-mono text-xs font-bold text-accent-cyan">
                  {b.code}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-violet transition-colors mt-0.5">
                  {b.name}
                </h3>
                <div className="font-mono text-[11px] text-slate-400 mt-2">
                  {b._count.subjects} Subjects • {b._count.notes} Notes
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Notes & PYQs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-mono text-xs text-accent-amber uppercase tracking-widest font-bold">
              High-Yield Resources
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Topper Handwritten Notes & PYQs
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Chapter-wise verified notes and solved previous year examination papers.
            </p>
          </div>
          <Link
            href="/notes"
            className="font-mono text-xs font-bold text-primary-violet hover:underline flex items-center gap-1"
          >
            Explore All Notes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {note.fileType}
                  </span>
                  {note.isPYQ ? (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
                      PYQ Solved
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary-violet/10 text-primary-violet border border-primary-violet/30">
                      Topper Note
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {note.title}
                </h3>
                <p className="font-mono text-xs text-primary-violet font-semibold mt-1">
                  {note.subject.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {note.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-desk-border flex items-center justify-between">
                <div className="font-mono text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{note.fileSize}</span>
                  <span>•</span>
                  <span>{note.downloadCount} dl</span>
                </div>
                <Link
                  href={`/notes/${note.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-primary-violet hover:bg-primary-violet/90 text-white transition-colors"
                >
                  Preview PDF
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Video Lecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="font-mono text-xs text-primary-violet uppercase tracking-widest font-bold">
              Visual Learning
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Curated Video Lectures
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Engineering concepts explained clearly with step-by-step problem walkthroughs.
            </p>
          </div>
          <Link
            href="/videos"
            className="font-mono text-xs font-bold text-primary-violet hover:underline flex items-center gap-1"
          >
            All Lectures <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className="group rounded-2xl desk-card overflow-hidden hover:border-primary-violet transition-all"
            >
              <div className="relative aspect-video bg-desk-card overflow-hidden">
                <img
                  src={video.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary-violet/90 text-white flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-desk-canvas/90 text-white border border-desk-border">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <div className="font-mono text-xs font-semibold text-primary-violet">
                  {video.subject.name}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-2 group-hover:text-primary-violet transition-colors">
                  {video.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Student Reviews & EdTech Pride */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="font-mono text-xs text-accent-cyan uppercase tracking-widest font-bold">
            Verified Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Trusted by Engineering Students
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real feedback from students who aced semester exams and placement interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Siddharth Maurya",
              college: "AKTU Lucknow (CSE 3rd Year)",
              text: "BTECHBUDDY notes saved my semester exams! The handwritten DSA and Operating System notes have step-by-step diagrams and exact exam questions. Scored 8.9 SGPA!",
              rating: 5,
            },
            {
              name: "Ananya Iyer",
              college: "VTU Belagavi (ECE 2nd Year)",
              text: "The timed practice quizzes helped me pinpoint my weak areas in Digital Electronics. The explanations after each attempt are crystal clear.",
              rating: 5,
            },
            {
              name: "Karan Patel",
              college: "RTU Kota (IT 4th Year)",
              text: "The live doubt sessions and DBMS normalization cheat sheets made all the difference during placements. Cracked my first product engineering offer!",
              rating: 5,
            },
          ].map((review, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl desk-card space-y-3"
            >
              <div className="flex items-center gap-1 text-accent-amber">
                {[...Array(review.rating)].map((_, r) => (
                  <Star key={r} className="w-4 h-4 fill-accent-amber" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="pt-2 border-t border-desk-border">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{review.name}</div>
                <div className="font-mono text-[11px] text-slate-400">{review.college}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl desk-card p-8 sm:p-12 text-center space-y-6 shadow-glow-sm relative overflow-hidden border-primary-violet/40">
          <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-accent-cyan px-2.5 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/30">
              <Terminal className="w-3.5 h-3.5" /> START STUDYING NOW
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to Ace Your B.Tech Journey?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal">
              Join thousands of B.Tech students across India. Access verified topper notes, PYQs, and video masterclasses today.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-primary-violet hover:bg-primary-violet/90 text-white transition-all shadow-glow-sm hover:scale-105"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold desk-card text-white hover:border-primary-violet transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
