import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, FileText, Video, ArrowRight, HelpCircle, Compass } from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;

  const branch = await prisma.branch.findFirst({
    where: {
      OR: [{ id: branchId }, { slug: branchId }, { code: branchId.toUpperCase() }],
    },
    include: {
      subjects: {
        include: {
          semester: true,
          _count: { select: { notes: true, videos: true, quizzes: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!branch) {
    notFound();
  }

  // Group subjects by semester
  const subjectsBySemester: Record<number, any[]> = {};
  for (const sub of branch.subjects) {
    const semNum = sub.semester.semesterNumber;
    if (!subjectsBySemester[semNum]) subjectsBySemester[semNum] = [];
    subjectsBySemester[semNum].push(sub);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs
        items={[
          { label: "Academics", href: "/" },
          { label: "Branches", href: "/branches" },
          { label: branch.code },
        ]}
      />

      {/* Branch Header Desk Card */}
      <div className="relative overflow-hidden rounded-3xl desk-card p-8 sm:p-12 text-white border-primary-violet/40 shadow-glow-sm">
        <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30">
            {branch.code} DEPARTMENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{branch.name}</h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {branch.description || "Complete 4-year engineering curriculum, semester roadmaps, topper handwritten notes, and video lectures."}
          </p>
        </div>
      </div>

      {/* Semesters & Subjects */}
      <div className="space-y-10">
        <div className="space-y-1">
          <div className="font-mono text-xs text-primary-violet uppercase tracking-widest font-bold">
            Curriculum Structure
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Semester-Wise Subjects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click on any subject to access unit notes, question papers, video lectures, and practice quizzes.
          </p>
        </div>

        {Object.keys(subjectsBySemester).length === 0 ? (
          <div className="p-8 text-center rounded-2xl desk-card text-slate-400 font-mono text-sm">
            Subjects for this branch are currently being curated by the academic team. Check back shortly!
          </div>
        ) : (
          Object.entries(subjectsBySemester)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([semNum, subs]) => (
              <div key={semNum} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-desk-border pb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Semester {semNum}
                  </h3>
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-violet/10 border border-primary-violet/30 text-primary-violet">
                    {subs.length} Subjects
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl desk-card hover:border-primary-violet transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-primary-violet px-2 py-0.5 rounded bg-primary-violet/10 border border-primary-violet/30">
                            {sub.code}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">{sub.credits} Credits</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                          {sub.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {sub.syllabus || "Comprehensive unit notes, previous papers, and video tutorials."}
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
                          Subject Desk <ArrowRight className="w-3.5 h-3.5" />
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
            ))
        )}
      </div>
    </div>
  );
}
