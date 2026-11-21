import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import {
  acceptReport, redirectReport, rejectReport, getReportById, getInstitutions,
} from '../../services/reportService.js';
import { REPORT_STATUS } from '../../services/reportService.js';
import { isInstitutionSuperAdmin, isInstitutionStaff } from '../../services/authService.js';

import StatusBadge from '../../components/ui/StatusBadge.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import PhotoGallery from '../../components/ui/PhotoGallery.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import AssignModal from './modals/AssignModal.jsx';
import ResolveModal from './modals/ResolveModal.jsx';
import SubmitCompletionModal from './modals/SubmitCompletionModal.jsx';
import ReviewCompletionModal from './modals/ReviewCompletionModal.jsx';
import TransferBranchModal from './modals/TransferBranchModal.jsx';

import {
  ArrowLeft,
  MapPin,
  Check,
  CircleCheck,
  Loader2,
  ExternalLink,
  Building2,
  UserCheck,
  SendHorizontal,
  ArrowRightLeft,
  ClipboardCheck,
} from 'lucide-react';

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TIMELINE_STAGES = ['Submitted', 'Under Review', 'Accepted', 'Assigned', 'In Progress', 'Submitted For Review', 'Resolved'];
const REJECTION_REASONS = ['Duplicate report', 'Insufficient information', 'Invalid report', 'Outside jurisdiction', 'Other'];

// ── Map placeholder with Google Maps Link ──────────────────────────────────
function MapPlaceholder({ location }) {
  const lat = location?.coordinates?.lat;
  const lng = location?.coordinates?.lng;
  const mapsUrl = (lat && lng) ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  return (
    <div className="w-full rounded-xl bg-[#e8f5ee] border border-[#1a6b3c]/20 relative overflow-hidden flex flex-col items-center justify-center p-6 min-h-[190px]">
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1a6b3c" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-[#1a6b3c] flex items-center justify-center shadow-lg mb-2 ring-4 ring-white">
          <MapPin className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 text-center shadow-sm border border-[#1a6b3c]/20 max-w-sm">
          <p className="text-xs font-bold text-[#1a6b3c]">{location?.kebele || location?.address || 'Jimma City'}</p>
          <p className="text-[11px] text-gray-500">{location?.address || location?.city}</p>
          {lat && lng && (
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
              {Number(lat).toFixed(5)}°N, {Number(lng).toFixed(5)}°E
            </p>
          )}
        </div>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1a6b3c] hover:bg-[#14532d] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Maps
          </a>
        )}
      </div>
    </div>
  );
}

// ── Activity Log ───────────────────────────────────────────────────────────
function ActivityLog({ activity }) {
  if (!activity || activity.length === 0) {
    return <p className="text-sm text-gray-400">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {activity.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-[#1a6b3c] mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800">{item.action}</p>
            <p className="text-xs text-gray-400">{formatDateTime(item.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, addNotification, updateReportInState, currentUser } = useApp();

  const [report, setReport] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal visibility
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showSubmitCompletionModal, setShowSubmitCompletionModal] = useState(false);
  const [showReviewCompletionModal, setShowReviewCompletionModal] = useState(false);
  const [showTransferBranchModal, setShowTransferBranchModal] = useState(false);

  // Forms
  const [redirectForm, setRedirectForm] = useState({ destination: '', reason: '' });
  const [rejectForm, setRejectForm] = useState({ reason: '', explanation: '' });

  function reloadReport() {
    return getReportById(id).then((r) => {
      setReport(r);
      updateReportInState(r);
    });
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([getReportById(id), getInstitutions()])
      .then(([r, insts]) => {
        setReport(r);
        setInstitutions(insts);
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading report..." />;
  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Report not found.</p>
        <button onClick={() => navigate('/reports')} className="mt-4 text-[#1a6b3c] hover:underline text-sm">
          ← Back to Reports
        </button>
      </div>
    );
  }

  // ── Action handlers ──────────────────────────────────────────────────────
  async function handleAccept() {
    setActionLoading(true);
    try {
      const updated = await acceptReport(id);
      setReport(updated);
      updateReportInState(updated);
      showToast('Report accepted and moved to Under Review.', 'success');
      addNotification({ type: 'status_update', title: 'Report Accepted', message: `Report ${id} has been accepted.`, reportId: id });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
      setShowAcceptModal(false);
    }
  }

  async function handleRedirect() {
    if (!redirectForm.destination || !redirectForm.reason.trim()) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    const dest = institutions.find((i) => i.id === redirectForm.destination);
    setActionLoading(true);
    try {
      const updated = await redirectReport(id, {
        destinationName: dest?.name || redirectForm.destination,
        destinationId: redirectForm.destination,
        reason: redirectForm.reason,
      });
      setReport(updated);
      updateReportInState(updated);
      showToast(`Report redirected to ${dest?.name || redirectForm.destination}.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
      setShowRedirectModal(false);
      setRedirectForm({ destination: '', reason: '' });
    }
  }

  async function handleReject() {
    if (!rejectForm.reason) {
      showToast('Please select a rejection reason.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await rejectReport(id, { reason: rejectForm.reason, explanation: rejectForm.explanation });
      setReport(updated);
      updateReportInState(updated);
      showToast('Report rejected.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
      setRejectForm({ reason: '', explanation: '' });
    }
  }

  // RBAC permissions check
  const isAdmin = isInstitutionSuperAdmin();
  const isStaff = isInstitutionStaff();
  const isAssignedToCurrentStaff = report.assigned_staff_id === currentUser?.id;

  const canAccept = isAdmin && [REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW].includes(report.status);
  const canAssign = isAdmin && [REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW, REPORT_STATUS.ACCEPTED, REPORT_STATUS.ASSIGNED, REPORT_STATUS.IN_PROGRESS].includes(report.status);
  const canTransferBranch = isAdmin && ![REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED].includes(report.status);
  const canSubmitCompletion = (isAssignedToCurrentStaff || isAdmin) && ['assigned', 'in_progress', 'under_review'].includes(report.status);
  const canReviewCompletion = isAdmin && report.status === 'submitted_for_review';
  const canDirectResolve = isAdmin && [REPORT_STATUS.IN_PROGRESS, REPORT_STATUS.ASSIGNED].includes(report.status);
  const canRejectRedirect = isAdmin && [REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW].includes(report.status);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Reports', to: '/reports' },
          { label: report.tracking_number || report.id },
        ]}
      />

      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <StatusBadge status={report.status} size="lg" />
          </div>
          <p className="text-sm text-gray-500">
            Tracking Number: <span className="font-mono font-semibold text-[#1a6b3c]">{report.tracking_number || report.id}</span>
            {' · '}Submitted {timeAgo(report.submittedAt)}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (main content) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Report Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900">{report.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Priority</p>
                <PriorityBadge priority={report.priority} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Submitted</p>
                <p className="text-sm text-gray-900">{formatDateTime(report.submittedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reporter</p>
                <p className="text-sm font-medium text-gray-900">{report.submittedBy?.name || 'Citizen'}</p>
                <p className="text-xs text-gray-500">{report.submittedBy?.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {report.description}
                </p>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Photos & Evidence</h2>
            <PhotoGallery
              photos={
                report.photos && report.photos.length > 0
                  ? report.photos
                  : report.photo_url
                  ? [report.photo_url]
                  : []
              }
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Location</h2>
            <MapPlaceholder location={report.location} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Kebele</p>
                <p className="text-sm font-medium text-gray-900">{report.location?.kebele}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">City</p>
                <p className="text-sm font-medium text-gray-900">{report.location?.city}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">Address / Landmark</p>
                <p className="text-sm text-gray-900">{report.location?.address}</p>
              </div>
            </div>
          </div>

          {/* Branch Transfers History (if any) */}
          {report.transfers && report.transfers.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">Branch Transfers History</h2>
              </div>
              <div className="space-y-3">
                {report.transfers.map((t) => (
                  <div key={t.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        {t.from_branch_name || 'Central'} → {t.to_branch_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                        t.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        t.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-gray-600">Reason: {t.reason}</p>
                    <p className="text-gray-400 text-[10px]">
                      Requested by {t.requested_by_name} on {formatDateTime(t.created_at)}
                    </p>
                    {t.review_comment && (
                      <p className="text-gray-600 italic mt-1">Review note: {t.review_comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Activity History</h2>
            <ActivityLog activity={report.activity} />
          </div>

          {/* Resolution Card */}
          {report.status === 'resolved' && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CircleCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-semibold text-emerald-900">Authoritative Resolution</h2>
              </div>
              <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                {report.resolution_notes || 'Civic issue was inspected, resolved, and verified by institutional administration.'}
              </p>
              {report.resolved_at && (
                <p className="text-xs text-gray-500">
                  Resolved on: <span className="font-medium text-gray-800">{formatDateTime(report.resolved_at)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right column (sidebar) ── */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Current Status</h3>
            <StatusBadge status={report.status} size="lg" />
            {report.status === 'submitted_for_review' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Field work completed. Awaiting Super Admin review and closure approval.</span>
              </div>
            )}
          </div>

          {/* Institutional Allocation Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Institutional Ownership</h3>

            {/* Branch */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Responsible Branch</p>
                <p className="text-sm font-semibold text-gray-900">
                  {report.branchName && report.branchName !== '—' ? report.branchName : 'Central Administration Branch'}
                </p>
                {report.branchCode && (
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {report.branchCode}
                  </span>
                )}
              </div>
            </div>

            {/* Staff Operative */}
            <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Assigned Operative</p>
                {report.assignedStaffName || report.assignedTo ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {report.assignedStaffName || report.assignedTo}
                    </p>
                    {report.assignedStaffPhone && (
                      <p className="text-xs text-gray-500">{report.assignedStaffPhone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">Unassigned (Awaiting allocation)</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Workflow Actions</h3>
            <div className="space-y-2.5">
              {/* Super Admin: Accept */}
              {canAccept && (
                <button
                  onClick={() => setShowAcceptModal(true)}
                  className="w-full py-2.5 bg-[#1a6b3c] hover:bg-[#145230] text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Accept Report Responsibility
                </button>
              )}

              {/* Staff Operative: Submit Work for Review */}
              {canSubmitCompletion && (
                <button
                  onClick={() => setShowSubmitCompletionModal(true)}
                  className="w-full py-2.5 bg-[#1a6b3c] hover:bg-[#145230] text-white font-semibold rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <SendHorizontal className="w-4 h-4" />
                  Submit Work for Review
                </button>
              )}

              {/* Super Admin: Completion Review */}
              {canReviewCompletion && (
                <button
                  onClick={() => setShowReviewCompletionModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Review Completion (Approve / Return)
                </button>
              )}

              {/* Super Admin: Assign / Reassign Staff */}
              {canAssign && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  {report.assigned_staff_id ? 'Reassign Staff Operative' : 'Assign to Staff Operative'}
                </button>
              )}

              {/* Super Admin: Branch Transfer */}
              {canTransferBranch && (
                <button
                  onClick={() => setShowTransferBranchModal(true)}
                  className="w-full py-2.5 border border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer to Another Branch
                </button>
              )}

              {/* Direct Resolve (Super Admin emergency closure) */}
              {canDirectResolve && (
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="w-full py-2.5 border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-medium rounded-lg text-sm transition-colors"
                >
                  Direct Resolve (Admin Override)
                </button>
              )}

              {/* Redirect & Reject */}
              {canRejectRedirect && (
                <>
                  <button
                    onClick={() => setShowRedirectModal(true)}
                    className="w-full py-2.5 border border-orange-300 text-orange-700 hover:bg-orange-50 font-medium rounded-lg text-sm transition-colors"
                  >
                    Redirect Report (Wrong Institution)
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
                  >
                    Reject Report
                  </button>
                </>
              )}

              {report.status === REPORT_STATUS.RESOLVED && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center font-medium">
                  ✓ Report successfully resolved and verified.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        title="Accept this report?"
        message="This report will be accepted by your institution and can then be assigned to responsible staff."
        confirmLabel="Accept Report"
        confirmVariant="primary"
        loading={actionLoading}
      />

      {/* Redirect Modal */}
      <Modal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        title="Redirect Report"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-gray-600 mb-4">
          Redirect this report to another institution or department.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Destination Institution / Department <span className="text-red-500">*</span>
            </label>
            <select
              value={redirectForm.destination}
              onChange={(e) => setRedirectForm((f) => ({ ...f, destination: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            >
              <option value="">Select institution or department</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={redirectForm.reason}
              onChange={(e) => setRedirectForm((f) => ({ ...f, reason: e.target.value }))}
              rows={3}
              placeholder="Explain why this report is being redirected..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setShowRedirectModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRedirect}
            disabled={actionLoading}
            className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading && <Loader2 className="animate-spin w-4 h-4" />}
            Redirect Report
          </button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Report"
        maxWidth="max-w-md"
      >
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for rejecting this report.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reject-reason"
                    value={r}
                    checked={rejectForm.reason === r}
                    onChange={() => setRejectForm((f) => ({ ...f, reason: r }))}
                    className="text-[#1a6b3c] focus:ring-[#1a6b3c]"
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Additional Explanation (optional)
            </label>
            <textarea
              value={rejectForm.explanation}
              onChange={(e) => setRejectForm((f) => ({ ...f, explanation: e.target.value }))}
              rows={3}
              placeholder="Provide any additional details..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setShowRejectModal(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading || !rejectForm.reason}
            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold disabled:opacity-50"
          >
            Reject Report
          </button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        report={report}
        onAssigned={() => {
          reloadReport();
          showToast('Staff operative assigned successfully.', 'success');
          setShowAssignModal(false);
        }}
      />

      {/* Resolve Modal */}
      <ResolveModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        report={report}
        currentUser={currentUser}
        onResolved={() => {
          reloadReport();
          showToast('Report marked as Resolved.', 'success');
          setShowResolveModal(false);
        }}
      />

      {/* Submit Completion Modal */}
      <SubmitCompletionModal
        isOpen={showSubmitCompletionModal}
        onClose={() => setShowSubmitCompletionModal(false)}
        report={report}
        onSubmitted={() => {
          reloadReport();
          showToast('Completion report submitted for admin review.', 'success');
        }}
      />

      {/* Review Completion Modal */}
      <ReviewCompletionModal
        isOpen={showReviewCompletionModal}
        onClose={() => setShowReviewCompletionModal(false)}
        report={report}
        onReviewed={() => {
          reloadReport();
          showToast('Completion review processed.', 'success');
        }}
      />

      {/* Branch Transfer Modal */}
      <TransferBranchModal
        isOpen={showTransferBranchModal}
        onClose={() => setShowTransferBranchModal(false)}
        report={report}
        onTransferred={() => {
          reloadReport();
          showToast('Branch transfer initiated.', 'success');
        }}
      />
    </div>
  );
}
