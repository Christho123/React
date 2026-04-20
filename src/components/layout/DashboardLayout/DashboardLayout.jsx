import './DashboardLayout.css'

export function DashboardLayout({ sidebar, children }) {
  return (
    <div className="dashboard-shell">
      {sidebar}
      <main className="dashboard-shell__content">{children}</main>
    </div>
  )
}
