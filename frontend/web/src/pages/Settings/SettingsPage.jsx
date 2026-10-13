import { useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import { useApp } from '../../context/AppContext.jsx';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
      <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#1a6b3c]' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, showToast } = useApp();

  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    role: currentUser?.role || '',
  });

  const [notifications, setNotifications] = useState({
    newReports: true,
    statusUpdates: true,
    assignments: true,
    resolutions: false,
    weeklyDigest: true,
    emailAlerts: true,
    browserNotifications: false,
  });

  const [language, setLanguage] = useState('en');

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);

  function handleSaveProfile() {
    showToast('Profile settings saved.', 'success');
  }

  function handleSavePassword() {
    if (!passwords.current) { showToast('Please enter your current password.', 'error'); return; }
    if (passwords.new.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return; }
    if (passwords.new !== passwords.confirm) { showToast('Passwords do not match.', 'error'); return; }
    showToast('Password updated successfully.', 'success');
    setPasswords({ current: '', new: '', confirm: '' });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Settings' }]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <Section title="Profile Settings">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1a6b3c] text-white text-xl font-bold flex items-center justify-center">
            {profile.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.name}</p>
            <p className="text-sm text-gray-500">{profile.role} · {currentUser?.institution}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+251..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
            <input type="text" value={profile.role} disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
        </div>
        <button onClick={handleSaveProfile} className="px-5 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors">
          Save Profile
        </button>
      </Section>

      {/* Notifications */}
      <Section title="Notification Preferences">
        <ToggleRow label="New Reports" description="Notify when a new report is assigned to your institution" checked={notifications.newReports} onChange={(v) => setNotifications((n) => ({ ...n, newReports: v }))} />
        <ToggleRow label="Status Updates" description="Notify when a report status changes" checked={notifications.statusUpdates} onChange={(v) => setNotifications((n) => ({ ...n, statusUpdates: v }))} />
        <ToggleRow label="Assignments" description="Notify when a report is assigned to you" checked={notifications.assignments} onChange={(v) => setNotifications((n) => ({ ...n, assignments: v }))} />
        <ToggleRow label="Resolutions" description="Notify when a report is resolved" checked={notifications.resolutions} onChange={(v) => setNotifications((n) => ({ ...n, resolutions: v }))} />
        <ToggleRow label="Weekly Digest" description="Receive a weekly summary of institution activity" checked={notifications.weeklyDigest} onChange={(v) => setNotifications((n) => ({ ...n, weeklyDigest: v }))} />
        <ToggleRow label="Email Alerts" description="Send notifications to your email address" checked={notifications.emailAlerts} onChange={(v) => setNotifications((n) => ({ ...n, emailAlerts: v }))} />
        <div className="mt-4">
          <button onClick={() => showToast('Notification preferences saved.', 'success')} className="px-5 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors">
            Save Preferences
          </button>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <div className="space-y-4 max-w-sm">
          {['current', 'new', 'confirm'].map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 capitalize">
                {key === 'current' ? 'Current Password' : key === 'new' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwords[key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} className="rounded" />
            Show passwords
          </label>
          <button onClick={handleSavePassword} className="px-5 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors">
            Update Password
          </button>
        </div>
      </Section>

      {/* Language */}
      <Section title="Language Preference">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] bg-white min-w-[200px]"
          >
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
            <option value="om">Afaan Oromoo</option>
          </select>
          <button onClick={() => showToast('Language preference saved.', 'success')} className="px-5 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors">
            Save
          </button>
        </div>
      </Section>
    </div>
  );
}
