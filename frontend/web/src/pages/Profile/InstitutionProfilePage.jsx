import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { getProfile, updateProfile } from '../../services/reportService.js';
import { useApp } from '../../context/AppContext.jsx';
import { Pencil, Users, Map, Calendar, Check, Loader2 } from 'lucide-react';

function InfoRow({ label, value, isEditing, onChange, name }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 flex items-start gap-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 flex-shrink-0 pt-2">{label}</p>
      {isEditing && onChange ? (
        <input
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]"
        />
      ) : (
        <p className="text-sm text-gray-800 flex-1 pt-1">{value || '—'}</p>
      )}
    </div>
  );
}

export default function InstitutionProfilePage() {
  const { showToast } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setFormData(data || {});
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      setEditing(false);
      showToast('Institution profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading institution profile..." />;

  const displayData = profile || {
    name: 'Jimma City Service Authority',
    type: 'Municipal Authority',
    address: 'Jimma City Administration Building, Jimma, Ethiopia',
    phone: '+251471112222',
    email: 'info@jimma.gov.et',
    website: 'www.jimma.gov.et',
    serviceArea: 'Jimma City (All 17 Kebeles)',
    established: '1994',
    staffCount: 1,
    responsibleCategories: ['Water & Sanitation', 'Road Infrastructure', 'Waste Management', 'Street Lighting'],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Institution Profile' }]} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{displayData.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{displayData.type}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : editing ? (
            <Check className="w-4 h-4" />
          ) : (
            <Pencil className="w-4 h-4" />
          )}
          {editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: main info */}
        <div className="col-span-2 space-y-6">

          {/* Institution information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Institution Information</h2>
            <InfoRow label="Institution Name" value={formData.name || displayData.name} isEditing={editing} onChange={handleChange} name="name" />
            <InfoRow label="Institution Code" value={displayData.code} isEditing={false} />
            <InfoRow label="Address" value={formData.address || displayData.address} isEditing={false} />
            <InfoRow label="Phone" value={formData.phone || displayData.phone} isEditing={editing} onChange={handleChange} name="phone" />
            <InfoRow label="Email" value={formData.email || displayData.email} isEditing={editing} onChange={handleChange} name="email" />
            <InfoRow label="Website" value={displayData.website} isEditing={false} />
            <InfoRow label="Description" value={formData.description || displayData.description} isEditing={editing} onChange={handleChange} name="description" />
            <InfoRow label="Service Area" value={displayData.serviceArea} isEditing={false} />
          </div>

          {/* Report categories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Handles Report Categories</h2>
            <div className="flex flex-wrap gap-2">
              {(displayData.responsibleCategories || []).map((cat) => (
                <span key={cat} className="px-3 py-1.5 bg-[#e8f5ee] text-[#1a6b3c] text-xs font-medium rounded-full border border-[#1a6b3c]/20">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: quick stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              {[
                { label: 'Active Staff', value: displayData.staffCount, icon: <Users className="w-5 h-5" /> },
                { label: 'Total Handled Reports', value: displayData.totalReports || 0, icon: <Map className="w-5 h-5" /> },
                { label: 'Operational Years', value: new Date().getFullYear() - parseInt(displayData.established || '1994'), icon: <Calendar className="w-5 h-5" /> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="text-[#1a6b3c]">{stat.icon}</span>
                  <div>
                    <p className="text-lg font-bold text-[#1a6b3c] leading-none">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#e8f5ee] rounded-2xl border border-[#1a6b3c]/20 p-5">
            <p className="text-xs font-semibold text-[#1a6b3c] mb-2">Institution Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-800">Active & Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
