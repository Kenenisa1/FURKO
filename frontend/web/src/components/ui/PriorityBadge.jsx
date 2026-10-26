const CONFIG = {
  low:      { text: 'text-green-600',  label: 'Low' },
  medium:   { text: 'text-orange-500', label: 'Medium' },
  high:     { text: 'text-red-600',    label: 'High' },
  critical: { text: 'text-red-800',    label: 'Critical' },
};

const FALLBACK = { text: 'text-gray-500', label: '—' };

export default function PriorityBadge({ priority }) {
  const normalized = (priority || '').toLowerCase();
  const cfg = CONFIG[normalized] || FALLBACK;
  return (
    <span className={`font-semibold text-sm ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
