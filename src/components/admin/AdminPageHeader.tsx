export default function AdminPageHeader({
  title,
  breadcrumb,
  username,
  isMaster = false,
}: {
  title: string;
  breadcrumb?: string;
  username: string;
  isMaster?: boolean;
}) {
  return (
    <header className="admin-header">
      <div className="admin-header-title-wrap">
        <h1>{title}</h1>
        {breadcrumb ? <p className="admin-breadcrumb">{breadcrumb}</p> : null}
      </div>
      <div className="admin-header-user">
        <span className="admin-header-avatar">
          {username.charAt(0).toUpperCase()}
        </span>
        <div className="admin-header-user-meta">
          <strong>{username}</strong>
          {isMaster ? <span className="admin-master-badge">Master</span> : null}
        </div>
      </div>
    </header>
  );
}
