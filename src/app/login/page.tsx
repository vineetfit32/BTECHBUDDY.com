"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, AlertCircle, Terminal } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to log in");
        setLoading(false);
        return;
      }

      // Route according to user role
      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDemoFill = (role: "student" | "admin") => {
    if (role === "student") {
      setEmail("student@btechbuddy.in");
      setPassword("Student@12345");
    } else {
      setEmail("admin@btechbuddy.in");
      setPassword("Admin@12345");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-blueprint opacity-30 pointer-events-none" />

      <div className="max-w-md w-full space-y-6 desk-card p-8 sm:p-10 rounded-3xl shadow-glow-sm relative z-10 border-primary-violet/30">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-primary-violet to-accent-cyan flex items-center justify-center text-white shadow-glow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>
          <div className="font-mono text-xs text-primary-violet font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> AUTHENTICATION_TERMINAL
          </div>
          <h2 className="text-2xl font-black text-ink">
            Welcome to BTECHBUDDY
          </h2>
          <p className="font-mono text-xs text-ink-3">
            Sign in to access your study desk, notes, and live classes
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-mono text-xs font-bold text-ink-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@btechbuddy.in"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-2 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs outline-hidden focus:border-primary-violet transition-colors text-ink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold text-ink-2">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[11px] font-semibold text-primary-violet hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-2 dark:bg-desk-canvas border border-desk-border rounded-xl text-xs outline-hidden focus:border-primary-violet transition-colors text-ink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-mono text-xs font-bold text-white bg-primary-violet hover:bg-primary-violet/90 shadow-glow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Study Desk →"}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="p-3.5 rounded-xl desk-card text-center space-y-2 border-dashed">
          <div className="font-mono text-[11px] font-semibold text-ink-3">Quick 1-Tap Demo Credentials:</div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill("student")}
              className="px-3 py-1 rounded-lg font-mono text-xs font-bold bg-primary-violet/10 text-primary-violet hover:bg-primary-violet/20 transition-colors border border-primary-violet/30"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("admin")}
              className="px-3 py-1 rounded-lg font-mono text-xs font-bold bg-danger/10 text-danger hover:bg-danger/20 transition-colors border border-danger/30"
            >
              Super Admin
            </button>
          </div>
        </div>

        <div className="text-center font-mono text-xs text-ink-3">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-accent-cyan hover:underline"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
