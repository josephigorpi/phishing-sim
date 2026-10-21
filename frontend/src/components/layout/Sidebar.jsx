// === frontend/src/components/layout/Sidebar.jsx ===
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard general', end: true },
  { to: '/dashboard/department', label: 'Dashboard por área' },
  { to: '/campaigns', label: 'Campañas' },
  { to: '/templates', label: 'Plantillas' },
  { to: '/users', label: 'Usuarios' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">PhishingSim</span>
        <span className="sidebar__subtitle">ISO 27001 · A.6.3</span>
      </div>

      <nav className="sidebar__nav" aria-label="Navegación principal">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">v1.0 · Seguridad corporativa</div>
    </aside>
  );
}
