import { PRIORITY } from '../../data/mockReports.js';

const CONFIG = {
  [PRIORITY.LOW]:      { text: 'text-green-600',  label: 'Low' },
  [PRIORITY.MEDIUM]:   { text: 'text-orange-500', label: 'Medium' },
  [PRIORITY.HIGH]:     { text: 'text-red-600',    label: 'High' },
  [PRIORITY.CRITICAL]: { text: 'text-red-800',    label: 'Critical' },
};

const FALLBACK = { text: 'text-gray-500', label: '—' };

export default function PriorityBadge({ priority }) {
  const cfg = CONFIG[priority] || FALLBACK;
  return (
    <span className={`font-semibold text-sm ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
