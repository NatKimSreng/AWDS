interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  draft: 'bg-stone-gray/10 text-stone-gray',
  pending: 'bg-amber-100 text-amber-700',
  live: 'bg-success-green/10 text-success-green',
  paused: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-success-green/10 text-success-green',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-error-red/10 text-error-red',
  refunded: 'bg-stone-gray/10 text-stone-gray',
  approved: 'bg-success-green/10 text-success-green',
  rejected: 'bg-error-red/10 text-error-red',
  submitted: 'bg-amber-100 text-amber-700',
  paid: 'bg-success-green/10 text-success-green',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() ?? 'unknown';
  const className = styles[normalized] ?? 'bg-stone-gray/10 text-stone-gray';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}>
      {status}
    </span>
  );
}
