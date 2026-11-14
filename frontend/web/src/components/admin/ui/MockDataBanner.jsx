import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function MockDataBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('mock_banner_dismissed') === 'true';
  });

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem('mock_banner_dismissed', 'true');
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 mb-1">
            Development Mode: Using Mock Data
          </h4>
          <p className="text-sm text-blue-800">
            This interface is currently displaying demonstration data. All statistics, user accounts, 
            institutions, and reports shown are sample data for development and testing purposes only. 
            Changes will not persist after page refresh. Connect to the backend API to work with real data.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
