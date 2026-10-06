import Modal from './Modal.jsx';

/**
 * A simple confirm/cancel modal.
 * Props:
 *   isOpen, onClose, onConfirm
 *   title, message
 *   confirmLabel (default "Confirm"), confirmVariant ('primary'|'danger')
 *   loading
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
  children,
}) {
  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-[#1a6b3c] hover:bg-[#145230] text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      {message && <p className="text-gray-600 text-sm leading-relaxed mb-4">{message}</p>}
      {children}
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmClass}`}
        >
          {loading && (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
