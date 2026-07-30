export default function Topbar({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-30 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </header>
  );
}
