"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lecture = { id: string; title: string; subjectId: string; subjectLabel: string };

export default function ResourceForm({ lectures }: { lectures: Lecture[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(lectures[0]?.id ?? "");
  const [kind, setKind] = useState<"note" | "video">("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lecture = lectures.find((item) => item.id === classId) ?? lectures[0];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lecture || !file) return;
    setSaving(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      if (kind === "video") body.set("purpose", "video");
      const uploaded = await fetch("/api/upload", { method: "POST", body });
      const uploadData = await uploaded.json();
      if (!uploaded.ok) {
        setError(uploadData.error || "Upload failed");
        return;
      }

      const res = await fetch(kind === "note" ? "/api/notes" : "/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "note"
            ? {
                title,
                description,
                fileUrl: uploadData.url,
                fileSize: uploadData.fileSize,
                fileType: "PDF",
                subjectId: lecture.subjectId,
              }
            : {
                title,
                description,
                videoUrl: uploadData.url,
                subjectId: lecture.subjectId,
              },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save the resource");
        return;
      }
      setTitle("");
      setDescription("");
      setFile(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Could not save the resource");
    } finally {
      setSaving(false);
    }
  }

  if (!lecture) {
    return <p className="text-sm text-ink-3">An admin has to assign you a lecture before you can add resources.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-xs">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="font-bold text-ink-2">Lecture</span>
          <select
            value={lecture.id}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
          >
            {lectures.map((item) => (
              <option key={item.id} value={item.id}>
                {item.subjectLabel}: {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="font-bold text-ink-2">Type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value === "video" ? "video" : "note")}
            className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
          >
            <option value="note">Note (PDF)</option>
            <option value="video">Video</option>
          </select>
        </label>
      </div>
      <label className="block space-y-1">
        <span className="font-bold text-ink-2">Title</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
        />
      </label>
      <label className="block space-y-1">
        <span className="font-bold text-ink-2">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
        />
      </label>
      <label className="block space-y-1">
        <span className="font-bold text-ink-2">{kind === "note" ? "PDF" : "Video file"}</span>
        <input
          required
          type="file"
          accept={kind === "note" ? "application/pdf" : "video/mp4,video/webm,video/quicktime"}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-ink-2"
        />
      </label>
      {error && <p className="font-semibold text-danger">{error}</p>}
      <button type="submit" disabled={saving} className="rounded-xl bg-brand px-4 py-2 font-bold text-white">
        {saving ? "Saving..." : "Add resource"}
      </button>
    </form>
  );
}
