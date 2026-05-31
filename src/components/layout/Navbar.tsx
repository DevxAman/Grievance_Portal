import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, FileText, Search, HelpCircle, Mail, Home, LayoutDashboard, Code, ShieldAlert } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Function to handle navigation with scroll to top
  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    // Only show Dashboard if user is authenticated
    ...(user ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(user?.role !== 'admin' ? [{ name: 'File Grievance', path: '/file-grievance', icon: FileText }] : []),
    { name: 'Track Grievance', path: '/track-grievance', icon: Search },
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { name: 'Contact', path: '/contact', icon: Mail },
    // Developers page removed from main nav
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determine if a link should get special styling - now includes Home and Dashboard
  const isSpecialLink = (name: string) => {
    return ['Home', 'Dashboard', 'File Grievance', 'Track Grievance', 'How It Works', 'Contact'].includes(name);
  };

  // Handle dashboard navigation when clicking on username
  const handleDashboardNavigation = () => {
    navigate('/dashboard');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle admin dashboard navigation
  const handleAdminDashboardNavigation = () => {
    navigate('/admin/dashboard');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle developers page navigation
  const handleDevelopersNavigation = () => {
    navigate('/developers');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle logout with proper navigation
  const handleLogout = () => {
    logout();
    navigate('/');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-black/70 backdrop-blur-xl shadow-lg border-b border-gray-700/50'
          : 'bg-black/30 backdrop-blur-md'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center group focus:outline-none"
            >
              <span className="text-white font-bold text-xl md:text-2xl mr-1.5">GNDEC</span>
              <span className="text-gray-300 font-medium md:text-xl">Portal</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-400 group-hover:w-full transition-all duration-300"></span>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.path)}
                className={`px-4 py-2 mx-1 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ${isActive(link.path)
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-200 hover:bg-gray-700/50 hover:text-white'
                  }`}
              >
                {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                {link.name}
              </button>
            ))}

            {/* Developer icon */}
            <button
              onClick={handleDevelopersNavigation}
              title="Developers"
              className="px-3 py-2 mx-1 rounded-full text-gray-200 hover:bg-gray-700/50 hover:text-white transition-colors duration-200"
            >
              <Code className="w-5 h-5" />
            </button>

            {/* Admin Dashboard button for admin users only */}
            {user && user.role === 'admin' && (
              <button
                onClick={handleAdminDashboardNavigation}
                className={`px-4 py-2 mx-1 rounded-md text-sm font-medium flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 ${isActive('/admin/dashboard') ? 'bg-blue-700' : ''
                  }`}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Admin
              </button>
            )}

            {user ? (
              <div className="relative ml-4 group">
                <button
                  onClick={handleDashboardNavigation}
                  className="flex items-center space-x-1 text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full transition-colors duration-200"
                >
                  <User className="w-4 h-4 mr-1" />
                  <span className="max-w-[120px] truncate">{user.name || user.user_id}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white/95 backdrop-blur-md ring-1 ring-black/5 hidden group-hover:block transition-all duration-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user.name || user.user_id}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={handleAdminDashboardNavigation}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <ShieldAlert className="w-4 h-4 mr-2" /> Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('/login')}
                className="ml-4 text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-black/80 backdrop-blur-lg">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavigation(link.path)}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium w-full text-left ${isActive(link.path)
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
            >
              {link.icon && <link.icon className="w-5 h-5 mr-2" />}
              {link.name}
            </button>
          ))}

          {/* Developer link for mobile */}
          <button
            onClick={handleDevelopersNavigation}
            className="flex items-center px-3 py-2 rounded-md text-base font-medium w-full text-left text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            <Code className="w-5 h-5 mr-2" />
            Developers
          </button>

          {/* Admin Dashboard button for admin users only (mobile) */}
          {user && user.role === 'admin' && (
            <button
              onClick={handleAdminDashboardNavigation}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium w-full text-left bg-blue-600 hover:bg-blue-700 text-white ${isActive('/admin/dashboard') ? 'bg-blue-700' : ''
                }`}
            >
              <ShieldAlert className="w-5 h-5 mr-2" />
              Admin Dashboard
            </button>
          )}

          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white font-medium">{(user.name || user.user_id || '?').charAt(0)}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.name || user.user_id}</div>
                  <div className="text-sm font-medium text-gray-300">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-gray-700 hover:bg-gray-600 w-full text-left"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Dashboard
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={handleAdminDashboardNavigation}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 w-full text-left"
                  >
                    <ShieldAlert className="w-5 h-5 mr-2" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-gray-700 hover:bg-gray-600 text-left"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation('/login')}
              className="block w-full text-center mt-4 px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md"
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