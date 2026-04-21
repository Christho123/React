import { Button } from '../../ui/Button/Button.jsx'
import { useTheme } from '../../../context/ThemeContext.jsx'
import './Sidebar.css'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'analytics', label: 'Analisis', icon: 'A' },
  {
    id: 'products',
    label: 'Productos',
    icon: 'P',
    submenu: [
      { id: 'categories', label: 'Categoria', section: 'categories' },
      { id: 'brands', label: 'Marca', section: 'brands' },
      { id: 'suppliers', label: 'Proveedor', section: 'suppliers' },
    ],
  },
  {
    id: 'purchases',
    label: 'Compras',
    icon: 'R',
    submenu: [
      { id: 'create', label: 'Compra' },
      { id: 'detail', label: 'Detalle compra' },
    ],
  },
  {
    id: 'sales',
    label: 'Ventas',
    icon: 'V',
    submenu: [
      { id: 'create', label: 'Venta' },
      { id: 'detail', label: 'Detalle venta' },
    ],
  },
  { id: 'inventory', label: 'Inventory', icon: 'I' },
  
]

export function Sidebar({
  activeSection,
  activeSubsection,
  onSectionChange,
  onLogout,
  user,
}) {
  const theme = useTheme()
  const isDark = theme.theme === 'dark'
  const initials = (user?.name ?? 'Usuario')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const nextThemeLabel = isDark ? 'Modo claro' : 'Modo oscuro'
  const nextThemeAriaLabel = isDark
    ? 'Cambiar a modo claro'
    : 'Cambiar a modo oscuro'

  return (
    <aside className="sidebar">
      <div className="sidebar__profile">
        <div className="sidebar__avatar" aria-hidden="true">
          {initials || 'U'}
        </div>
        <strong className="sidebar__name">{user?.name ?? 'Usuario'}</strong>
      </div>

      <nav className="sidebar__nav" aria-label="Secciones del dashboard">
        {menuItems.map((item) => {
          const isActive =
            activeSection === item.id ||
            item.submenu?.some((subItem) => activeSection === subItem.section)
          const isExpanded = Boolean(item.submenu) && isActive

          return (
            <div key={item.id} className={`sidebar__nav-group ${isExpanded ? 'is-expanded' : ''}`}>
              <button
                type="button"
                className={`sidebar__nav-item ${isActive ? 'is-active' : ''}`}
                onClick={() =>
                  onSectionChange(item.id, item.id === 'products' ? null : item.submenu?.[0]?.id ?? null)
                }
                aria-expanded={isExpanded}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-text">
                  <strong>{item.label}</strong>
                  {item.description ? <small>{item.description}</small> : null}
                </span>
              </button>

              {item.submenu ? (
                <div className={`sidebar__submenu ${isExpanded ? 'is-open' : ''}`}>
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      type="button"
                      className={`sidebar__submenu-item ${
                        activeSection === (subItem.section ?? item.id) &&
                        activeSubsection === subItem.id
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() =>
                        onSectionChange(
                          subItem.section ?? item.id,
                          subItem.section ? null : subItem.id,
                        )
                      }
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <button
          type="button"
          className="theme-toggle"
          onClick={theme.toggleTheme}
          aria-label={nextThemeAriaLabel}
        >
          <span className="theme-toggle__icon" aria-hidden="true">
            {isDark ? '\u263E' : '\u2600'}
          </span>

          <span className="theme-toggle__label">{nextThemeLabel}</span>

          <span
            className={`theme-toggle__switch theme-toggle__switch--${
              theme.theme
            }`}
            aria-hidden="true"
          >
            <span className="theme-toggle__knob" />
            <span className="theme-toggle__state">{isDark ? 'OFF' : 'ON'}</span>
          </span>
        </button>

        <Button variant="ghost" className="sidebar__logout" onClick={onLogout}>
          Cerrar sesion
        </Button>
      </div>
    </aside>
  )
}
