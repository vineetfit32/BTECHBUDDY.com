"use client";

import { useState, useEffect } from "react";
import { UserCheck, Plus, Shield, Mail, Lock, User, Loader2 } from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("INSTRUCTOR");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [saving, setSaving] = useState(false);

  const fetchStaff = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/users?role=ADMIN").then((r) => r.json()),
      fetch("/api/admin/users?role=INSTRUCTOR").then((r) => r.json()),
      fetch("/api/admin/users?role=SUPER_ADMIN").then((r) => r.json()),
    ])
      .then(([admins, instructors, superAdmins]) => {
        setStaff([
          ...(superAdmins.users || []),
          ...(admins.users || []),
          ...(instructors.users || []),
        ]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, college, branch }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create account");
      } else {
        setShowAddModal(false);
        setName("");
        setEmail("");
        setPassword("");
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-3">
        <div>
          <h1 className="text-2xl font-black text-ink">
            Manage Staff & Instructors
          </h1>
          <p className="text-xs text-ink-3">
            Control platform administrators, subject professors, and role-based permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-danger hover:bg-danger/90 text-white shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" /> Provision New Staff Account
        </button>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-surface border border-line shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-danger to-brand text-white flex items-center justify-center font-bold text-sm">
                {member.name[0]}
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  member.role === "SUPER_ADMIN"
                    ? "bg-danger-soft text-danger"
                    : member.role === "ADMIN"
                    ? "bg-brand-soft text-brand"
                    : "bg-brand-soft text-brand"
                }`}
              >
                {member.role}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-ink">{member.name}</h3>
              <p className="text-xs text-ink-3">{member.email}</p>
              <div className="text-[11px] text-ink-3 mt-1">
                {member.college || "BTechBuddy Faculty"} • {member.branch || "CSE"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface rounded-2xl p-6 border border-line shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-ink">
              Provision Staff Account
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-ink-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prof. Sharma"
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-2">Staff Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@btechbuddy.in"
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink-2">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  >
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink-2">Department</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="CSE"
                    className="w-full p-2.5 bg-surface-2 border border-line rounded-xl outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-ink-3 hover:bg-surface-2 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold"
                >
                  {saving ? "Creating..." : "Save Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
