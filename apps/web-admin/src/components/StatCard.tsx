import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'orange' | 'green' | 'blue' | 'red' | 'gray';
}

const colorMap = {
  orange: 'bg-angkor-orange/10 text-angkor-orange',
  green: 'bg-success-green/10 text-success-green',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-error-red/10 text-error-red',
  gray: 'bg-stone-gray/10 text-stone-gray',
};

export default function StatCard({ label, value, icon: Icon, color = 'orange' }: StatCardProps) {
  return (
    <div className="bg-card-white rounded-xl p-5 border border-stone-gray/10 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-gray mb-1">{label}</p>
          <p className="text-2xl font-bold text-stone-charcoal">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
