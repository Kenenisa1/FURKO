// Summary stat card used on the dashboard
export default function SummaryCard({ icon, label, count, color, onClick }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   icon: 'text-blue-500' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100',    icon: 'text-red-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: 'text-orange-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', icon: 'text-yellow-600' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  icon: 'text-green-600' },
    gray:   { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   icon: 'text-gray-500' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} cursor-pointer hover:shadow-md transition-shadow text-left`}
    >
      <div className={`text-2xl ${c.icon}`}>{icon}</div>
      <div>
        <div className={`text-2xl font-bold leading-none ${c.text}`}>{count}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </button>
  );
}
