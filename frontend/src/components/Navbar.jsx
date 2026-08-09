import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDY2gXvr5TLlT3ypR-fAnOnydCqElxAKTKQlBGdq1wK8sX-SwdhUrsynhG0uXs0AxpAM_gdQUnzbQsCnTqzCkWCEgVqSom0o0TKFu_Tl9NGXZ49PjS2dew3iIeaiELc19M7wbB-bkaqL_YQOSKsHHqROueFp4mzFQcMlF1byhnXbzi4hOvO3dGaiQM8gb87dO7A1hycCYHCAmv1x4OK34cObyPUypA33qOg4UW32k2kPk9SaHuvDv8kjtcXPAk6rjYrEHSnI3K_4PGv';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/team', label: 'Team Members' },
  { to: '/events', label: 'Events' },
  { to: '/beats', label: 'Beats' },
  { to: '/book', label: 'Book Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-shadow ${scrolled ? 'shadow-luminous-md' : ''} bg-surface-container-lowest border-b border-outline-variant`}>
      <div className="container-max">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
              <img src={LOGO_URL} alt="Nandini Chende Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-headline-sm font-bold text-primary leading-tight hidden sm:block">
              Nandini Chende Kateel
            </span>
            <span className="text-headline-sm font-bold text-primary leading-tight sm:hidden">
              NCK
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-label-lg transition-colors pb-1 ${
                  isActive(link.to)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-primary p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant shadow-luminous-md">
          <nav className="container-max py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 rounded-lg text-label-lg transition-colors ${
                  isActive(link.to)
                    ? 'bg-secondary-container text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
