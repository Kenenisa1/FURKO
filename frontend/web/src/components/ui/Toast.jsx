import { useApp } from '../../context/AppContext.jsx';
import { Check, X as XIcon, Info } from 'lucide-react';

const ICONS = {
  success: <Check className="w-5 h-5 text-green-600" />,
  error: <XIcon className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const BG = {
  success: 'bg-white border-l-4 border-green-500',
  error:   'bg-white border-l-4 border-red-500',
  info:    'bg-white border-l-4 border-blue-500',
};

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl shadow-lg mb-2 min-w-[300px] max-w-[420px] ${BG[toast.type] || BG.info}`}
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type] || ICONS.info}</div>
      <p className="text-sm text-gray-800 flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
