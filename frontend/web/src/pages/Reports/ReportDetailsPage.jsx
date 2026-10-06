import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import {
  acceptReport, redirectReport, rejectReport, getReportById,
} from '../../services/reportService.js';
import { REPORT_STATUS, mockInstitutions } from '../../data/mockReports.js';
import { mockStaff } from '../../data/mockStaff.js';

import StatusBadge from '../../components/ui/StatusBadge.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import PhotoGallery from '../../components/ui/PhotoGallery.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import AssignModal from './modals/AssignModal.jsx';
import ResolveModal from './modals/ResolveModal.jsx';

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

const TIMELINE_STAGES = ['Submitted', 'Under Review', 'Accepted', 'Assigned', 'In Progress', 'Resolved'];
const REJECTION_REASONS = ['Duplicate report', 'Insufficient information', 'Invalid report', 'Outside jurisdiction', 'Other'];

// ── Map placeholder ────────────────────────────────────────────────────────
function MapPlaceholder({ location }) {
  return (
    <div className="w-full h-48 rounded-xl bg-[#e8f5ee] border border-[#1a6b3c]/20 relative overflow-hidden flex items-center justify-center">
      {/* Grid lines for map feel */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1a6b3c" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Pin marker */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[#1a6b3c] flex items-center justify-center shadow-lg mb-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center shadow-sm border border-[#1a6b3c]/20">
          <p className="text-xs font-semibold text-[#1a6b3c]">{location?.kebele}</p>
          <p className="text-[10px] text-gray-500">{location?.city}</p>
          {location?.coordinates && (
            <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
              {location.coordinates.lat}°N, {location.coordinates.lng}°E
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Status Timeline ────────────────────────────────────────────────────────
function StatusTimeline({ timeline, status }) {
  const completedStages = timeline?.map((t) => t.stage) || [];
  const rejectedOrRedirected = status === REPORT_STATUS.REJECTED || status === REPORT_STATUS.REDIRECTED;

  return (
    <div className="flex items-start gap-0">
      {TIMELINE_STAGES.map((stage, i) => {
        const isCompleted = completedStages.includes(stage);
        const isCurrent   = !isCompleted && TIMELINE_STAGES[i - 1] && completedStages.includes(TIMELINE_STAGES[i - 1]);
        const entry       = timeline?.find((t) => t.stage === stage);

        return (
          <div key={stage} className="flex flex-col items-center flex-1">
            {/* Connector line + circle row */}
            <div className="flex items-center w-full">
              {i > 0 && (
                <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-[#1a6b3c]' : 'bg-gray-200'}`} />
              )}
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-[#1a6b3c] border-[#1a6b3c] text-white'
                    : isCurrent
                    ? 'bg-white border-[#1a6b3c] text-[#1a6b3c]'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              {i < TIMELINE_STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-[#1a6b3c]' : 'bg-gray-200'}`} />
              )}
            </div>
            {/* Label */}
            <p className={`text-[10px] mt-1.5 text-center px-1 font-medium leading-tight ${
              isCompleted ? 'text-[#1a6b3c]' : isCurrent ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {stage}
            </p>
            {entry && (
              <p className="text-[9px] text-gray-400 text-center px-1 mt-0.5 leading-tight">
                {new Date(entry.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Activity Log ───────────────────────────────────────────────────────────
function ActivityLog({ activity }) {
  if (!activity?.length) return <p className="text-sm text-gray-400">No activity yet.</p>;

  return (
    <div className="space-y-3">
      {[...activity].reverse().map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#e8f5ee] flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-[#1a6b3c]" />
          </div>
          <div>
            <p className="text-sm text-gray-800">{item.action}</p>
            <p className="text-xs text-gray-400">{formatDateTime(item.time)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateReportInState, showToast, addNotification, currentUser } = useApp();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal visibility
  const [showAcceptModal, setShowAcceptModal]   = useState(false);
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [showAssignModal, setShowAssignModal]   = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Redirect form state
  const [redirectForm, setRedirectForm] = useState({ destination: '', reason: '' });
  // Reject form state
  const [rejectForm, setRejectForm]   = useState({ reason: '', explanation: '' });

  useEffect(() => {
    setLoading(true);
    getReportById(id)
      .then((r) => setReport(r))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading report..." />;
  if (!report) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">Report not found.</p>
      <button onClick={() => navigate('/reports')} className="mt-4 text-[#1a6b3c] hover:underline text-sm">
        ← Back to Reports
      </button>
    </div>
  );

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
    const dest = mockInstitutions.find((i) => String(i.id) === redirectForm.destination);
    setActionLoading(true);
    try {
      const updated = await redirectReport(id, { destinationName: dest?.name || redirectForm.destination, reason: redirectForm.reason });
      setReport(updated);
      updateReportInState(updated);
      showToast(`Report redirected to ${dest?.name || redirectForm.destination}.`, 'success');
      addNotification({ type: 'redirect', title: 'Report Redirected', message: `Report ${id} redirected to ${dest?.name}.`, reportId: id });
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

  const canAccept   = [REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW].includes(report.status);
  const canAssign   = [REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW, REPORT_STATUS.ACCEPTED].includes(report.status);
  const canResolve  = [REPORT_STATUS.IN_PROGRESS, REPORT_STATUS.ASSIGNED].includes(report.status);
  const canRejectRedirect = [REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW].includes(report.status);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Reports', to: '/reports' },
        { label: report.id },
      ]} />

      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <StatusBadge status={report.status} size="lg" />
          </div>
          <p className="text-sm text-gray-500">
            Report ID: <span className="font-mono font-semibold text-[#1a6b3c]">{report.id}</span>
            {' · '}Submitted {timeAgo(report.submittedAt)}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* ── Left column (main content) ── */}
        <div className="col-span-2 space-y-6">

          {/* Report Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Submitted By</p>
                <p className="text-sm font-medium text-gray-900">{report.submittedBy?.name}</p>
                <p className="text-xs text-gray-500">{report.submittedBy?.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-800 leading-relaxed">{report.description}</p>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Photos</h2>
            <PhotoGallery photos={report.photos} />
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Woreda</p>
                <p className="text-sm font-medium text-gray-900">{report.location?.woreda}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="text-sm text-gray-900">{report.location?.address}</p>
              </div>
              {report.location?.coordinates && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">GPS Coordinates</p>
                  <p className="text-sm font-mono text-gray-900">
                    {report.location.coordinates.lat}°N, {report.location.coordinates.lng}°E
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Activity History</h2>
            <ActivityLog activity={report.activity} />
          </div>

          {/* Resolution */}
          {report.resolution && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-base font-semibold text-green-800">Resolution</h2>
              </div>
              <p className="text-sm text-gray-800 mb-3 leading-relaxed">{report.resolution.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Resolved By</p>
                  <p className="font-medium text-gray-800">{report.resolution.resolvedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Resolved At</p>
                  <p className="font-medium text-gray-800">{formatDateTime(report.resolution.resolvedAt)}</p>
                </div>
              </div>
              {report.resolution.photos?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Resolution Evidence</p>
                  <PhotoGallery photos={report.resolution.photos} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right column (sidebar) ── */}
        <div className="space-y-6">

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Status</h3>
            <StatusBadge status={report.status} size="lg" />
            {report.dueDate && (
              <div className="mt-3 text-xs text-gray-500">
                Due: <span className="font-medium text-gray-800">{report.dueDate}</span>
              </div>
            )}
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h3>
            {report.assignedTo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1a6b3c] text-white text-xs font-bold flex items-center justify-center">
                    {report.assignedTo.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{report.assignedTo}</p>
                    <p className="text-xs text-gray-500">{report.department}</p>
                  </div>
                </div>
                {report.assignmentNote && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mt-2 border border-gray-100">
                    {report.assignmentNote}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not assigned yet</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
            <div className="space-y-2">
              {canAccept && (
                <button
                  onClick={() => setShowAcceptModal(true)}
                  className="w-full py-2.5 bg-[#1a6b3c] hover:bg-[#145230] text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Accept Report
                </button>
              )}
              {canAssign && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Assign to Staff
                </button>
              )}
              {canResolve && (
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
              {canRejectRedirect && (
                <>
                  <button
                    onClick={() => setShowRedirectModal(true)}
                    className="w-full py-2.5 border border-orange-300 text-orange-700 hover:bg-orange-50 font-medium rounded-lg text-sm transition-colors"
                  >
                    Redirect Report
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg text-sm transition-colors"
                  >
                    Reject Report
                  </button>
                </>
              )}
              {![REPORT_STATUS.NEW, REPORT_STATUS.UNDER_REVIEW, REPORT_STATUS.ACCEPTED, REPORT_STATUS.ASSIGNED, REPORT_STATUS.IN_PROGRESS].includes(report.status) && (
                <p className="text-xs text-gray-400 text-center py-2">No further actions available.</p>
              )}
            </div>
          </div>

          {/* Progress timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress</h3>
            <StatusTimeline timeline={report.timeline} status={report.status} />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Accept */}
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

      {/* Redirect */}
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
              {mockInstitutions.map((inst) => (
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
            {actionLoading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            Redirect Report
          </button>
        </div>
      </Modal>

      {/* Reject */}
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

      {/* Assign */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        report={report}
        onAssigned={(updated) => {
          setReport(updated);
          updateReportInState(updated);
          showToast(`Report assigned to ${updated.assignedTo}.`, 'success');
          addNotification({ type: 'status_update', title: 'Report Assigned', message: `Report ${id} assigned to ${updated.assignedTo}.`, reportId: id });
          setShowAssignModal(false);
        }}
      />

      {/* Resolve */}
      <ResolveModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        report={report}
        currentUser={currentUser}
        onResolved={(updated) => {
          setReport(updated);
          updateReportInState(updated);
          showToast('Report marked as Resolved.', 'success');
          addNotification({ type: 'resolved', title: 'Report Resolved', message: `Report ${id} has been resolved.`, reportId: id });
          setShowResolveModal(false);
        }}
      />
    </div>
  );
}
