import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { listAdmins } from "@/lib/admins";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session?.isMaster) redirect("/admin");

  const admins = await listAdmins();

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
          initialAdmins={JSON.parse(JSON.stringify(admins))}
          currentAdminId={session.id}
        />
      </div>
    </>
  );
}
