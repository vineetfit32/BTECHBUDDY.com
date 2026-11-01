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
      <div className="border-b border-line pb-3">
        <h1 className="text-2xl font-black text-ink">
          My Bookmarks & Saved Items
        </h1>
        <p className="text-xs text-ink-3">
          Saved notes, video lectures, and revision formulas for rapid access
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface border border-line space-y-3">
          <Bookmark className="w-10 h-10 text-ink-3 mx-auto" />
          <h3 className="text-sm font-bold text-ink">No Bookmarks Saved</h3>
          <p className="text-xs text-ink-3 max-w-sm mx-auto">
            You can bookmark any note, video lecture, or practice quiz to quickly access it from here.
          </p>
          <Link
            href="/notes"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white"
          >
            Explore Study Notes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="p-5 rounded-2xl bg-surface border border-line shadow-2xs flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                  {bm.itemType}
                </span>
                <h4 className="text-sm font-bold text-ink mt-0.5">
                  Saved Resource #{bm.itemId.slice(0, 8)}
                </h4>
              </div>
              <Link
                href={bm.itemType === "NOTE" ? `/notes/${bm.itemId}` : `/videos/${bm.itemId}`}
                className="text-xs font-bold text-brand hover:underline"
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
