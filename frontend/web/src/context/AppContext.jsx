// ──────────────────────────────────────────────
// FURKO — Global App Context
// Manages: currentUser, reports, notifications,
//          loading states, toast messages
// ──────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStoredUser } from '../services/authService.js';
import { getReports } from '../services/reportService.js';
import { mockNotifications } from '../data/mockNotifications.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Toast queue: [{ id, type, message }]
  const [toasts, setToasts] = useState([]);

  // ── Reports ────────────────────────────────
  const refreshReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const data = await getReports();
      setReports(data);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) refreshReports();
  }, [currentUser, refreshReports]);

  const updateReportInState = useCallback((updatedReport) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    );
  }, []);

  // ── Notifications ──────────────────────────
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { ...notification, id: `NOTIF-${Date.now()}`, read: false, time: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  // ── Toasts ─────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Auth ───────────────────────────────────
  const login = useCallback((user) => {
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setReports([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        reports,
        reportsLoading,
        refreshReports,
        updateReportInState,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
