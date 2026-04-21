import './DashboardLayout.css'

export function DashboardLayout({ sidebar, children, notice, onNoticeClose }) {
  return (
    <div className="dashboard-shell">
      {sidebar}
      <main className="dashboard-shell__content">{children}</main>
      {notice ? (
        <aside className="dashboard-shell__notice" aria-live="polite">
          <div className="stock-toast">
            <div className="stock-toast__header">
              <div>
                <span className="panel__eyebrow">Alerta</span>
                <strong>Stock bajo</strong>
              </div>
              <button type="button" className="stock-toast__close" onClick={onNoticeClose}>
                ×
              </button>
            </div>

            <p className="stock-toast__summary">
              Hay {notice.total} productos con stock bajo. Revisa el panel de analisis.
            </p>

            <div className="stock-toast__items">
              {notice.items.slice(0, 3).map((item) => (
                <div key={item.product_id} className="stock-toast__item">
                  <strong>{item.name}</strong>
                  <span>Stock: {item.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
