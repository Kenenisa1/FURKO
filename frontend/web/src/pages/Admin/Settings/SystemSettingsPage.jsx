import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Database, Save, RotateCcw, Loader2, Clock } from 'lucide-react';
import ConfirmationModal from '../../../components/ui/ConfirmationModal.jsx';

const DEFAULT_SETTINGS = {
  // Security preferences (UI only)
  sessionTimeout: 30,
  sessionWarning: 5,
  
  // Notification preferences
  reportUpdates: true,
  adminAlerts: true,
  systemNotifications: true,
  emailDigest: false,
  
  // UI preferences
  compactMode: false,
  showBadges: true,
};

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('furko_admin_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Save to localStorage
      localStorage.setItem('furko_admin_settings', JSON.stringify(settings));

      setHasChanges(false);
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setShowResetModal(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 400));

      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('furko_admin_settings', JSON.stringify(DEFAULT_SETTINGS));

      setHasChanges(false);
      setSuccessMessage('Settings reset to defaults');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure platform-wide settings and preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowResetModal(true)}
            disabled={loading || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">You have unsaved changes. Click "Save Changes" to apply them.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Information (Read-only) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Platform Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Name:</span>
              <span className="font-medium text-gray-900">FURKO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Development
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build:</span>
              <span className="font-medium text-gray-900">20261013</span>
            </div>
          </div>
        </div>

        {/* Security Settings (Frontend Preferences) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Security Preferences</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Session Timeout Display
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                UI preference only. Actual session timeout is managed by backend.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Inactivity Warning
              </label>
              <select
                value={settings.sessionWarning}
                onChange={(e) => handleSettingChange('sessionWarning', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] text-sm"
              >
                <option value={1}>1 minute before</option>
                <option value={5}>5 minutes before</option>
                <option value={10}>10 minutes before</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Report Updates</span>
              <input
                type="checkbox"
                checked={settings.reportUpdates}
                onChange={(e) => handleSettingChange('reportUpdates', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Administrative Alerts</span>
              <input
                type="checkbox"
                checked={settings.adminAlerts}
                onChange={(e) => handleSettingChange('adminAlerts', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">System Notifications</span>
              <input
                type="checkbox"
                checked={settings.systemNotifications}
                onChange={(e) => handleSettingChange('systemNotifications', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Daily Email Digest</span>
              <input
                type="checkbox"
                checked={settings.emailDigest}
                onChange={(e) => handleSettingChange('emailDigest', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            When backend is integrated, these preferences will control actual notification delivery.
          </p>
        </div>

        {/* Data Management (Read-only) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Database Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Mock Data
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Backup:</span>
              <span className="text-gray-900">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Used:</span>
              <span className="text-gray-900">Local Browser</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Database and backup operations require backend infrastructure.
          </p>
        </div>
      </div>

      {/* Additional UI Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700">Compact Mode</span>
              <p className="text-xs text-gray-500">Reduce spacing and padding throughout the interface</p>
            </div>
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700">Show Badge Counters</span>
              <p className="text-xs text-gray-500">Display notification badges in sidebar navigation</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showBadges}
              onChange={(e) => handleSettingChange('showBadges', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#1a6b3c] focus:ring-[#1a6b3c]"
            />
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Settings are saved locally in your browser. Frontend preferences
          (notifications, UI options) are stored in localStorage. Security and backend configurations
          require server-side implementation.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <ConfirmationModal
          isOpen={showResetModal}
          title="Reset Settings to Defaults"
          message="Are you sure you want to reset all settings to their default values? This action cannot be undone."
          confirmLabel="Reset to Defaults"
          confirmVariant="danger"
          onConfirm={handleReset}
          onClose={() => setShowResetModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
