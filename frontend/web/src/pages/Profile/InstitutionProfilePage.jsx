import { useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';

const MOCK_PROFILE = {
  name: 'Jimma Water Service',
  type: 'Government Water Authority',
  address: 'Jimma City Administration Building, Woreda 1, Jimma, Ethiopia',
  phone: '+251471112222',
  email: 'info@jimmawater.gov.et',
  website: 'www.jimmawater.gov.et',
  serviceArea: 'Jimma City and surrounding Woredas (1–7)',
  established: '1994',
  staffCount: 42,
  services: [
    'Drinking water supply and distribution',
    'Water pipe maintenance and repair',
    'Water quality testing and monitoring',
    'Drainage and sanitation management',
    'Pipeline infrastructure development',
    'Community water access programs',
  ],
  responsibleCategories: [
    'Water Pipe Leakage',
    'Water Supply Disruption',
    'Pipeline Problems',
    'Drainage Blockage',
    'Water Quality Issues',
    'Contaminated Water',
  ],
};

function InfoRow({ label, value }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 flex items-start gap-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-gray-800 flex-1">{value}</p>
    </div>
  );
}

export default function InstitutionProfilePage() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Institution Profile' }]} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{MOCK_PROFILE.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{MOCK_PROFILE.type}</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: main info */}
        <div className="col-span-2 space-y-6">

          {/* Institution information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Institution Information</h2>
            <InfoRow label="Institution Name" value={MOCK_PROFILE.name} />
            <InfoRow label="Institution Type" value={MOCK_PROFILE.type} />
            <InfoRow label="Address" value={MOCK_PROFILE.address} />
            <InfoRow label="Phone" value={MOCK_PROFILE.phone} />
            <InfoRow label="Email" value={MOCK_PROFILE.email} />
            <InfoRow label="Website" value={MOCK_PROFILE.website} />
            <InfoRow label="Established" value={MOCK_PROFILE.established} />
            <InfoRow label="Service Area" value={MOCK_PROFILE.serviceArea} />
          </div>

          {/* Responsible services */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Responsible Services</h2>
            <ul className="space-y-2">
              {MOCK_PROFILE.services.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a6b3c] flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Report categories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Handles Report Categories</h2>
            <div className="flex flex-wrap gap-2">
              {MOCK_PROFILE.responsibleCategories.map((cat) => (
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
                { label: 'Total Staff', value: MOCK_PROFILE.staffCount, icon: '👥' },
                { label: 'Woredas Covered', value: '7', icon: '🗺️' },
                { label: 'Years Active', value: new Date().getFullYear() - parseInt(MOCK_PROFILE.established), icon: '📅' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="text-xl">{stat.icon}</span>
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
