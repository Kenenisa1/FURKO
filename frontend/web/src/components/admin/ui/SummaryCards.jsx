export default function SummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
              {card.trend && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`text-xs font-semibold ${
                      card.trend.direction === 'up'
                        ? card.trend.isPositive
                          ? 'text-green-600'
                          : 'text-red-600'
                        : card.trend.direction === 'down'
                        ? card.trend.isPositive
                          ? 'text-red-600'
                          : 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {card.trend.direction === 'up' && '↑'}
                    {card.trend.direction === 'down' && '↓'}
                    {card.trend.value}
                  </span>
                  <span className="text-xs text-gray-500">{card.trend.label}</span>
                </div>
              )}
            </div>
            {card.icon && (
              <div
                className={`flex-shrink-0 p-3 rounded-lg ${
                  card.iconBg || 'bg-gray-100'
                }`}
              >
                <div className={card.iconColor || 'text-gray-600'}>{card.icon}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
