import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
 title?: string;
 message?: string;
 onRetry?: () => void;
}

export default function ErrorState({
 title = 'Something went wrong',
 message = 'We couldn\'t load the data. Please try again.',
 onRetry,
}: ErrorStateProps) {
 return (
 <div className="bg-error/10 rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
 <AlertCircle className="w-6 h-6 text-error shrink-0" />
 <div className="flex-1">
 <h3 className="text-base font-bold text-error">{title}</h3>
 <p className="text-sm text-error/80 mt-0.5">{message}</p>
 </div>
 {onRetry && (
 <button
 onClick={onRetry}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-error text-accent-inverse text-sm font-medium hover:bg-error"
 >
 <RefreshCw className="w-4 h-4" />
 Retry
 </button>
 )}
 </div>
 );
}
