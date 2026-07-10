import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface LoadingOverlayProps {
  message: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-lg">
        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}
