import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { getStoredAdminUser } from './services/admin/adminAuthService.js';

// Institution Layout & Pages
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import ReportsPage from './pages/Reports/ReportsPage.jsx';
import InboxPage from './pages/Reports/InboxPage.jsx';
import ReportDetailsPage from './pages/Reports/ReportDetailsPage.jsx';
import InstitutionProfilePage from './pages/Profile/InstitutionProfilePage.jsx';
import StaffPage from './pages/Staff/StaffPage.jsx';
import SettingsPage from './pages/Settings/SettingsPage.jsx';
import SupportPage from './pages/Support/SupportPage.jsx';

// Admin Layout & Pages
import AdminLayout from './components/admin/layout/AdminLayout.jsx';
import AdminLoginPage from './pages/Admin/Login/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/Admin/Dashboard/AdminDashboardPage.jsx';
import UsersPage from './pages/Admin/Users/UsersPage.jsx';
import InstitutionsPage from './pages/Admin/Institutions/InstitutionsPage.jsx';
import CategoriesPage from './pages/Admin/Categories/CategoriesPage.jsx';
import RoutingRulesPage from './pages/Admin/RoutingRules/RoutingRulesPage.jsx';
import FallbackQueuePage from './pages/Admin/FallbackQueue/FallbackQueuePage.jsx';
import AdminReportsPage from './pages/Admin/Reports/AdminReportsPage.jsx';
import SystemSettingsPage from './pages/Admin/Settings/SystemSettingsPage.jsx';
import AuditLogPage from './pages/Admin/AuditLog/AuditLogPage.jsx';
import ServiceAreasPage from './pages/Admin/ServiceAreas/ServiceAreasPage.jsx';
import AdminProfilePage from './pages/Admin/Profile/AdminProfilePage.jsx';

// Institution Protected Route
function RequireAuth({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

// Admin Protected Route
function RequireAdminAuth({ children }) {
  const adminUser = getStoredAdminUser();
  if (!adminUser) return <Navigate to="/admin/login" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();
  const adminUser = getStoredAdminUser();

  return (
    <Routes>
      {/* ============================================ */}
      {/* ADMIN ROUTES */}
      {/* ============================================ */}
      
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
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="service-areas" element={<ServiceAreasPage />} />
        <Route path="routing-rules" element={<RoutingRulesPage />} />
        <Route path="fallback-queue" element={<FallbackQueuePage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
      </Route>

      {/* ============================================ */}
      {/* INSTITUTION ROUTES (Original) */}
      {/* ============================================ */}
      
      {/* Institution Login */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected Institution Routes */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/inbox" element={<InboxPage />} />
        <Route path="reports/:id" element={<ReportDetailsPage />} />
        <Route path="profile" element={<InstitutionProfilePage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="support" element={<SupportPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function RootApp() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
