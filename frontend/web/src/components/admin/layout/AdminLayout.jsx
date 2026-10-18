import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopBar from './AdminTopBar.jsx';
import ToastContainer from '../ui/ToastContainer.jsx';
import { getStoredAdminUser } from '../../../services/admin/adminAuthService.js';
import { mockFallbackQueue } from '../../../data/mockAdminData.js';

const PAGE_TITLES = {
  '/admin': 'Dashboard Overview',
  '/admin/profile': 'Administrator Profile',
  '/admin/users': 'Users & Roles Management',
  '/admin/institutions': 'Institutions Management',
  '/admin/categories': 'Problem Categories',
  '/admin/service-areas': 'Service Areas Management',
  '/admin/routing-rules': 'Routing Rules',
  '/admin/fallback-queue': 'Fallback Review Queue',
  '/admin/reports': 'Reports & Monitoring',
  '/admin/settings': 'System Settings',
  '/admin/audit-log': 'Audit Log',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const user = getStoredAdminUser();
    setCurrentUser(user);
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin Panel';
  const fallbackCount = mockFallbackQueue.filter((q) => q.reviewStatus === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        fallbackCount={fallbackCount}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopBar currentUser={currentUser} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
