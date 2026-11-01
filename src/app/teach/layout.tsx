import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeachLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "INSTRUCTOR") {
    redirect(user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin/live-classes" : "/student/dashboard");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Tutor desk</p>
          <h1 className="text-2xl font-black text-ink">{user.name}</h1>
        </div>
        <Link href="/" className="text-xs font-bold text-ink-3 hover:text-ink">
          Home
        </Link>
      </div>
      {children}
    </div>
  );
}
