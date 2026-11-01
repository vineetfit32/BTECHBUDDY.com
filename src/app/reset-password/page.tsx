import { Suspense } from "react";
import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password — BTECHBUDDY" };

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-30" />
      <Suspense fallback={<div className="glass h-80 w-full max-w-md animate-pulse rounded-3xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
