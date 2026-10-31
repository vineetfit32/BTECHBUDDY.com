import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Bookmark, FileText, Video, BookOpen, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentBookmarksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          My Bookmarks & Saved Items
        </h1>
        <p className="text-xs text-slate-500">
          Saved notes, video lectures, and revision formulas for rapid access
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Bookmarks Saved</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You can bookmark any note, video lecture, or practice quiz to quickly access it from here.
          </p>
          <Link
            href="/notes"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
          >
            Explore Study Notes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {bm.itemType}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Saved Resource #{bm.itemId.slice(0, 8)}
                </h4>
              </div>
              <Link
                href={bm.itemType === "NOTE" ? `/notes/${bm.itemId}` : `/videos/${bm.itemId}`}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Open →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
