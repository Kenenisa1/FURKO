import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { REPORT_STATUS } from '../../data/mockReports.js';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Files,
  FilePlus,
  Eye,
  Clock3,
  CircleCheck,
  Building2,
  Users,
  Settings,
  CircleHelp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import furkoLogo from '../../assets/furko-logo.jpg';

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
          <div className="flex items-center gap-3">
            <img 
              src={furkoLogo} 
              alt="FURKO" 
              className="h-10 w-auto object-contain"
            />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {/* Dashboard */}
        <NavItem
          to="/dashboard"
          end
          icon={<LayoutDashboard className="w-5 h-5" />}
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
              <FileText className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">Reports</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${reportsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {reportsOpen && (
              <div className="ml-3 space-y-0.5 border-l border-white/10 pl-3">
                <NavItem
                  to="/reports/inbox"
                  icon={<Inbox className="w-4 h-4" />}
                  label="Inbox"
                  badge={inboxCount}
                />
                <NavItem
                  to="/reports"
                  end
                  icon={<Files className="w-4 h-4" />}
                  label="All Reports"
                />
                <NavItem
                  to="/reports?status=new"
                  icon={<FilePlus className="w-4 h-4" />}
                  label="New"
                  badge={newCount}
                />
                <NavItem
                  to="/reports?status=under-review"
                  icon={<Eye className="w-4 h-4" />}
                  label="Under Review"
                  badge={count(REPORT_STATUS.UNDER_REVIEW)}
                />
                <NavItem
                  to="/reports?status=in-progress"
                  icon={<Clock3 className="w-4 h-4" />}
                  label="In Progress"
                  badge={count(REPORT_STATUS.IN_PROGRESS)}
                />
                <NavItem
                  to="/reports?status=resolved"
                  icon={<CircleCheck className="w-4 h-4" />}
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
          icon={<Building2 className="w-5 h-5" />}
          label={collapsed ? '' : 'Institution Profile'}
        />
        <NavItem
          to="/staff"
          icon={<Users className="w-5 h-5" />}
          label={collapsed ? '' : 'Staff'}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="w-5 h-5" />}
          label={collapsed ? '' : 'Settings'}
        />

        {/* Support */}
        {!collapsed && <SectionLabel label="Support" />}
        <NavItem
          to="/support"
          icon={<CircleHelp className="w-5 h-5" />}
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
