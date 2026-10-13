import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, Home } from 'lucide-react';
import { logoutAdmin } from '../../../services/admin/adminAuthService.js';
import NotificationDropdown from '../ui/NotificationDropdown.jsx';
import { mockNotifications } from '../../../data/mockAdminData.js';

export default function AdminTopBar({ currentUser, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // Generate breadcrumb from current path
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1) return null; // Just /admin
    
    const breadcrumbs = [];
    breadcrumbs.push({ label: 'Dashboard', path: '/admin' });
    
    const pageMap = {
      'users': 'Users & Roles',
      'institutions': 'Institutions',
      'categories': 'Problem Categories',
      'service-areas': 'Service Areas',
      'routing-rules': 'Routing Rules',
      'fallback-queue': 'Fallback Queue',
      'reports': 'Reports & Monitoring',
      'settings': 'System Settings',
      'profile': 'Profile',
      'audit-log': 'Audit Log',
    };
    
    if (pathSegments[1] && pageMap[pathSegments[1]]) {
      breadcrumbs.push({ label: pageMap[pathSegments[1]], path: location.pathname });
    }
    
    return breadcrumbs;
  };

  const breadcrumb = getBreadcrumb();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && showProfileMenu) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProfileMenu]);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logoutAdmin();
    navigate('/admin/login');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate('/admin/profile');
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    navigate('/admin/settings');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Page title and breadcrumb */}
      <div>
        {breadcrumb && breadcrumb.length > 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            {breadcrumb.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index === 0 && <Home className="w-3.5 h-3.5" />}
                <button
                  onClick={() => navigate(crumb.path)}
                  className={`hover:text-[#1a6b3c] transition-colors ${
                    index === breadcrumb.length - 1 ? 'font-medium text-gray-900' : ''
                  }`}
                >
                  {crumb.label}
                </button>
                {index < breadcrumb.length - 1 && <span className="text-gray-400">/</span>}
              </div>
            ))}
          </div>
        ) : null}
        <h1 className="text-xl font-bold text-gray-900">{pageTitle || 'Dashboard'}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown notifications={mockNotifications} />

        {/* User profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30"
            aria-expanded={showProfileMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-[#1a6b3c] text-white flex items-center justify-center font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showProfileMenu && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">{currentUser?.email || 'admin@furko.local'}</p>
              </div>

              <button 
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                role="menuitem"
              >
                <User className="w-4 h-4" />
                Profile
              </button>

              <button 
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                role="menuitem"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
