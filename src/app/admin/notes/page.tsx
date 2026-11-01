"use client";

import { useState, useEffect } from "react";
import { FileUp, Plus, Trash2, Eye, Download, Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import PDFViewerModal from "@/components/pdf/PDFViewerModal";

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPYQ, setIsPYQ] = useState(false);
  const [yearPYQ, setYearPYQ] = useState("2023-24");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Preview modal
  const [activePdf, setActivePdf] = useState<{ url: string; title: string; id: string } | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
      fetch("/api/branches").then((r) => r.json()),
    ])
      .then(([nData, sData, bData]) => {
        setNotes(nData.notes || []);
        setSubjects(sData.subjects || []);
        setBranches(bData.branches || []);
        if (sData.subjects?.length > 0 && !subjectId) {
          setSubjectId(sData.subjects[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !title) {
      setError("Please select a PDF document and title");
      return;
    }
    setError("");
    setUploading(true);

    try {
      let fileUrl = "/sample-notes/dsa-complete-handwritten-notes.pdf";
      let fileSize = "2.5 MB";

      // If a real file was selected, upload via /api/upload
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error || "File upload failed");
          setUploading(false);
          return;
        }
        fileUrl = uploadData.url;
        fileSize = uploadData.fileSize;
      }

      // Save note record
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileUrl,
          fileSize,
          subjectId,
          branchId: branchId || null,
          isFeatured,
          isPYQ,
          yearPYQ: isPYQ ? yearPYQ : null,
          tags,
        }),
      });

      const noteData = await res.json();
      if (!res.ok) {
        setError(noteData.error || "Failed to create note record");
      } else {
        setShowUploadModal(false);
        setTitle("");
        setDescription("");
        setFile(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this note?")) return;
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Study Materials & PDF Management
          </h1>
          <p className="text-xs text-ink-3">
            Upload notes, assign semesters, units, PYQs, and manage student downloads
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" /> Upload Study Material
        </button>
      </div>

      {/* Notes Table */}
      {loading ? (
        <div className="py-20 text-center text-ink-3">
          <Loader2 className="w-8 h-8 text-danger animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading study materials...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface border border-line text-xs text-ink-3">
          No notes uploaded yet. Click &ldquo;Upload Study Material&rdquo; to add your first PDF.
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-ink-2">
            <thead className="bg-surface-2 uppercase font-bold text-[10px] text-ink-3 border-b border-line">
              <tr>
                <th className="px-4 py-3">Document Title</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Size & Type</th>
                <th className="px-4 py-3">Metrics</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {notes.map((note) => (
                <tr key={note.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-ink flex items-center gap-2">
                      <span>{note.title}</span>
                      {note.isPYQ && (
                        <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-warn-soft text-warn">
                          PYQ
                        </span>
                      )}
                      {note.isFeatured && (
                        <span className="px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-brand-soft text-brand">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-3 line-clamp-1">{note.description}</div>
                  </td>
                  <td className="px-4 py-3.5 text-brand font-semibold">
                    {note.subject?.name} ({note.subject?.code})
                  </td>
                  <td className="px-4 py-3.5 text-ink-3">
                    {note.fileSize} • {note.fileType}
                  </td>
                  <td className="px-4 py-3.5 text-ink-3 text-[11px]">
                    {note.downloadCount} downloads • {note.viewCount} views
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() =>
                        setActivePdf({
                          url: note.fileUrl,
                          title: note.title,
                          id: note.id,
                        })
                      }
                      className="p-1 rounded-sm text-ink-3 hover:text-brand"
                      title="Preview PDF"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded-sm text-ink-3 hover:text-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface rounded-2xl p-6 border border-line shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink">
              Upload Study Notes & PDFs
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-danger-soft border border-danger/35 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Select PDF File</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-2">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 1: Arrays & Linked Lists Handwritten Notes"
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Target Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Branch (Optional)</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  >
                    <option value="">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-2">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe topics covered, handwritten style, or exam tips..."
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded-sm border-line-strong text-brand"
                  />
                  <span>Mark as Featured Topper Note</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPYQ}
                    onChange={(e) => setIsPYQ(e.target.checked)}
                    className="rounded-sm border-line-strong text-warn"
                  />
                  <span>Is Solved PYQ Paper</span>
                </label>
              </div>

              {isPYQ && (
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">PYQ Academic Session</label>
                  <input
                    type="text"
                    value={yearPYQ}
                    onChange={(e) => setYearPYQ(e.target.value)}
                    placeholder="2023-24"
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 rounded-xl text-ink-3 hover:bg-surface-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading PDF...
                    </>
                  ) : (
                    "Publish Note"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activePdf && (
        <PDFViewerModal
          isOpen={Boolean(activePdf)}
          onClose={() => setActivePdf(null)}
          pdfUrl={activePdf.url}
          title={activePdf.title}
          noteId={activePdf.id}
        />
      )}
    </div>
  );
}
