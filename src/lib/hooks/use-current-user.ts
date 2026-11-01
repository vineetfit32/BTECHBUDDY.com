"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string | null;
  branch?: string | null;
  semester?: number | null;
  avatar?: string | null;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<CurrentUser | null> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data?.authenticated ? data.user : null;
    },
    staleTime: 60_000,
  });
}

export function useLogout() {
  const client = useQueryClient();
  return async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    client.setQueryData(["me"], null);
    client.invalidateQueries();
  };
}
