"use client";

import { useState, useEffect } from "react";
import { Video, Plus, Trash2, Play, Loader2 } from "lucide-react";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("45:00");
  const [subjectId, setSubjectId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/videos").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
    ])
      .then(([vData, sData]) => {
        setVideos(vData.videos || []);
        setSubjects(sData.subjects || []);
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

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          duration,
          subjectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add video");
      } else {
        setShowAddModal(false);
        setTitle("");
        setVideoUrl("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("Error adding video");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Manage Video Lectures
          </h1>
          <p className="text-xs text-ink-3">
            Add YouTube or hosted engineering lectures, assign playlists, and set duration
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Video Lecture
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-ink-3">
          <Loader2 className="w-8 h-8 text-danger animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading video catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="p-5 rounded-2xl bg-surface border border-line shadow-2xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-brand uppercase">
                  {vid.subject?.name}
                </span>
                <h3 className="text-sm font-bold text-ink mt-1 line-clamp-2">
                  {vid.title}
                </h3>
                <p className="text-xs text-ink-3 mt-2 line-clamp-2">{vid.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                <span className="text-ink-3">{vid.duration}</span>
                <a
                  href={vid.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand hover:underline"
                >
                  Source Link →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface rounded-2xl p-6 border border-line shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-ink">
              Add Video Lecture
            </h3>

            <form onSubmit={handleAddVideo} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lec 05: AVL Tree Rotations & Deletion"
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-2">
                  YouTube / Video URL
                </label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Subject</label>
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
                  <label className="font-bold text-ink-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="45:00"
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-2">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of lecture concepts..."
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-ink-3 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold"
                >
                  {saving ? "Adding..." : "Save Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
