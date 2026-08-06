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
 className="absolute inset-0 bg-black/40"
 onClick={onClose}
 />
 <div className="relative bg-surface-raised w-full max-w-md h-full overflow-y-auto animate-in slide-in-from-right">
 <div className="flex items-center justify-between p-4 border-b border-border">
 <h3 className="text-lg font-bold text-text-primary">{title}</h3>
 <button
 onClick={onClose}
 className="p-2 rounded-md hover:bg-surface-elevated text-text-secondary"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-4">{children}</div>
 </div>
 </div>
 );
}
