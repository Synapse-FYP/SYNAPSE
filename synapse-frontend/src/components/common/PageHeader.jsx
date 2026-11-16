// Standard page heading with optional subtitle and right-hand actions.
export default function PageHeader({ title, sub, children, style }) {
  return (
    <div className="page-h" style={style}>
      <div><h1>{title}</h1>{sub && <div className="page-sub">{sub}</div>}</div>
      {children}
    </div>
  );
}
