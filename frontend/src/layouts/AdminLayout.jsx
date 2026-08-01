import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant h-16 flex items-center justify-between px-4 md:px-8 shadow-luminous-md">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-primary p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-headline-sm font-bold text-primary">Chende Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-label-lg text-on-surface-variant">{admin?.username}</span>
            <button
              onClick={handleLogout}
              className="text-label-lg text-error hover:bg-error-container px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
