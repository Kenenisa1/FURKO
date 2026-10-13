import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getStoredAdminUser } from './services/admin/adminAuthService.js';

// Admin Layout
import AdminLayout from './components/admin/layout/AdminLayout.jsx';

// Admin Pages
import AdminLoginPage from './pages/Admin/Login/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/Admin/Dashboard/AdminDashboardPage.jsx';
import UsersPage from './pages/Admin/Users/UsersPage.jsx';
import InstitutionsPage from './pages/Admin/Institutions/InstitutionsPage.jsx';
import CategoriesPage from './pages/Admin/Categories/CategoriesPage.jsx';
import ServiceAreasPage from './pages/Admin/ServiceAreas/ServiceAreasPage.jsx';
import RoutingRulesPage from './pages/Admin/RoutingRules/RoutingRulesPage.jsx';
import FallbackQueuePage from './pages/Admin/FallbackQueue/FallbackQueuePage.jsx';
import AdminReportsPage from './pages/Admin/Reports/AdminReportsPage.jsx';
import SystemSettingsPage from './pages/Admin/Settings/SystemSettingsPage.jsx';
import AdminProfilePage from './pages/Admin/Profile/AdminProfilePage.jsx';
import AuditLogPage from './pages/Admin/AuditLog/AuditLogPage.jsx';

// Protected route wrapper for admin
function RequireAdminAuth({ children }) {
  const adminUser = getStoredAdminUser();
  if (!adminUser) return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminRoutes() {
  const adminUser = getStoredAdminUser();

  return (
    <Routes>
      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={adminUser ? <Navigate to="/admin" replace /> : <AdminLoginPage />}
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="routing-rules" element={<RoutingRulesPage />} />
        <Route path="fallback-queue" element={<FallbackQueuePage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
      </Route>

      {/* Redirect unknown admin routes */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  );
}
