import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY2gXvr5TLlT3ypR-fAnOnydCqElxAKTKQlBGdq1wK8sX-SwdhUrsynhG0uXs0AxpAM_gdQUnzbQsCnTqzCkWCEgVqSom0o0TKFu_Tl9NGXZ49PjS2dew3iIeaiELc19M7wbB-bkaqL_YQOSKsHHqROueFp4mzFQcMlF1byhnXbzi4hOvO3dGaiQM8gb87dO7A1hycCYHCAmv1x4OK34cObyPUypA33qOg4UW32k2kPk9SaHuvDv8kjtcXPAk6rjYrEHSnI3K_4PGv';

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/bookings', icon: 'event_note', label: 'Bookings' },
  { to: '/admin/events', icon: 'celebration', label: 'Events' },
  { to: '/admin/team', icon: 'group', label: 'Team Members' },
  { to: '/admin/beats', icon: 'music_note', label: 'Beats' },
  { to: '/admin/reviews', icon: 'star', label: 'Reviews' },
  { to: '/admin/messages', icon: 'mail', label: 'Messages' },
  { to: '/admin/content', icon: 'edit_note', label: 'Edit Content' },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
            <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-label-lg font-bold text-primary">Chende Admin</p>
            <p className="text-label-md text-on-surface-variant">{admin?.username}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-label-lg transition-all ${
              isActive(item.to)
                ? 'bg-secondary-container text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-outline-variant space-y-2">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-label-lg text-on-surface-variant hover:bg-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          View Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-label-lg text-error hover:bg-error-container transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative w-64 bg-surface-container-lowest h-full flex flex-col shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
