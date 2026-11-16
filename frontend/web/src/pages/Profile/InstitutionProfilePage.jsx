import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { getProfile, updateProfile, createBranch } from '../../services/reportService.js';
import { useApp } from '../../context/AppContext.jsx';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  GitBranch,
  Edit3,
  RefreshCw,
  ShieldCheck,
  Plus,
  Activity,
  TrendingUp,
  Loader2,
  ChevronRight,
  ExternalLink,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export default function InstitutionProfilePage() {
  const { showToast, currentUser } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addBranchModalOpen, setAddBranchModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);

  // Edit profile form
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  });

  // New branch form
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    contact_phone: '',
  });

  useEffect(() => {
    loadProfile(selectedInstId);
  }, [selectedInstId]);

  async function loadProfile(instId = null) {
    if (!profile) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getProfile(instId || null);
      setProfile(data);
      if (data) {
        setEditForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          description: data.description || '',
        });
        if (!selectedInstId && data.id) {
          setSelectedInstId(data.id);
        }
      }
    } catch (err) {
      console.error('Failed to load institution profile:', err);
      showToast(err.message || 'Failed to load institution profile', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(
        {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          description: editForm.description,
        },
        profile?.id
      );
      showToast('Institution details updated successfully.', 'success');
      setEditModalOpen(false);
      loadProfile(profile?.id);
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.code) {
      showToast('Branch name and unique code are required.', 'error');
      return;
    }
    setSavingBranch(true);
    try {
      await createBranch({
        ...branchForm,
        institution_id: profile?.id,
      });
      showToast('New operational branch created successfully.', 'success');
      setAddBranchModalOpen(false);
      setBranchForm({ name: '', code: '', address: '', contact_phone: '' });
      loadProfile(profile?.id);
    } catch (err) {
      showToast(err.message || 'Failed to create branch.', 'error');
    } finally {
      setSavingBranch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner message="Loading institution operations & profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Institution Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Unable to retrieve institution operational metadata.</p>
        <button
          onClick={() => loadProfile()}
          className="px-4 py-2 bg-[#008744] text-white rounded-lg text-sm font-semibold hover:bg-[#007038] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const branches = profile.branches || [];
  const categories = profile.categoriesDetails || [];
  const staff = profile.staffRoster || [];
  const availableInstitutions = profile.availableInstitutions || [];
  const isCentralAdmin = currentUser?.role === 'admin' || profile.isSystemAdminView;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Institution Operations & Profile' },
        ]}
      />

      {/* ── Top Hero Banner ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-6">
        {/* Accent Bar */}
        <div className="h-3 bg-gradient-to-r from-[#008744] via-[#1E6FE0] to-[#008744]" />

        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Identity */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF5EE] border border-[#008744]/20 flex items-center justify-center flex-shrink-0 text-[#008744] shadow-sm">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1E6FE0]/10 text-[#1E6FE0] border border-[#1E6FE0]/20">
                    {profile.code}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                  {profile.description}
                </p>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#008744]" />
                    {profile.address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1E6FE0]" />
                    {profile.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Bureau Switcher for Central Admin */}
              {isCentralAdmin && availableInstitutions.length > 0 && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bureau:</span>
                  <select
                    value={profile.id}
                    onChange={(e) => setSelectedInstId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                  >
                    {availableInstitutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.code} — {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008744] hover:bg-[#007038] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>

              <button
                onClick={() => loadProfile(profile.id)}
                disabled={refreshing}
                title="Refresh real-time data"
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#008744]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Modern Navigation Tabs ── */}
        <div className="flex items-center gap-2 px-6 border-t border-gray-100 bg-gray-50/50 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Activity },
            { id: 'branches', label: 'Field Branches & Units', icon: GitBranch, badge: branches.length },
            { id: 'categories', label: 'Handled Categories', icon: Layers, badge: categories.length },
            { id: 'staff', label: 'Staff Roster', icon: Users, badge: staff.length },
            { id: 'settings', label: 'Jurisdiction & Contacts', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-[#008744] text-[#008744] bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#008744]' : 'text-gray-400'}`} />
                {tab.label}
                {tab.badge != null && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold leading-none ${
                      isActive
                        ? 'bg-[#EBF5EE] text-[#008744]'
                        : 'bg-gray-200/80 text-gray-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Reports */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Dispatched
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EBF5EE] text-[#008744] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{profile.totalReports}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>All time public requests</span>
                <Link to="/reports" className="text-[#1E6FE0] font-semibold hover:underline flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Active In-Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Active in Field
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E6FE0] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{profile.inProgressReports}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{profile.reviewAwaitingReports} pending completion review</span>
                <Link to="/reports?status=in-progress" className="text-[#1E6FE0] font-semibold hover:underline flex items-center gap-0.5">
                  Queue <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resolved Issues
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{profile.resolvedReports}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>Verified citizen closures</span>
                <Link to="/reports?status=resolved" className="text-[#008744] font-semibold hover:underline flex items-center gap-0.5">
                  History <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Resolution SLA
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-extrabold text-gray-900">{profile.resolutionRate}%</p>
                <span className="text-xs font-medium text-gray-500">Avg {profile.avgResolutionTime}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-[#008744] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(profile.resolutionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Mandate & Jurisdiction */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#008744]" />
                  Public Mandate & Operational Scope
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.description} The bureau operates under the authority of Jimma City Administration to ensure dependable civic infrastructure, timely dispatch of technical maintenance squads, and transparent citizen feedback resolution.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <MapPin className="w-5 h-5 text-[#008744]" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Service Jurisdiction</p>
                      <p className="text-sm font-bold text-gray-900">{profile.serviceArea}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Calendar className="w-5 h-5 text-[#1E6FE0]" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Operational Established</p>
                      <p className="text-sm font-bold text-gray-900">{profile.established} (Civil Charter)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handled Domains Snapshot */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#1E6FE0]" />
                    Routed Civic Problem Domains
                  </h3>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-bold text-[#1E6FE0] hover:underline"
                  >
                    View Routing Rules →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(profile.responsibleCategories || []).map((catName) => (
                    <span
                      key={catName}
                      className="px-3 py-1.5 bg-[#EBF5EE] text-[#008744] text-xs font-bold rounded-xl border border-[#008744]/20 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#008744]" />
                      {catName}
                    </span>
                  ))}
                  {(!profile.responsibleCategories || profile.responsibleCategories.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No specific categories bound to routing rules.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Official Contacts & Emergency Desk */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#008744]" />
                  Official Communications Desk
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Official Bureau Email</p>
                      <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-gray-900 hover:text-[#008744]">
                        {profile.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Field Dispatch Hotline</p>
                      <a href={`tel:${profile.phone}`} className="text-sm font-semibold text-gray-900 hover:text-[#008744]">
                        {profile.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Government Web Portal</p>
                      <span className="text-sm font-semibold text-[#1E6FE0] flex items-center gap-1">
                        {profile.website}
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Headquarters</p>
                      <p className="text-xs font-semibold text-gray-700 leading-relaxed">{profile.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Status Card */}
              <div className="bg-gradient-to-br from-[#008744]/10 to-[#1E6FE0]/10 border border-[#008744]/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Dispatch Engine Status
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Direct routing rules actively triage public mobile reports to this bureau’s field maintenance units.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONAL BRANCHES */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Operational Branches & Maintenance Units</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Physical depots, field stations, and branch offices responsible for direct municipal maintenance.
              </p>
            </div>
            <button
              onClick={() => setAddBranchModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#008744] hover:bg-[#007038] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] text-[#008744] flex items-center justify-center font-bold">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                      {b.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-snug">{b.name}</h3>
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#008744] flex-shrink-0 mt-0.5" />
                      <span>{b.address || 'Jimma City Depot'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1E6FE0] flex-shrink-0" />
                      <span>{b.contact_phone || 'Direct line pending'}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {b.staffCount || 0} Staff
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1E6FE0]">
                    {b.activeReportsCount || 0} Active Reports
                  </span>
                </div>
              </div>
            ))}

            {branches.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <GitBranch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No branches registered for this institution yet.</p>
                <p className="text-xs text-gray-500 mt-1">Create operational maintenance branches to distribute city-wide task dispatching.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HANDLED CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Routed Civic Problem Categories</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Categories assigned to this bureau via the spatial routing engine polygon rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-[#008744]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      cat.default_priority === 'urgent'
                        ? 'bg-red-100 text-red-700'
                        : cat.default_priority === 'high'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {cat.default_priority || 'Standard'} Priority
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#008744]" />
                    {cat.jurisdiction_name || 'Jimma City Perimeter'}
                  </span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Auto Routing Active
                  </span>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No active category routing rules bound to this bureau.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF ROSTER */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personnel & Field Staff Roster</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Staff members and field officers registered under {profile.name}.
              </p>
            </div>
            <Link
              to="/staff"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E6FE0] hover:bg-[#1754AB] text-white text-xs font-bold rounded-xl transition-all"
            >
              Manage Users & RBAC →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5">Staff Name</th>
                    <th className="px-5 py-3.5">Assigned Branch</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Contact Email</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/75 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EBF5EE] text-[#008744] font-bold flex items-center justify-center text-xs">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        {u.full_name}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.branch_name ? (
                          <span className="font-medium text-gray-800">{u.branch_name}</span>
                        ) : (
                          <span className="text-gray-400 italic">Headquarters</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'institution_super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'branch_manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role?.replace(/_/g, ' ') || 'Staff'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{u.email}</td>
                      <td className="px-5 py-3.5 text-gray-700">{u.phone_number || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400 italic">
                        No active staff records mapped to this bureau yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: JURISDICTION & CONTACTS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Bureau Jurisdiction & Communications Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and update the official identity details, field dispatch contacts, and public coverage bounds.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Official Bureau Title
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Hotline Phone
                </label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Public Mandate / Description
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008744] hover:bg-[#007038] text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Bureau Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL: EDIT BUREAU DETAILS ── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Bureau Operational Metadata"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bureau Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Official Email</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Dispatch Phone</label>
            <input
              type="text"
              required
              value={editForm.phone}
              onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 bg-[#008744] hover:bg-[#007038] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ADD BRANCH ── */}
      <Modal
        isOpen={addBranchModalOpen}
        onClose={() => setAddBranchModalOpen(false)}
        title="Register Operational Branch Unit"
      >
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Branch Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Higher Education & Ginjo Unit"
              value={branchForm.name}
              onChange={(e) => setBranchForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Branch Code (Unique)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ROAD-GINJO"
              value={branchForm.code}
              onChange={(e) => setBranchForm((p) => ({ ...p, code: e.target.value.toUpperCase().replace(/\s+/g, '-') }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Depot Address / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Ginjo Guduru Way, Kebele 07"
              value={branchForm.address}
              onChange={(e) => setBranchForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Direct Contact Phone
            </label>
            <input
              type="text"
              placeholder="+251 47 111 2234"
              value={branchForm.contact_phone}
              onChange={(e) => setBranchForm((p) => ({ ...p, contact_phone: e.target.value }))}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008744]/30 focus:border-[#008744]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddBranchModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingBranch}
              className="px-5 py-2 bg-[#008744] hover:bg-[#007038] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingBranch && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
