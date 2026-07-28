import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { listAdmins } from "@/lib/admins";
import { getAdminSession, getMasterAdminUsername } from "@/lib/auth";
import { ensureAppReady } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session?.isMaster) redirect("/admin");

  await ensureAppReady();
  const admins = await listAdmins();
  const masterUsername = getMasterAdminUsername();

  return (
    <>
      <AdminPageHeader
        title="Admin Users"
        breadcrumb="Home › Admin Users"
        username={session.username}
        isMaster
      />
      <div className="admin-page-body">
        <AdminUsersManager
          initialAdmins={admins.map((admin) => ({
            ...admin,
            isMaster: admin.username === masterUsername,
          }))}
          currentUserId={session.id}
        />
      </div>
    </>
  );
}
