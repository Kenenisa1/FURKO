import { useState } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import { useApp } from '../../context/AppContext.jsx';

const FAQ = [
  { q: 'How do I accept a new report?', a: 'Open the report from the inbox, review the details, then click "Accept Report" in the Actions panel. You will be asked to confirm the action.' },
  { q: 'How do I assign a report to a staff member?', a: 'After accepting a report, click "Assign to Staff" in the Actions panel. Select the department and staff member, add any notes, and click Assign Report.' },
  { q: 'What does "Redirect" mean?', a: 'If a report belongs to a different institution or department, use Redirect to forward it. You must select the destination and provide a reason.' },
  { q: 'How do I mark a report as resolved?', a: 'Once the work is completed, open the report and click "Mark as Resolved". Add a resolution description and upload any evidence photos.' },
  { q: 'Can I search for a specific report by ID?', a: 'Yes. Use the search bar on the Dashboard or Reports page and type the report ID (e.g. FR-2026-001).' },
  { q: 'How are report priorities determined?', a: 'Priorities (Low, Medium, High, Critical) are set by the citizen when submitting the report and can be updated by institution staff.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-[#1a6b3c] transition-colors">
        <span className="text-sm font-medium text-gray-800">{q}</span>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function SupportPage() {
  const { showToast } = useApp();
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!issue.trim()) return;
    setSubmitted(true);
    showToast('Your issue has been submitted to the FURKO administrator.', 'success');
    setIssue('');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Support' }]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h1>
      <p className="text-sm text-gray-500 mb-6">Find answers or contact the FURKO support team.</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: FAQ */}
        <div className="col-span-2 space-y-5">
          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500 mb-4">Common questions about using the Institution Dashboard.</p>
            {FAQ.map((item, i) => <FAQItem key={i} {...item} />)}
          </div>

          {/* Report a technical issue */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Report a Technical Issue</h2>
            <p className="text-sm text-gray-500 mb-4">Experiencing a bug or technical problem? Let us know and we'll get it fixed.</p>
            {submitted ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-200">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800">Issue submitted. Our team will review it within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  rows={4}
                  placeholder="Describe the technical issue in detail..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c]"
                />
                <button type="submit" className="px-5 py-2 bg-[#1a6b3c] hover:bg-[#145230] text-white text-sm font-semibold rounded-lg transition-colors">
                  Submit Issue
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: contact info */}
        <div className="space-y-4">
          {/* Help Center */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1a6b3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Help Center</h3>
            </div>
            <p className="text-xs text-gray-500">Browse our documentation and user guides for detailed instructions on using the FURKO Institution Dashboard.</p>
          </div>

          {/* Contact admin */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Contact Administrator</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">For account issues, access requests, or escalations.</p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p><span className="font-medium">Email:</span> admin@furko.gov.et</p>
              <p><span className="font-medium">Phone:</span> +251-47-111-0000</p>
              <p><span className="font-medium">Hours:</span> Mon–Fri, 8:00–17:00</p>
            </div>
          </div>

          {/* Version */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">About FURKO</p>
            <p className="text-xs text-gray-500">Version 1.0.0 MVP</p>
            <p className="text-xs text-gray-400 mt-1">© 2026 FURKO Project</p>
            <p className="text-xs text-gray-400">Jimma City Administration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
