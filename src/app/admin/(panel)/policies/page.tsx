import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PoliciesManager from "@/components/admin/PoliciesManager";
import { getAdminSession } from "@/lib/auth";
import { getPolicies } from "@/lib/policies";

export const dynamic = "force-dynamic";

export default async function AdminPoliciesPage() {
  const session = await getAdminSession();
  const policies = await getPolicies();

  return (
    <>
      <AdminPageHeader
        title="Policy Pages"
        breadcrumb="Home › Policy Pages"
        username={session!.username}
      />
      <div className="admin-page-body">
        <PoliciesManager initialPolicies={JSON.parse(JSON.stringify(policies))} />
      </div>
    </>
  );
}
