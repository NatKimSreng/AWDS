import type { LucideIcon } from 'lucide-react';

interface InfoCardProps {
 title: string;
 children: React.ReactNode;
 className?: string;
 icon?: LucideIcon;
 action?: React.ReactNode;
}

export default function InfoCard({ title, children, className = '', icon: Icon, action }: InfoCardProps) {
 return (
 <div
 className={`bg-surface-raised rounded-md border border-border p-5 transition- hover: ${className}`}
 >
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 {Icon && (
 <div className="p-1.5 rounded-md bg-accent/10 text-text-primary">
 <Icon className="w-4 h-4" />
 </div>
 )}
 <h2 className="text-sm font-bold text-text-primary uppercase tracking-wide">{title}</h2>
 </div>
 {action && <div>{action}</div>}
 </div>
 {children}
 </div>
 );
}

interface InfoRowProps {
 label: string;
 value: React.ReactNode;
 icon?: LucideIcon;
}

export function InfoRow({ label, value, icon: Icon }: InfoRowProps) {
 return (
 <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-border last:border-b-0">
 <span className="text-sm text-text-secondary sm:w-1/3 flex items-center gap-1.5">
 {Icon && <Icon className="w-3.5 h-3.5 text-text-secondary/70" />}
 {label}
 </span>
 <span className="text-sm text-text-primary sm:w-2/3">{value ?? '—'}</span>
 </div>
 );
}

interface MetricCardProps {
 label: string;
 value: React.ReactNode;
 icon?: LucideIcon;
 color?: 'orange' | 'green' | 'blue' | 'gray' | 'gold';
}

const colorClasses = {
 orange: 'bg-accent/10 text-text-primary',
 green: 'bg-success/10 text-success',
 blue: 'bg-surface-elevated text-blue-700',
 gray: 'bg-surface-elevated text-text-secondary',
 gold: 'bg-surface-raised/15 text-text-primary',
};

export function MetricCard({ label, value, icon: Icon, color = 'orange' }: MetricCardProps) {
 return (
 <div className="bg-surface rounded-md p-4 transition-transform hover:-translate-y-0.5">
 <p className="text-xs text-text-secondary uppercase">{label}</p>
 <p className="text-xl font-bold text-text-primary flex items-center gap-2 mt-1">
 {Icon && <div className={`p-1 rounded-md ${colorClasses[color]}`}><Icon className="w-4 h-4" /></div>}
 {value}
 </p>
 </div>
 );
}
