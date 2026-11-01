"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, BookOpen, Trash2, Check, Loader2 } from "lucide-react";

export default function AdminAcademicPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Subject Form
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("4");
  const [semesterNumber, setSemesterNumber] = useState("3");
  const [branchId, setBranchId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/branches").then((r) => r.json()),
      fetch("/api/subjects").then((r) => r.json()),
    ])
      .then(([bData, sData]) => {
        setBranches(bData.branches || []);
        setSubjects(sData.subjects || []);
        if (bData.branches?.length > 0 && !branchId) {
          setBranchId(bData.branches[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Find semester ID or pass semesterId
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          description,
          credits,
          semesterId: branches[0]?.subjects?.[0]?.semesterId || "sem-3",
          branchId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add subject");
      } else {
        setShowSubjectModal(false);
        setCode("");
        setName("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create subject");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Academic Hierarchy & Taxonomy
          </h1>
          <p className="text-xs text-ink-3">
            Configure B.Tech engineering branches, semester subjects, units, and university curricula
          </p>
        </div>
        <button
          onClick={() => setShowSubjectModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Subject
        </button>
      </div>

      {/* Branches List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" /> Configured Branches ({branches.length})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-surface border border-line shadow-2xs"
            >
              <span className="text-xs font-bold text-brand">
                {b.code}
              </span>
              <h4 className="text-xs font-bold text-ink mt-0.5 truncate">
                {b.name}
              </h4>
              <div className="text-[10px] text-ink-3 mt-1">
                {b._count?.subjects || 0} Subjects • {b._count?.notes || 0} Notes
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects Catalog */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-ok" /> Subjects Catalog ({subjects.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-ink-3">
            <Loader2 className="w-8 h-8 text-danger animate-spin mx-auto mb-2" />
            <span className="text-xs">Loading academic catalog...</span>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-ink-2">
              <thead className="bg-surface-2 uppercase font-bold text-[10px] text-ink-3 border-b border-line">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Materials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-mono font-bold text-brand">
                      {sub.code}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {sub.name}
                    </td>
                    <td className="px-4 py-3">{sub.branch?.name || "All Branches"}</td>
                    <td className="px-4 py-3">{sub.credits}</td>
                    <td className="px-4 py-3 text-ink-3 text-[11px]">
                      {sub._count?.notes || 0} Notes • {sub._count?.videos || 0} Videos
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
