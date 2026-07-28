import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UnsyncOrdersManager from "@/components/admin/UnsyncOrdersManager";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUnsyncOrdersPage() {
  const session = await getAdminSession();

  return (
    <>
      <AdminPageHeader
        title="Unsync Orders"
        breadcrumb="Home › Unsync Orders"
        username={session!.username}
      />
      <div className="admin-page-body">
        <UnsyncOrdersManager />
      </div>
    </>
  );
}
