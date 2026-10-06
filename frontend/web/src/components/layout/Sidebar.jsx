import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { REPORT_STATUS } from '../../data/mockReports.js';

// ── Icons ──────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── Nav item ───────────────────────────────────
function NavItem({ to, icon, label, badge, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-white/20 text-white font-semibold'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

// ── Section label ──────────────────────────────
function SectionLabel({ label }) {
  return (
    <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold px-3 mt-5 mb-1">
      {label}
    </p>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { reports, currentUser } = useApp();
  const [reportsOpen, setReportsOpen] = useState(true);
  const location = useLocation();

  const count = (status) => reports.filter((r) => r.status === status).length;
  const newCount = count(REPORT_STATUS.NEW);
  const inboxCount = reports.filter(
    (r) => r.status === REPORT_STATUS.NEW || r.status === REPORT_STATUS.UNDER_REVIEW
  ).length;

  return (
    <aside
      className={`flex flex-col bg-[#1a5c35] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } min-h-screen flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-white font-black text-xl tracking-tight leading-none">FURKO</span>
            <span className="text-white/50 text-[9px] tracking-widest uppercase">Report · Track · Resolve</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {/* Dashboard */}
        <NavItem
          to="/dashboard"
          end
          icon={<Icon d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9" />}
          label={collapsed ? '' : 'Dashboard'}
        />

        {/* Reports section */}
        {!collapsed && (
          <>
            <SectionLabel label="Reports" />
            <button
              onClick={() => setReportsOpen((o) => !o)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/75 hover:bg-white/10 hover:text-white w-full transition-colors"
            >
              <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              <span className="flex-1 text-left font-medium">Reports</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${reportsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {reportsOpen && (
              <div className="ml-3 space-y-0.5 border-l border-white/10 pl-3">
                <NavItem
                  to="/reports/inbox"
                  icon={<Icon d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" size={16} />}
                  label="Inbox"
                  badge={inboxCount}
                />
                <NavItem
                  to="/reports"
                  end
                  icon={<Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" size={16} />}
                  label="All Reports"
                />
                <NavItem
                  to="/reports?status=new"
                  icon={<Icon d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />}
                  label="New"
                  badge={newCount}
                />
                <NavItem
                  to="/reports?status=under-review"
                  icon={<Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={16} />}
                  label="Under Review"
                  badge={count(REPORT_STATUS.UNDER_REVIEW)}
                />
                <NavItem
                  to="/reports?status=in-progress"
                  icon={<Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />}
                  label="In Progress"
                  badge={count(REPORT_STATUS.IN_PROGRESS)}
                />
                <NavItem
                  to="/reports?status=resolved"
                  icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />}
                  label="Resolved"
                  badge={count(REPORT_STATUS.RESOLVED)}
                />
              </div>
            )}
          </>
        )}

        {/* Organizations */}
        {!collapsed && <SectionLabel label="Organization" />}
        <NavItem
          to="/profile"
          icon={<Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 16h6" />}
          label={collapsed ? '' : 'Institution Profile'}
        />
        <NavItem
          to="/staff"
          icon={<Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
          label={collapsed ? '' : 'Staff'}
        />
        <NavItem
          to="/settings"
          icon={<Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
          label={collapsed ? '' : 'Settings'}
        />

        {/* Support */}
        {!collapsed && <SectionLabel label="Support" />}
        <NavItem
          to="/support"
          icon={<Icon d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />}
          label={collapsed ? '' : 'Support'}
        />
      </nav>

      {/* Current user footer */}
      {currentUser && (
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{currentUser.name}</p>
                <p className="text-white/50 text-[10px] truncate">{currentUser.role}</p>
                <p className="text-white/40 text-[10px] truncate">{currentUser.institution}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
