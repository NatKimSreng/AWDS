import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-stone-charcoal/40"
        onClick={onClose}
      />
      <div className="relative bg-card-white w-full max-w-md h-full shadow-xl overflow-y-auto animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-6 border-b border-stone-gray/10">
          <h3 className="text-lg font-bold text-stone-charcoal">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-gray/10 text-stone-gray"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
