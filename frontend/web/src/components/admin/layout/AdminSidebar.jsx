import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  GitBranch,
  Inbox,
  FileText,
  Settings,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import furkoLogo from '../../../assets/furko-logo.jpg';

function NavItem({ to, icon, label, badge, collapsed, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-white/20 text-white font-semibold'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`
      }
      title={collapsed ? label : ''}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) return null;
  return (
    <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold px-3 mt-5 mb-1.5">
      {label}
    </p>
  );
}

export default function AdminSidebar({ collapsed, onToggle, fallbackCount = 0 }) {
  return (
    <aside
      className={`flex flex-col bg-[#1a5c35] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen flex-shrink-0`}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={furkoLogo} alt="FURKO" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">FURKO</span>
              <span className="text-white/60 text-[10px] uppercase tracking-wider">Admin</span>
            </div>
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
        <NavItem
          to="/admin"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Overview"
          collapsed={collapsed}
          end
        />

        <SectionLabel label="Management" collapsed={collapsed} />
        <NavItem
          to="/admin/users"
          icon={<Users className="w-5 h-5" />}
          label="Users & Roles"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/institutions"
          icon={<Building2 className="w-5 h-5" />}
          label="Institutions"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/categories"
          icon={<FolderTree className="w-5 h-5" />}
          label="Problem Categories"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/service-areas"
          icon={<MapPin className="w-5 h-5" />}
          label="Service Areas"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/routing-rules"
          icon={<GitBranch className="w-5 h-5" />}
          label="Routing Rules"
          collapsed={collapsed}
        />

        <SectionLabel label="Operations" collapsed={collapsed} />
        <NavItem
          to="/admin/fallback-queue"
          icon={<Inbox className="w-5 h-5" />}
          label="Fallback Review Queue"
          badge={fallbackCount}
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/reports"
          icon={<FileText className="w-5 h-5" />}
          label="Reports & Monitoring"
          collapsed={collapsed}
        />

        <SectionLabel label="System" collapsed={collapsed} />
        <NavItem
          to="/admin/settings"
          icon={<Settings className="w-5 h-5" />}
          label="System Settings"
          collapsed={collapsed}
        />
        <NavItem
          to="/admin/audit-log"
          icon={<FileSearch className="w-5 h-5" />}
          label="Audit Log"
          collapsed={collapsed}
        />
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Admin User</p>
              <p className="text-white/50 text-[10px] truncate">System Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
