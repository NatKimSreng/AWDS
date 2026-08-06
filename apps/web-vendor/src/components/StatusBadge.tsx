interface StatusBadgeProps {
 status: string;
}

const styles: Record<string, string> = {
 draft: 'text-text-muted',
 pending: 'text-warning',
 live: 'text-success',
 paused: 'text-text-secondary',
 confirmed: 'text-success',
 completed: 'text-text-secondary',
 cancelled: 'text-error',
 refunded: 'text-text-muted',
 approved: 'text-success',
 rejected: 'text-error',
 submitted: 'text-warning',
 paid: 'text-success',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
 const normalized = status?.toLowerCase() ?? 'unknown';
 const className = styles[normalized] ?? 'text-text-muted';

 return (
 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${className}`}>
 {status}
 </span>
 );
}
