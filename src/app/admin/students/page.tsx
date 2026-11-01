"use client";

import { useState, useEffect } from "react";
import { Users, Search, CheckCircle, XCircle, Shield, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = () => {
    setLoading(true);
    fetch(`/api/admin/users?role=STUDENT&search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((d) => setStudents(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const toggleStatus = async (user: any) => {
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Manage Registered Students
          </h1>
          <p className="text-xs text-ink-3">
            View student profiles, colleges, branches, and control account activation
          </p>
        </div>
        <div className="text-xs font-bold text-ink-3">
          Total Students: <span className="text-danger font-extrabold">{students.length}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search students by name, email, or college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line rounded-xl text-xs outline-hidden focus:border-danger"
        />
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-20 text-center text-ink-3">
          <Loader2 className="w-8 h-8 text-danger animate-spin mx-auto mb-2" />
          <span className="text-xs font-semibold">Loading student directory...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-surface border border-line text-xs text-ink-3">
          No students matching search criteria.
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-line overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-ink-2">
              <thead className="bg-surface-2 uppercase font-bold text-[10px] text-ink-3 border-b border-line">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Branch & Sem</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-ink">{st.name}</div>
                      <div className="text-[11px] text-ink-3">{st.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-brand">
                        {st.branch || "CSE"}
                      </span>
                      <span className="text-ink-3 text-[11px]"> • Sem {st.semester || 3}</span>
                    </td>
                    <td className="px-4 py-3.5 text-ink-3">
                      {st.college || "B.Tech Institute"}
                    </td>
                    <td className="px-4 py-3.5 text-ink-3 text-[11px]">
                      {formatDate(st.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.isActive
                            ? "bg-ok-soft text-ok"
                            : "bg-danger-soft text-danger"
                        }`}
                      >
                        {st.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => toggleStatus(st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          st.isActive
                            ? "text-danger hover:bg-danger-soft"
                            : "text-ok hover:bg-ok-soft"
                        }`}
                      >
                        {st.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
