import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
 label: string;
 value: string | number;
 icon: LucideIcon;
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
 return (
 <div className="bg-surface-raised border border-border rounded-md p-4">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs text-text-muted">{label}</p>
 <p className="text-xl font-semibold text-text-primary mt-0.5">{value}</p>
 </div>
 <div className="p-1.5 rounded-md bg-surface-elevated border border-border text-text-secondary">
 <Icon className="w-4 h-4" />
 </div>
 </div>
 </div>
 );
}
