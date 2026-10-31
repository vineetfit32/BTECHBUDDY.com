"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User, Building, Layers, Loader2, AlertCircle, Terminal } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [semester, setSemester] = useState("3");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, college, branch, semester }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      router.push("/student/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-blueprint opacity-30 pointer-events-none" />

      <div className="max-w-md w-full space-y-6 desk-card p-8 sm:p-10 rounded-3xl shadow-glow-sm relative z-10 border-primary-violet/30">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-violet to-accent-cyan flex items-center justify-center text-white shadow-glow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <div className="font-mono text-xs text-primary-violet font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> STUDENT_REGISTRATION
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Create Student Account
          </h2>
          <p className="font-mono text-xs text-slate-400">
            Join thousands of B.Tech students on the Engineer&apos;s Study Desk
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs outline-none focus:border-primary-violet text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohit@college.edu.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs outline-none focus:border-primary-violet text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs outline-none focus:border-primary-violet text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              Engineering College / University
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. AKTU, VTU, RTU, Delhi Tech University"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs outline-none focus:border-primary-violet text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl font-mono text-xs font-semibold outline-none text-slate-700 dark:text-slate-200 focus:border-primary-violet"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AIML">AIML</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="ME">ME</option>
                <option value="CE">Civil</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-desk-canvas border border-desk-border rounded-xl font-mono text-xs font-semibold outline-none text-slate-700 dark:text-slate-200 focus:border-primary-violet"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-mono text-xs font-bold text-white bg-primary-violet hover:bg-primary-violet/90 shadow-glow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration →"}
          </button>
        </form>

        <div className="text-center font-mono text-xs text-slate-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-primary-violet hover:underline"
          >
            Log in to study desk
          </Link>
        </div>
      </div>
    </div>
  );
}
