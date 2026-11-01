import { prisma } from "@/lib/prisma";
import { Tag, BookOpen, Layers } from "lucide-react";

export default async function AdminCategoriesPage() {
  // #region agent log
  fetch("http://127.0.0.1:7863/ingest/69005fa4-f6cf-43e1-ac04-a58eb906e019", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fe4cd9" }, body: JSON.stringify({ sessionId: "fe4cd9", runId: "pre-fix", hypothesisId: "D", location: "src/app/admin/categories/page.tsx:5", message: "admin categories prerender query start", data: {}, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
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
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Manage Categories & Syllabus Units
        </h1>
        <p className="text-xs text-ink-3">
          Curriculum units, module categorizations, and educational resource tags
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" /> Academic Branches
          </h3>
          <div className="space-y-2">
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 text-xs"
              >
                <span className="font-bold text-ink">{b.name}</span>
                <span className="text-ink-3">{b._count.subjects} Subjects</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-line shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Tag className="w-4 h-4 text-ok" /> Sample Syllabus Units
          </h3>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {units.map((u) => (
              <div
                key={u.id}
                className="p-2.5 rounded-xl bg-surface-2 text-xs space-y-0.5"
              >
                <div className="font-bold text-ink">{u.title}</div>
                <div className="text-[10px] text-ink-3">{u.subject.code}: {u.subject.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
