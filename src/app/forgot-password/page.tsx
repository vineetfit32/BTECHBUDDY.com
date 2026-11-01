"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send the reset link. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("You appear to be offline. Reconnect and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-30" />
      <div className="glass relative z-10 w-full max-w-md space-y-6 rounded-3xl p-8 sm:p-10">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="BTECHBUDDY home">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-tr from-brand to-accent text-on-brand shadow-glow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
          <p className="text-sm text-ink-3">Enter the email you registered with and we&apos;ll send you a reset link.</p>
        </div>

        {submitted ? (
          <div className="space-y-3 rounded-2xl border border-ok/40 bg-ok-soft p-5 text-center" role="status">
            <CheckCircle2 className="mx-auto h-8 w-8 text-ok" />
            <h2 className="text-sm font-bold text-ink">Check your inbox</h2>
            <p className="text-sm text-ink-2">
              If an account exists for <span className="font-semibold text-ink">{email}</span>, a reset link is on its way. It
              expires in 30 minutes.
            </p>
            <Link href="/login" className="btn-brutal inline-flex px-4 py-2 text-xs">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger-soft p-3 text-xs text-danger" role="alert">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-ink-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu.in"
                  className="field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-brutal w-full justify-center py-3 text-sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 transition-colors hover:text-brand">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
