import AdminPageHeader from "@/components/admin/AdminPageHeader";
import OrdersManager from "@/components/admin/OrdersManager";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();

  return (
    <>
      <AdminPageHeader
        title="Orders"
        breadcrumb="Home › Orders"
        username={session!.username}
      />
      <div className="admin-page-body">
        <OrdersManager />
      </div>
    </>
  );
}
