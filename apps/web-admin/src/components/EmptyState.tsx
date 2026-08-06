import { Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
 title?: string;
 message?: string;
 icon?: 'search' | 'inbox';
 action?: {
 label: string;
 onClick: () => void;
 };
}

export default function EmptyState({
 title = 'No results found',
 message = 'Try adjusting your filters or search query.',
 icon = 'inbox',
 action,
}: EmptyStateProps) {
 const Icon = icon === 'search' ? Search : Inbox;

 return (
 <div className="bg-surface-raised rounded-md border border-border p-5 text-center">
 <div className="w-14 h-14 rounded-full bg-surface-elevated flex items-center justify-center mx-auto mb-4">
 <Icon className="w-7 h-7 text-text-secondary" />
 </div>
 <h3 className="text-base font-bold text-text-primary">{title}</h3>
 <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">{message}</p>
 {action && (
 <button
 onClick={action.onClick}
 className="mt-4 px-4 py-2 rounded-md bg-accent text-accent-inverse text-sm font-medium hover:bg-accent"
 >
 {action.label}
 </button>
 )}
 </div>
 );
}
