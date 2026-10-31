import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Code,
  Cpu,
  Bot,
  BarChart3,
  Radio,
  Zap,
  Cog,
  Building2,
  BookOpen,
  ArrowRight,
  FileText,
  Compass,
} from "lucide-react";
import Breadcrumbs from "@/components/design-system/Breadcrumbs";

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          subjects: true,
          notes: true,
          courses: true,
        },
      },
    },
  });

  const icons: Record<string, any> = {
    CSE: Code,
    IT: Cpu,
    AIML: Bot,
    DS: BarChart3,
    ECE: Radio,
    EE: Zap,
    ME: Cog,
    CE: Building2,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumbs items={[{ label: "Academics", href: "/" }, { label: "Branches" }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="font-mono text-xs text-primary-violet font-bold uppercase tracking-widest">
          Academic Taxonomy
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Engineering Branches & Curricula
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Select your engineering discipline to access structured semester syllabi, subject notes, video lectures, and previous year question papers.
        </p>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => {
          const Icon = icons[b.code] || BookOpen;
          return (
            <Link
              key={b.id}
              href={`/branches/${b.id}`}
              className="p-6 rounded-2xl desk-card hover:border-primary-violet transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-violet/10 text-primary-violet flex items-center justify-center mb-4 group-hover:bg-primary-violet group-hover:text-white transition-colors border border-primary-violet/20">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-bold text-accent-cyan">
                  {b.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-primary-violet transition-colors">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {b.description || "Comprehensive syllabus, verified topper notes, and exam question banks."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-desk-border flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-3">
                  <span>{b._count.subjects} Subjects</span>
                  <span>•</span>
                  <span>{b._count.notes} Notes</span>
                </div>
                <span className="font-bold text-primary-violet flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
