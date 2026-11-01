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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-line overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 border-b border-line">
          <Search className="w-5 h-5 text-ink-3 mr-3" />
          <input
            type="text"
            placeholder="Search subjects, notes, videos, quizzes (e.g. DSA, DBMS, Maths)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 bg-transparent outline-hidden text-ink placeholder:text-ink-3 text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-brand animate-spin mr-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-2 text-ink-3 hover:text-ink-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="text-center py-10 text-ink-3 text-sm">
              <p className="font-medium text-ink-2 mb-1">Quick Engineering Search</p>
              <p>Type keywords like &quot;Data Structures&quot;, &quot;Operating Systems&quot;, or &quot;Calculus&quot;</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["DSA Notes", "DBMS PYQ", "Operating Systems", "Engineering Maths", "Algorithms"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 text-xs rounded-full bg-surface-2 text-ink-2 hover:bg-brand-soft hover:text-brand transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && notes.length === 0 && videos.length === 0 && subjects.length === 0 && quizzes.length === 0 && (
            <div className="text-center py-8 text-ink-3">
              No matching resources found for &quot;{query}&quot;. Try broader terms.
            </div>
          )}

          {/* Subjects */}
          {subjects.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand" /> Subjects
              </h3>
              <div className="space-y-1">
                {subjects.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/subjects/${sub.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-ink group-hover:text-brand">
                        {sub.name}
                      </div>
                      <div className="text-xs text-ink-3">Code: {sub.code} • {sub.branch?.name || "B.Tech"}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-brand-soft text-brand font-medium">
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
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-ok" /> Study Notes & PDFs
              </h3>
              <div className="space-y-1">
                {notes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink group-hover:text-ok">
                        {note.title}
                      </div>
                      <div className="text-xs text-ink-3">{note.subject?.name} • {note.fileSize}</div>
                    </div>
                    {note.isPYQ && (
                      <span className="text-xs px-2 py-0.5 rounded-sm bg-warn-soft text-warn font-medium">
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
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-brand" /> Video Lectures
              </h3>
              <div className="space-y-1">
                {videos.map((vid) => (
                  <Link
                    key={vid.id}
                    href={`/videos/${vid.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink group-hover:text-brand">
                        {vid.title}
                      </div>
                      <div className="text-xs text-ink-3">{vid.subject?.name} • Duration {vid.duration}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes */}
          {quizzes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-warn" /> Practice Quizzes
              </h3>
              <div className="space-y-1">
                {quizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quizzes/${quiz.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink group-hover:text-warn">
                        {quiz.title}
                      </div>
                      <div className="text-xs text-ink-3">{quiz.subject?.name} • {quiz.durationMinutes} Mins</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-line bg-surface-2 text-xs text-ink-3 flex justify-between items-center">
          <span>Press <kbd className="px-1.5 py-0.5 rounded-sm bg-surface-3 font-mono text-[10px]">ESC</kbd> to close</span>
          <span>BTECHBUDDY Search Engine</span>
        </div>
      </div>
    </div>
  );
}
