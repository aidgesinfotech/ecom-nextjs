import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  await ensureAppReady();

  return <AdminShell isMaster={session.isMaster}>{children}</AdminShell>;
}
