import { CheckCircle2, XCircle, Clock, AlertCircle, Star, Loader2, Circle, Ban, RotateCcw } from 'lucide-react';

interface StatusBadgeProps {
 status: string;
}

const config: Record<
 string,
 {
 label: string;
 className: string;
 icon: React.ComponentType<{ className?: string }> | null;
 }
> = {
 draft: { label: 'Draft', className: 'bg-surface-elevated text-text-secondary', icon: Circle },
 pending: { label: 'Pending', className: 'bg-warning/10 text-warning', icon: Clock },
 live: { label: 'Live', className: 'bg-success/10 text-success', icon: CheckCircle2 },
 paused: { label: 'Paused', className: 'bg-surface-elevated text-blue-700', icon: AlertCircle },
 confirmed: { label: 'Confirmed', className: 'bg-success/10 text-success', icon: CheckCircle2 },
 completed: { label: 'Completed', className: 'bg-surface-elevated text-blue-700', icon: CheckCircle2 },
 cancelled: { label: 'Cancelled', className: 'bg-error/10 text-error', icon: Ban },
 refunded: { label: 'Refunded', className: 'bg-surface-elevated text-text-secondary', icon: RotateCcw },
 approved: { label: 'Approved', className: 'bg-success/10 text-success', icon: CheckCircle2 },
 rejected: { label: 'Rejected', className: 'bg-error/10 text-error', icon: XCircle },
 processing: { label: 'Processing', className: 'bg-warning/10 text-warning', icon: Loader2 },
 paid: { label: 'Paid', className: 'bg-success/10 text-success', icon: CheckCircle2 },
 failed: { label: 'Failed', className: 'bg-error/10 text-error', icon: XCircle },
 verified: { label: 'Verified', className: 'bg-success/10 text-success', icon: CheckCircle2 },
 unverified: { label: 'Unverified', className: 'bg-warning/10 text-warning', icon: AlertCircle },
 featured: { label: 'Featured', className: 'bg-surface-raised/15 text-text-primary', icon: Star },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
 const normalized = status?.toLowerCase() ?? 'unknown';
 const { label, className, icon: Icon } = config[normalized] ?? {
 label: status,
 className: 'bg-surface-elevated text-text-secondary',
 icon: Circle,
 };

 return (
 <span
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}
 >
 {Icon && <Icon className="w-3.5 h-3.5" />}
 {label}
 </span>
 );
}
