import { CheckCircle2, Clock } from 'lucide-react';

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function ActivityTimeline({ activities = [] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            {activity.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-orange-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-gray-500">{activity.actor}</p>
              <span className="text-xs text-gray-300">•</span>
              <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
            </div>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
      )}
    </div>
  );
}
