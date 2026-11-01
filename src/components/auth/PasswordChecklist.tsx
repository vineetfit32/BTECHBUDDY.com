"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

export default function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="grid gap-1 pt-1 font-mono text-[11px]" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.id} className={cn("flex items-center gap-1.5", ok ? "text-ok" : "text-ink-3")}>
            {ok ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
            <span>{rule.label}</span>
            <span className="sr-only">{ok ? "met" : "not met"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function isPasswordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
