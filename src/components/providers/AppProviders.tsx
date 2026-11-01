"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { TooltipProvider } from "@/components/kit";
import { usePreferences } from "@/lib/use-preferences";

export default function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      })
  );
  const { motion } = usePreferences();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion={motion === "full" ? "user" : "always"}>
        <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
