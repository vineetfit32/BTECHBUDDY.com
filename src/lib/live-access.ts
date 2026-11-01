export type LiveRole = "host" | "viewer" | "denied";

export function liveRole(
  user: { id: string; role: string },
  liveClass: { instructorId: string | null },
): LiveRole {
  if (liveClass.instructorId && user.id === liveClass.instructorId) return "host";
  if (user.role === "INSTRUCTOR") return "denied";
  if (user.role === "STUDENT" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") return "viewer";
  return "denied";
}
