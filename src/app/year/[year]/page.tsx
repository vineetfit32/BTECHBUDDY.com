import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, FileText, Video, ArrowRight, Download, HelpCircle, Layers, Compass, CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const yearNumber = parseInt(year);

  if (![1, 2, 3, 4].includes(yearNumber)) {
    notFound();
  }

  const academicYear = await prisma.academicYear.findUnique({
    where: { yearNumber },
    include: {
      semesters: {
        include: {
          subjects: {
            include: {
              branch: true,
              _count: { select: { notes: true, videos: true, quizzes: true } },
            },
          },
        },
      },
    },
  });

  if (!academicYear) {
    notFound();
  }

  // Get notes for this year
  const notes = await prisma.note.findMany({
    where: {
      isPublished: true,
      academicYearId: academicYear.id,
    },
    include: {
      subject: true,
      branch: true,
    },
    take: 6,
  });

  const yearMetadata: Record<number, { title: string; subtitle: string; focus: string; tips: string[] }> = {
    1: {
      title: "B.Tech First Year",
      subtitle: "Common Engineering Sciences Foundation",
      focus: "Group A & Group B foundation courses common across all engineering branches.",
      tips: [
        "Focus heavily on Engineering Mathematics-I & II as calculus forms the bedrock of engineering.",
        "Master C Programming fundamentals and pointer concepts.",
        "Maintain high SGPA early—first-year marks provide the foundation for your overall CGPA.",
      ],
    },
    2: {
      title: "B.Tech Second Year",
      subtitle: "Core Branch Fundamentals & Algorithms",
      focus: "Transition into your departmental core subjects and practical coding/hardware skills.",
      tips: [
        "Data Structures & Algorithms (DSA) is your #1 priority for tech placements and semester exams.",
        "Master Operating Systems concepts (CPU Scheduling, Memory Management, Deadlocks).",
        "Start practicing coding problems on LeetCode/GeeksforGeeks alongside coursework.",
      ],
    },
    3: {
      title: "B.Tech Third Year",
      subtitle: "Advanced Systems, Networking & Internship Prep",
      focus: "DBMS, Computer Networks, Theory of Computation, and pre-final year internship interviews.",
      tips: [
        "Learn SQL queries and Normalization (1NF to BCNF) thoroughly for technical interviews.",
        "Build 2 full-stack capstone projects to showcase on your engineering resume.",
        "Prepare for on-campus internship drives starting in Semester 5 & 6.",
      ],
    },
    4: {
      title: "B.Tech Fourth Year",
      subtitle: "Industry Electives, Placements & Major Project",
      focus: "Cloud Computing, AI/ML, Cyber Security, GATE exam preparation, and final year projects.",
      tips: [
        "Prepare for high-frequency placement aptitude and system design rounds.",
        "Complete your final year capstone project with clear documentation.",
        "Revise GATE core subjects if aiming for PSUs or M.Tech in IITs/IISc.",
      ],
    },
  };

  const meta = yearMetadata[yearNumber];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs
        items={[
          { label: "Academics", href: "/" },
          { label: `Year ${yearNumber}` },
        ]}
      />

      {/* Blueprint Header Desk Card */}
      <div className="relative overflow-hidden rounded-3xl desk-card p-8 sm:p-12 text-white border-primary-violet/40 shadow-glow-sm">
        <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-bold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" /> YEAR_0{yearNumber} ROADMAP
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{meta.title}</h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{meta.focus}</p>
        </div>
      </div>

      {/* Preparation Strategy Box */}
      <div className="p-6 rounded-2xl desk-card border-primary-violet/30">
        <h3 className="font-mono text-xs font-bold text-primary-violet uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-violet" />
          Year {yearNumber} High-Scoring Exam Strategy
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {meta.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Semesters & Subjects */}
      <div className="space-y-10">
        {academicYear.semesters.map((sem) => (
          <div key={sem.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-desk-border pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {sem.title}
                </h2>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Core & elective courses for Semester {sem.semesterNumber}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-primary-violet bg-primary-violet/10 border border-primary-violet/30 px-3 py-1 rounded-full">
                {sem.subjects.length} Subjects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sem.subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-primary-violet px-2 py-0.5 rounded bg-primary-violet/10 border border-primary-violet/30">
                        {sub.code}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {sub.credits} Credits
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mt-2">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {sub.syllabus || "Complete syllabus breakdown, unit notes, and exam question papers."}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-primary-violet" /> {sub._count.notes} Notes
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-accent-cyan" /> {sub._count.videos} Lectures
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-accent-amber" /> {sub._count.quizzes} Quizzes
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-desk-border flex items-center justify-between">
                    <Link
                      href={`/subjects/${sub.id}`}
                      className="font-mono text-xs font-bold text-primary-violet hover:underline flex items-center gap-1"
                    >
                      View Hub <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/notes?subjectId=${sub.id}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold desk-card hover:border-primary-violet text-slate-700 dark:text-slate-300"
                    >
                      Notes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Featured Notes for this Year */}
      {notes.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-desk-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Popular Notes for {academicYear.title}
            </h2>
            <Link
              href={`/notes?year=${yearNumber}`}
              className="font-mono text-xs font-bold text-primary-violet hover:underline"
            >
              View All Year {yearNumber} Notes →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-2xl desk-card hover:border-primary-violet flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {note.fileType}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{note.fileSize}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-1">
                    {note.title}
                  </h3>
                  <p className="font-mono text-xs text-primary-violet mt-1">{note.subject.name}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-desk-border flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">{note.downloadCount} dl</span>
                  <Link
                    href={`/notes/${note.id}`}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-primary-violet text-white hover:bg-primary-violet/90"
                  >
                    View Note
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
