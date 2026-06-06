import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { canFileGrievance, isStaffRole } from '../../lib/roles';
import {
  Menu,
  X,
  User,
  LogOut,
  FileText,
  Search,
  HelpCircle,
  Mail,
  Home,
  LayoutDashboard,
  Code,
} from 'lucide-react';

const HERO_NAV_PATHS = [
  '/',
  '/login',
  '/signup',
  '/contact',
  '/how-it-works',
  '/dashboard',
  '/admin/dashboard',
  '/clerk/dashboard',
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Always show the same navbar styling across all pages; only adjust surface on scroll.
  const isHeroNav = HERO_NAV_PATHS.includes(location.pathname);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isUserMenuOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'clerk'
        ? '/clerk/dashboard'
        : '/dashboard';

  const staffUser = isStaffRole(user?.role);

  const trackLink = staffUser
    ? { name: 'Manage Grievances', path: '/track-grievance', icon: Search }
    : { name: 'Track Your Grievance', path: '/track-grievance', icon: Search };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    ...(user ? [{ name: 'Dashboard', path: dashboardPath, icon: LayoutDashboard }] : []),
    ...(canFileGrievance(user?.role)
      ? [{ name: 'File Grievance', path: '/file-grievance', icon: FileText }]
      : []),
    trackLink,
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleDevelopersNavigation = () => handleNavigation('/developers');

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsOpen(false);
    logout();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const DASHBOARD_PATHS = ['/admin/dashboard', '/clerk/dashboard'];
  const isDashboardNav = DASHBOARD_PATHS.includes(location.pathname);

    const navSurfaceClass = isHeroNav
    ? (scrolled || isDashboardNav)
      ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-white/10'
      : 'bg-transparent border-b border-transparent'
    : scrolled
      ? 'bg-white/95 backdrop-blur-xl shadow-md shadow-slate-900/5 border-b border-slate-200/80'
      : 'bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-900/[0.03] border-b border-slate-200/80';

  return (
    <nav className={`${isHeroNav ? 'absolute' : 'relative'} top-0 left-0 right-0 z-50 transition-all duration-500 ${navSurfaceClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="flex flex-col leading-none text-left">
                <span
                  className={`font-extrabold text-lg md:text-xl transition-colors duration-300 ${
                    isHeroNav ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  GNDEC
                </span>
                <span
                  className={`font-semibold text-[9px] sm:text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                    isHeroNav ? 'text-blue-200/80' : 'text-blue-600/70'
                  }`}
                >
                  Grievance Redressal Portal
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className={`px-4 py-2 mx-1 rounded-full text-sm font-medium flex items-center transition-all duration-300 ${
                    active
                      ? isHeroNav
                        ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                        : 'bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm'
                      : isHeroNav
                        ? 'text-gray-200 hover:bg-white/5 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.icon && (
                    <link.icon
                      className={`w-4 h-4 mr-1.5 ${
                        active
                          ? isHeroNav
                            ? 'text-blue-300'
                            : 'text-blue-500'
                          : isHeroNav
                            ? 'text-gray-300'
                            : 'text-slate-400'
                      }`}
                    />
                  )}
                  {link.name}
                </button>
              );
            })}

            <button
              onClick={handleDevelopersNavigation}
              title="Developers"
              className={`px-3 py-3 mx-1 rounded-full flex items-center justify-center transition-all duration-300 ${
                isHeroNav
                  ? 'text-gray-200 hover:bg-white/5 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>

            {user ? (
              <div className="relative ml-4" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className={`flex items-center space-x-1.5 text-sm px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    isHeroNav
                      ? 'text-white bg-white/15 hover:bg-white/20 border border-white/15'
                      : 'text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.name || user.user_id}</span>
                </button>

                <div
                  className={`absolute right-0 mt-2.5 w-52 rounded-xl shadow-2xl py-1.5 border backdrop-blur-xl ring-1 ring-black/5 ${
                    isUserMenuOpen ? 'block' : 'hidden'
                  } ${
                    isHeroNav
                      ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                      : 'bg-white/95 border-slate-200/60 text-slate-800'
                  }`}
                  role="menu"
                >
                  <div
                    className={`px-4 py-2.5 text-sm border-b ${
                      isHeroNav ? 'border-slate-800' : 'border-slate-100'
                    }`}
                  >
                    <p className="font-bold truncate">{user.name || user.user_id}</p>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        isHeroNav ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigation(dashboardPath)}
                    role="menuitem"
                    className={`flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors duration-150 ${
                      isHeroNav
                        ? 'hover:bg-white/5 text-slate-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2.5 text-blue-500" />
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className={`flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors duration-150 border-t ${
                      isHeroNav
                        ? 'border-slate-800 hover:bg-red-500/10 text-red-400'
                        : 'border-slate-100 hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <LogOut className="w-4 h-4 mr-2.5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('/login')}
                className={`ml-4 text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 shadow-md transform hover:-translate-y-0.5 ${
                  isHeroNav
                    ? 'bg-white hover:bg-slate-100 text-slate-900 shadow-white/10'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10'
                }`}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-colors focus:outline-none ${
                isHeroNav
                  ? 'text-gray-200 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div
          className={`px-3 pt-2 pb-4 space-y-1.5 border-t ${
            isHeroNav
              ? 'bg-black/95 backdrop-blur-xl border-white/5'
              : 'bg-white/95 backdrop-blur-xl border-slate-100 shadow-lg'
          }`}
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.path)}
                className={`flex items-center px-4 py-2.5 rounded-lg text-base font-semibold w-full text-left transition-all duration-200 ${
                  active
                    ? isHeroNav
                      ? 'bg-white/15 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isHeroNav
                      ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.icon && (
                  <link.icon
                    className={`w-5 h-5 mr-3 ${
                      active
                        ? isHeroNav
                          ? 'text-blue-300'
                          : 'text-blue-500'
                        : ''
                    }`}
                  />
                )}
                {link.name}
              </button>
            );
          })}

          <button
            onClick={handleDevelopersNavigation}
            className={`flex items-center px-4 py-2.5 rounded-lg text-base font-semibold w-full text-left transition-all duration-200 ${
              isHeroNav
                ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Code className="w-5 h-5 mr-3" />
            Developers
          </button>

          {user ? (
            <div
              className={`pt-4 mt-4 border-t ${
                isHeroNav ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center px-4 mb-3">
                <div className="flex-shrink-0">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      isHeroNav ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {(user.name || user.user_id || '?').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div
                    className={`text-base font-bold ${
                      isHeroNav ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {user.name || user.user_id}
                  </div>
                  <div
                    className={`text-sm ${isHeroNav ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => handleNavigation(dashboardPath)}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-base font-semibold w-full text-left transition-all ${
                    isHeroNav
                      ? 'bg-white/10 hover:bg-white/15 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 mr-3 text-blue-500" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-2.5 rounded-lg text-base font-semibold text-left transition-all border ${
                    isHeroNav
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100/55'
                  }`}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation('/login')}
              className={`block w-full text-center mt-4 px-4 py-3 font-semibold rounded-lg shadow-md transition-all ${
                isHeroNav
                  ? 'bg-white hover:bg-slate-100 text-slate-900'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
