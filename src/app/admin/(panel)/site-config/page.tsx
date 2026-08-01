import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import SiteConfigManager from "@/components/admin/SiteConfigManager";
import { getAdminSession } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminSiteConfigPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const config = await getSiteConfig();

  return (
    <>
      <AdminPageHeader
        title="Site Configuration"
        breadcrumb="Home › Site Configuration"
        username={session.username}
      />
      <div className="admin-page-body">
        <SiteConfigManager initialConfig={JSON.parse(JSON.stringify(config))} />
      </div>
    </>
  );
}
