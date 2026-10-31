import { prisma } from "@/lib/prisma";
import { Tag, BookOpen, Layers } from "lucide-react";

export default async function AdminCategoriesPage() {
  const [branches, subjects, units] = await Promise.all([
    prisma.branch.findMany({ include: { _count: { select: { subjects: true } } } }),
    prisma.subject.findMany({ select: { id: true, name: true, code: true } }),
    prisma.syllabusUnit.findMany({
      include: { subject: { select: { name: true, code: true } } },
      take: 15,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Manage Categories & Syllabus Units
        </h1>
        <p className="text-xs text-slate-500">
          Curriculum units, module categorizations, and educational resource tags
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Academic Branches
          </h3>
          <div className="space-y-2">
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">{b.name}</span>
                <span className="text-slate-400">{b._count.subjects} Subjects</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-500" /> Sample Syllabus Units
          </h3>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {units.map((u) => (
              <div
                key={u.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-0.5"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">{u.title}</div>
                <div className="text-[10px] text-slate-400">{u.subject.code}: {u.subject.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
