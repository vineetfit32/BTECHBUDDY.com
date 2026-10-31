import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Bell, Check, Info } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch announcements & notifications
  const announcements = await prisma.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Notifications & Platform Notices
        </h1>
        <p className="text-xs text-slate-500">
          Official university updates, exam bank releases, and live class reminders
        </p>
      </div>

      <div className="space-y-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  item.priority === "HIGH"
                    ? "bg-rose-50 dark:bg-rose-950 text-rose-600"
                    : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
                }`}
              >
                {item.type} Notice
              </span>
              <span className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
