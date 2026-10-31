import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StudentSidebar from "@/components/student/StudentSidebar";

export const dynamic = "force-dynamic";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <StudentSidebar />
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
