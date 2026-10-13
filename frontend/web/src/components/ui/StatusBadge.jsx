// Status badge — colour-coded per FURKO design
import { REPORT_STATUS } from '../../data/mockReports.js';

const CONFIG = {
  [REPORT_STATUS.NEW]:          { bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-500' },
  [REPORT_STATUS.UNDER_REVIEW]: { bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  [REPORT_STATUS.ACCEPTED]:     { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-600' },
  [REPORT_STATUS.ASSIGNED]:     { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  [REPORT_STATUS.IN_PROGRESS]:  { bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500' },
  [REPORT_STATUS.RESOLVED]:     { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  [REPORT_STATUS.REJECTED]:     { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-300',   dot: 'bg-gray-500' },
  [REPORT_STATUS.REDIRECTED]:   { bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
};

const FALLBACK = { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' };

export default function StatusBadge({ status, size = 'md' }) {
  const cfg = CONFIG[status] || FALLBACK;
  const sizeClass = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
