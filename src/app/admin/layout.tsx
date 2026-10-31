import { redirect } from "next/navigation";
import { getCurrentUser, isAuthorized } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Strict server-side RBAC guard
  if (!user || !isAuthorized(user.role, ["SUPER_ADMIN", "ADMIN"])) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
