import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductsManager from "@/components/admin/ProductsManager";
import { getAdminSession } from "@/lib/auth";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  const products = await getProducts({ fresh: true });

  return (
    <>
      <AdminPageHeader
        title="Products"
        breadcrumb="Home › Products"
        username={session!.username}
      />
      <div className="admin-page-body">
        <ProductsManager initialProducts={JSON.parse(JSON.stringify(products))} />
      </div>
    </>
  );
}
