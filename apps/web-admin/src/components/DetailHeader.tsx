import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface DetailHeaderProps {
 title: string;
 subtitle?: string;
 backTo?: string;
 backLabel?: string;
 actions?: React.ReactNode;
 meta?: { label: string; value: string | number; icon?: LucideIcon }[];
}

export default function DetailHeader({ title, subtitle, backTo, backLabel, actions, meta }: DetailHeaderProps) {
 const navigate = useNavigate();

 return (
 <div className="space-y-4">
 <button
 onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
 className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 {backLabel ?? 'Back'}
 </button>

 <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
 <div className="flex items-start gap-4">
 <button
 onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
 className="hidden sm:flex p-2.5 rounded-md bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-accent transition shrink-0"
 aria-label="Go back"
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <div>
 <h1 className="text-2xl font-bold text-text-primary font-heading">{title}</h1>
 {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
 {meta && meta.length > 0 && (
 <div className="flex flex-wrap items-center gap-3 mt-3">
 {meta.map((item) => {
 const Icon = item.icon;
 return (
 <div
 key={item.label}
 className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-xs text-text-secondary"
 >
 {Icon && <Icon className="w-3.5 h-3.5 text-text-primary" />}
 <span className="font-medium text-text-primary">{item.value}</span>
 <span>{item.label}</span>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 {actions && (
 <div className="flex flex-wrap items-center gap-2 lg:justify-end">
 {actions}
 </div>
 )}
 </div>
 </div>
 );
}
