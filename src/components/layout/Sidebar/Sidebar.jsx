import { Button } from '../../ui/Button/Button.jsx'
import { useTheme } from '../../../context/ThemeContext.jsx'
import './Sidebar.css'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'categories', label: 'Categoria', icon: 'C' },
  { id: 'brands', label: 'Marca', icon: 'B' },
  { id: 'suppliers', label: 'Proveedor', icon: 'S' },
  { id: 'analytics', label: 'Analisis', description: 'En desarrollo', icon: 'A' },
]

export function Sidebar({ activeSection, onSectionChange, onLogout, user }) {
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
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar__nav-item ${
              activeSection === item.id ? 'is-active' : ''
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-text">
              <strong>{item.label}</strong>
              {item.description ? <small>{item.description}</small> : null}
            </span>
          </button>
        ))}
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
