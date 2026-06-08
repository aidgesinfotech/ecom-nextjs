import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DashboardManager from "@/components/admin/DashboardManager";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getAdminSession();

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        breadcrumb="Home › Dashboard"
        username={session!.username}
      />
      <div className="admin-page-body">
        <DashboardManager />
      </div>
    </>
  );
}
