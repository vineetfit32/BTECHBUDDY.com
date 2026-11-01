import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { User, Mail, Building, Layers, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          Profile & Settings
        </h1>
        <p className="text-xs text-ink-3">
          Manage your student identity, branch, semester, and security preferences
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-line shadow-md space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-brand to-accent text-white flex items-center justify-center font-black text-2xl uppercase shadow-lg">
            {user.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">{user.name}</h2>
            <p className="text-xs text-ink-3">{user.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-soft text-brand">
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-line text-xs">
          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-ink-3 font-medium">Engineering Branch</span>
            <div className="text-sm font-bold text-ink mt-1">
              {user.branch || "Computer Science & Engineering (CSE)"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-ink-3 font-medium">Current Semester</span>
            <div className="text-sm font-bold text-ink mt-1">
              Semester {user.semester || 3}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-ink-3 font-medium">College / University</span>
            <div className="text-sm font-bold text-ink mt-1">
              {user.college || "BTechBuddy Affiliated Institute"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-line">
            <span className="text-ink-3 font-medium">Security Status</span>
            <div className="text-sm font-bold text-ok mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Active & Verified Session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
