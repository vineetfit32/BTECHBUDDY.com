"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, BookOpen, Video, FileText, HelpCircle, Loader2 } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setNotes([]);
      setVideos([]);
      setSubjects([]);
      setQuizzes([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [notesRes, videosRes, subjectsRes, quizzesRes] = await Promise.all([
          fetch(`/api/notes?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch(`/api/videos?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch(`/api/subjects?search=${encodeURIComponent(query)}`).then((r) => r.json()),
          fetch(`/api/quizzes`).then((r) => r.json()),
        ]);

        setNotes((notesRes.notes || []).slice(0, 4));
        setVideos((videosRes.videos || []).slice(0, 4));
        setSubjects((subjectsRes.subjects || []).slice(0, 4));
        setQuizzes(
          (quizzesRes.quizzes || [])
            .filter((q: any) => q.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
        );
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C2541] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-slate-200 dark:border-slate-700/80">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search subjects, notes, videos, quizzes (e.g. DSA, DBMS, Maths)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">Quick Engineering Search</p>
              <p>Type keywords like &quot;Data Structures&quot;, &quot;Operating Systems&quot;, or &quot;Calculus&quot;</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["DSA Notes", "DBMS PYQ", "Operating Systems", "Engineering Maths", "Algorithms"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && notes.length === 0 && videos.length === 0 && subjects.length === 0 && quizzes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No matching resources found for &quot;{query}&quot;. Try broader terms.
            </div>
          )}

          {/* Subjects */}
          {subjects.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Subjects
              </h3>
              <div className="space-y-1">
                {subjects.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/subjects/${sub.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {sub.name}
                      </div>
                      <div className="text-xs text-slate-500">Code: {sub.code} • {sub.branch?.name || "B.Tech"}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-medium">
                      View Subject
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> Study Notes & PDFs
              </h3>
              <div className="space-y-1">
                {notes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {note.title}
                      </div>
                      <div className="text-xs text-slate-500">{note.subject?.name} • {note.fileSize}</div>
                    </div>
                    {note.isPYQ && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-medium">
                        PYQ Solved
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-500" /> Video Lectures
              </h3>
              <div className="space-y-1">
                {videos.map((vid) => (
                  <Link
                    key={vid.id}
                    href={`/videos/${vid.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {vid.title}
                      </div>
                      <div className="text-xs text-slate-500">{vid.subject?.name} • Duration {vid.duration}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Practice Quizzes
              </h3>
              <div className="space-y-1">
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quizzes/${quiz.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {quiz.title}
                      </div>
                      <div className="text-xs text-slate-500">{quiz.subject?.name} • {quiz.durationMinutes} Mins</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-500 flex justify-between items-center">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">ESC</kbd> to close</span>
          <span>BTECHBUDDY Search Engine</span>
        </div>
      </div>
    </div>
  );
}
