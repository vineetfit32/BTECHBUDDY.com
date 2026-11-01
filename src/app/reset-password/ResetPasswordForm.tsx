"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Lock } from "lucide-react";
import PasswordChecklist, { isPasswordValid } from "@/components/auth/PasswordChecklist";

export default function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isPasswordValid(password)) return setError("Choose a stronger password.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error || "Could not reset your password.");
      setDone(true);
    } catch {
      setError("You appear to be offline. Reconnect and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass relative z-10 w-full max-w-md space-y-6 rounded-3xl p-8 sm:p-10">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-tr from-brand to-accent text-on-brand shadow-glow-sm">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Choose a new password</h1>
        <p className="text-sm text-ink-3">Signing in again on your other devices will be required afterwards.</p>
      </div>

      {!token ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-2">This page needs the link from your reset email.</p>
          <Link href="/forgot-password" className="btn-brutal inline-flex px-4 py-2 text-xs">
            Request a new link
          </Link>
        </div>
      ) : done ? (
        <div className="space-y-3 rounded-2xl border border-ok/40 bg-ok-soft p-5 text-center" role="status">
          <CheckCircle2 className="mx-auto h-8 w-8 text-ok" />
          <h2 className="text-sm font-bold text-ink">Password updated</h2>
          <p className="text-sm text-ink-2">You can now sign in with your new password.</p>
          <Link href="/login" className="btn-brutal inline-flex px-4 py-2 text-xs">
            Go to sign in
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
            <label htmlFor="new-password" className="text-xs font-bold text-ink-2">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pl-10"
              />
            </div>
            <PasswordChecklist password={password} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-xs font-bold text-ink-2">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field pl-10"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-brutal w-full justify-center py-3 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
