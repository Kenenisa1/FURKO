import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App.jsx';
import AdminApp from './AdminApp.jsx';

/**
 * Router component that switches between Admin and Institution apps
 */
function AppRouter() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  
  return isAdminPath ? <AdminApp /> : <App />;
}

/**
 * Root application router
 * Routes /admin/* to AdminApp and everything else to institution App
 */
export default function RootApp() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
