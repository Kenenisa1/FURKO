import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';

// Layout
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Pages
import LoginPage           from './pages/Login/LoginPage.jsx';
import DashboardPage       from './pages/Dashboard/DashboardPage.jsx';
import ReportsPage         from './pages/Reports/ReportsPage.jsx';
import ReportDetailsPage   from './pages/Reports/ReportDetailsPage.jsx';
import InstitutionProfilePage from './pages/Profile/InstitutionProfilePage.jsx';
import StaffPage           from './pages/Staff/StaffPage.jsx';
import SettingsPage        from './pages/Settings/SettingsPage.jsx';
import SupportPage         from './pages/Support/SupportPage.jsx';

// Protected route wrapper
function RequireAuth({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected — all under DashboardLayout */}
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

        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/inbox" element={<DashboardPage />} />
        <Route path="reports/:id" element={<ReportDetailsPage />} />

        {/* Organization */}
        <Route path="profile"  element={<InstitutionProfilePage />} />
        <Route path="staff"    element={<StaffPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="support"  element={<SupportPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
