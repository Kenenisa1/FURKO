import { useState, useEffect } from 'react';
import { User, Mail, Shield, Building2, Save, X, Loader2 } from 'lucide-react';
import { getStoredAdminUser } from '../../../services/admin/adminAuthService.js';

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    institution: '',
  });

  useEffect(() => {
    const user = getStoredAdminUser();
    if (user) {
      setAdminUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'admin',
        institution: user.institution || 'FURKO System',
      });
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (adminUser) {
      setFormData({
        name: adminUser.name || '',
        email: adminUser.email || '',
        role: adminUser.role || 'admin',
        institution: adminUser.institution || 'FURKO System',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update stored user data (mock)
      const updatedUser = {
        ...adminUser,
        name: formData.name,
        institution: formData.institution,
      };

      sessionStorage.setItem('furko_admin_user', JSON.stringify(updatedUser));
      setAdminUser(updatedUser);

      setIsEditing(false);
      setSuccessMessage('Profile updated successfully (stored locally)');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!adminUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const initials = formData.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administrator Profile</h2>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors"
          >
            Edit Profile
          </button>
        )}
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

      {/* Mock Data Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Profile changes are stored locally in your browser session. When
          backend API is integrated, changes will be saved to the server.
        </p>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#1a6b3c] to-[#1a5c35] px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center font-bold text-2xl border-4 border-white/30">
              {initials}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{formData.name}</h3>
              <p className="text-white/80 text-sm mt-1">System Administrator</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.name}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact system administrator.
            </p>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4" />
              System Role
            </label>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                System Administrator
              </span>
              <span className="text-xs text-gray-600">Full access to all system features</span>
            </div>
          </div>

          {/* Institution/Organization */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4" />
              Organization
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
                placeholder="Enter organization name"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                {formData.institution || 'FURKO System'}
              </p>
            )}
          </div>

          {/* Permissions */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4" />
              Permissions
            </label>
            <div className="flex flex-wrap gap-2">
              {adminUser.permissions?.map((permission) => (
                <span
                  key={permission}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {permission.replace(/_/g, ' ')}
                </span>
              )) || (
                <span className="text-sm text-gray-500">No permissions listed</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1a6b3c] text-white rounded-lg hover:bg-[#145230] transition-colors disabled:opacity-60"
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
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Account ID:</span>
            <span className="font-medium text-gray-900">{adminUser.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Type:</span>
            <span className="font-medium text-gray-900">Administrator</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Session Storage:</span>
            <span className="font-medium text-gray-900">Browser Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
