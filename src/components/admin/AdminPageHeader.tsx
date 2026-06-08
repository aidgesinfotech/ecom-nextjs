export default function AdminPageHeader({
  title,
  breadcrumb,
  username,
}: {
  title: string;
  breadcrumb?: string;
  username: string;
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
        <strong>{username}</strong>
      </div>
    </header>
  );
}
