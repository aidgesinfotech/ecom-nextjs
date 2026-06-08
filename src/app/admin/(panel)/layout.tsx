import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureAppReady();
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
