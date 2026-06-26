import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
  isMaster = false,
}: {
  children: React.ReactNode;
  isMaster?: boolean;
}) {
  return (
    <div className="admin-shell">
      <AdminSidebar isMaster={isMaster} />
      <main className="admin-main">
        <div className="admin-main-inner">{children}</div>
      </main>
    </div>
  );
}
