// Horizontal tab bar used across pages (`.tabs` / `.tab`).
export default function Tabs({ tabs, style }) {
  return (
    <div className="tabs" role="tablist" style={style}>
      {tabs.map((t) => (
        <button key={t.k || t.label} type="button" role="tab" className={t.cls} aria-selected={t.sel} onClick={t.go}>{t.label}</button>
      ))}
    </div>
  );
}
