import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { logout as authLogout } from '../../services/authService.js';
import {
  Building2,
  Bell,
  ChevronDown,
  FileText,
  RotateCw,
  Forward,
  CircleCheck
} from 'lucide-react';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const NOTIF_ICON_COLOR = {
  new_report:    'bg-red-100 text-red-600',
  status_update: 'bg-orange-100 text-orange-600',
  redirect:      'bg-yellow-100 text-yellow-700',
  resolved:      'bg-green-100 text-green-700',
};

export default function TopBar({ pageTitle }) {
  const { currentUser, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, logout } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))   setUserOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await authLogout();
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      {/* Left: institution + page */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
          <Building2 className="w-5 h-5 text-[#1a6b3c]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-none">
            {currentUser?.institution || 'Institution'}
          </p>
          <p className="text-xs text-gray-400">
            {currentUser?.institutionType || 'Government Institution'}
          </p>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-4">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#1a6b3c] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.reportId) navigate(`/reports/${n.reportId}`);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-green-50/40' : ''}`}
                    >
                      <span className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${NOTIF_ICON_COLOR[n.type] || 'bg-gray-100 text-gray-500'}`}>
                        {n.type === 'new_report'    && <FileText className="w-4 h-4" />}
                        {n.type === 'status_update' && <RotateCw className="w-4 h-4" />}
                        {n.type === 'redirect'      && <Forward className="w-4 h-4" />}
                        {n.type === 'resolved'      && <CircleCheck className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.time)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#1a6b3c] text-white text-xs font-bold flex items-center justify-center">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-400">{currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1">
              <button
                onClick={() => { navigate('/settings'); setUserOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Profile & Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
