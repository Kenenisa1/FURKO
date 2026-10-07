import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="animate-spin w-8 h-8 text-[#1a6b3c]" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
