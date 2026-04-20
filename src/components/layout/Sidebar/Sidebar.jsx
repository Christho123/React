import { Button } from '../../ui/Button/Button.jsx'
import { useTheme } from '../../../context/ThemeContext.jsx'
import './Sidebar.css'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', description: 'Inicio', icon: '⌂' },
  { id: 'categories', label: 'Categorías', description: 'Gestión', icon: '▣' },
  { id: 'analytics', label: 'Análisis', description: 'Estadísticas', icon: '◔' },
]

export function Sidebar({ activeSection, onSectionChange, onLogout, user }) {
  const theme = useTheme()

  // Imagen por defecto si no hay API
  const defaultAvatar = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=7c5cff&color=fff`

  return (
    <aside className="sidebar">
      {/* --- PERFIL MEJORADO (Avatar + Nombre + Email) --- */}
      <div className="sidebar__profile">
        <img 
          className="sidebar__avatar" 
          src={user?.avatar || defaultAvatar} 
          alt="Perfil" 
        />
        <div className="sidebar__user-info">
          <h3 className="sidebar__name">{user?.name ?? 'Usuario'}</h3>
          <span className="sidebar__email">{user?.email || 'usuario@ejemplo.com'}</span>
        </div>
      </div>

      {/* --- NAVEGACIÓN --- */}
      <nav className="sidebar__nav" aria-label="Secciones del dashboard">
        <ul className="sidebar__list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar__nav-item ${
                  activeSection === item.id ? 'is-active' : ''
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <div className="sidebar__text-group">
                  <strong className="sidebar__label">{item.label}</strong>
                  <small className="sidebar__desc">{item.description}</small>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- FOOTER (Tema + Logout) --- */}
      <div className="sidebar__footer">
        
        {/* Toggle de Apariencia */}
        <div className="sidebar__theme-wrapper">
          <button
            type="button"
            className="theme-toggle"
            onClick={theme.toggleTheme}
            aria-label="Cambiar tema"
          >
            <span className="theme-label">Modo Claro</span>
            <span className="theme-toggle__pill" aria-hidden="true">
              <span className={`theme-toggle__thumb ${theme.isDark ? 'dark' : 'light'}`} />
            </span>
          </button>
        </div>

        {/* Botón Cerrar Sesión */}
        <Button 
          variant="ghost" 
          className="sidebar__logout-btn" 
          onClick={onLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}